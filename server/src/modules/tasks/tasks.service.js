
const pool = require("../../config/database");
const ApiError = require("../../utils/ApiError");

const STATUSES = [
  "todo",
  "in_progress",
  "review",
  "done",
  "blocked",
];

async function verifyProject(client, projectId) {
  const result = await client.query(
    "SELECT id FROM projects WHERE id = $1",
    [projectId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Project not found");
  }
}

async function verifyTeam(client, projectId, teamId, creator) {
  if (creator.role === "team_leader" && !teamId) {
    throw new ApiError(400, "Team leaders must create tasks for their assigned team");
  }

  if (!teamId) return;

  const result = await client.query(
    `SELECT t.id, t.leader_id
     FROM teams t
     WHERE t.id = $1 AND t.project_id = $2`,
    [teamId, projectId]
  );

  if (!result.rowCount) {
    throw new ApiError(400, "The selected team does not belong to this project");
  }

  if (
    creator.role === "team_leader" &&
    result.rows[0].leader_id !== creator.id
  ) {
    throw new ApiError(403, "You can create tasks only for your assigned team");
  }
}

async function verifyAssignees(client, projectId, teamId, userIds) {
  const uniqueIds = [...new Set(userIds)];

  if (!uniqueIds.length) return;

  const result = await client.query(
    `SELECT
       u.id,
       u.is_active,
       r.name AS role,
       EXISTS (
         SELECT 1
         FROM project_members pm
         WHERE pm.project_id = $1
           AND pm.user_id = u.id
       ) AS is_project_member,
       EXISTS (
         SELECT 1
         FROM team_members tm
         WHERE tm.team_id = $2
           AND tm.user_id = u.id
       ) AS is_team_member
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = ANY($3::uuid[])`,
    [projectId, teamId, uniqueIds]
  );

  if (result.rowCount !== uniqueIds.length) {
    throw new ApiError(400, "One or more selected users do not exist");
  }

  for (const user of result.rows) {
    if (!user.is_active) {
      throw new ApiError(400, "Inactive users cannot be assigned");
    }

    if (!["team_member", "qa_reviewer"].includes(user.role)) {
      throw new ApiError(
        400,
        "Only team members and QA reviewers can be assigned to tasks"
      );
    }

    if (!user.is_project_member) {
      throw new ApiError(400, "Every assignee must belong to the project");
    }

    if (
      user.role === "team_member" &&
      teamId &&
      !user.is_team_member
    ) {
      throw new ApiError(
        400,
        "A team member must belong to the selected team"
      );
    }
  }

  return uniqueIds;
}

async function insertAssignees(
  client,
  taskId,
  userIds,
  assignedBy
) {
  for (const userId of userIds) {
    await client.query(
      `INSERT INTO task_assignees (task_id, user_id, assigned_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (task_id, user_id) DO NOTHING`,
      [taskId, userId, assignedBy]
    );
  }
}

async function createTask(projectId, data, currentUser) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await verifyProject(client, projectId);
    await verifyTeam(client, projectId, data.teamId, currentUser);

    const assigneeIds = await verifyAssignees(
      client,
      projectId,
      data.teamId || null,
      data.assigneeIds || []
    );

    const result = await client.query(
      `INSERT INTO tasks (
         project_id,
         team_id,
         created_by,
         title,
         description,
         status,
         priority,
         due_date,
         estimated_hours
       )
       VALUES ($1, $2, $3, $4, $5, 'todo', $6, $7, $8)
       RETURNING *`,
      [
        projectId,
        data.teamId || null,
        currentUser.id,
        data.title,
        data.description || null,
        data.priority || "medium",
        data.dueDate || null,
        data.estimatedHours ?? null,
      ]
    );

    const task = result.rows[0];

    await insertAssignees(
      client,
      task.id,
      assigneeIds,
      currentUser.id
    );

    await client.query("COMMIT");

    return getTask(task.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listTasks(projectId, filters, currentUser) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const offset = (page - 1) * limit;

  const conditions = ["t.project_id = $1"];
  const values = [projectId];
  let index = 2;

  if (filters.status) {
    conditions.push(`t.status = $${index++}`);
    values.push(filters.status);
  }

  if (filters.priority) {
    conditions.push(`t.priority = $${index++}`);
    values.push(filters.priority);
  }

  if (filters.teamId) {
    conditions.push(`t.team_id = $${index++}`);
    values.push(filters.teamId);
  }

  if (filters.assigneeId) {
    conditions.push(`EXISTS (
      SELECT 1 FROM task_assignees a
      WHERE a.task_id = t.id AND a.user_id = $${index++}
    )`);
    values.push(filters.assigneeId);
  }

  if (filters.search) {
    conditions.push(
      `(t.title ILIKE $${index} OR COALESCE(t.description, '') ILIKE $${index})`
    );
    values.push(`%${filters.search}%`);
    index++;
  }

  if (currentUser.role === "team_member" || currentUser.role === "qa_reviewer") {
    conditions.push(`(
      EXISTS (
        SELECT 1 FROM task_assignees a
        WHERE a.task_id = t.id AND a.user_id = $${index}
      )
      OR EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = t.project_id AND pm.user_id = $${index}
      )
    )`);
    values.push(currentUser.id);
    index++;
  }

  const whereClause = conditions.join(" AND ");

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM tasks t
     WHERE ${whereClause}`,
    values
  );

  const result = await pool.query(
    `SELECT
       t.*,
       creator.full_name AS creator_name,
       team.name AS team_name,
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'id', assignee.id,
             'fullName', assignee.full_name,
             'email', assignee.email
           )
         ) FILTER (WHERE assignee.id IS NOT NULL),
         '[]'
       ) AS assignees
     FROM tasks t
     LEFT JOIN users creator ON creator.id = t.created_by
     LEFT JOIN teams team ON team.id = t.team_id
     LEFT JOIN task_assignees ta ON ta.task_id = t.id
     LEFT JOIN users assignee ON assignee.id = ta.user_id
     WHERE ${whereClause}
     GROUP BY t.id, creator.full_name, team.name
     ORDER BY
       CASE t.priority
         WHEN 'urgent' THEN 1
         WHEN 'high' THEN 2
         WHEN 'medium' THEN 3
         ELSE 4
       END,
       t.due_date ASC NULLS LAST,
       t.created_at DESC
     LIMIT $${index} OFFSET $${index + 1}`,
    [...values, limit, offset]
  );

  const total = countResult.rows[0].total;

  return {
    tasks: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getTask(taskId) {
  const result = await pool.query(
    `SELECT
       t.*,
       creator.full_name AS creator_name,
       team.name AS team_name,
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'id', u.id,
             'fullName', u.full_name,
             'email', u.email
           )
         ) FILTER (WHERE u.id IS NOT NULL),
         '[]'
       ) AS assignees
     FROM tasks t
     LEFT JOIN users creator ON creator.id = t.created_by
     LEFT JOIN teams team ON team.id = t.team_id
     LEFT JOIN task_assignees a ON a.task_id = t.id
     LEFT JOIN users u ON u.id = a.user_id
     WHERE t.id = $1
     GROUP BY t.id, creator.full_name, team.name`,
    [taskId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Task not found");
  }

  return result.rows[0];
}

async function updateTask(taskId, data) {
  const fields = {
    title: "title",
    description: "description",
    priority: "priority",
    dueDate: "due_date",
    estimatedHours: "estimated_hours",
    actualHours: "actual_hours",
  };

  const updates = [];
  const values = [];
  let index = 1;

  for (const [key, column] of Object.entries(fields)) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      updates.push(`${column} = $${index++}`);
      values.push(data[key] === "" ? null : data[key]);
    }
  }

  if (!updates.length) {
    throw new ApiError(400, "No task fields were provided");
  }

  updates.push("updated_at = NOW()");
  values.push(taskId);

  const result = await pool.query(
    `UPDATE tasks
     SET ${updates.join(", ")}
     WHERE id = $${index}
     RETURNING id`,
    values
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Task not found");
  }

  return getTask(taskId);
}

async function updateTaskStatus(taskId, status) {
  if (status === "done") {
    const pending = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM task_dependencies td
       JOIN tasks dependency
         ON dependency.id = td.depends_on_task_id
       WHERE td.task_id = $1
         AND dependency.status <> 'done'`,
      [taskId]
    );

    if (pending.rows[0].total > 0) {
      throw new ApiError(
        400,
        "Complete all dependent tasks before completing this task"
      );
    }
  }

  const completedAt = status === "done" ? new Date() : null;

  const result = await pool.query(
    `UPDATE tasks
     SET status = $1,
         completed_at = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING id`,
    [status, completedAt, taskId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Task not found");
  }

  return getTask(taskId);
}

async function assignUsers(taskId, userIds, currentUser) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const taskResult = await client.query(
      "SELECT project_id, team_id FROM tasks WHERE id = $1 FOR UPDATE",
      [taskId]
    );

    if (!taskResult.rowCount) {
      throw new ApiError(404, "Task not found");
    }

    const task = taskResult.rows[0];

    const uniqueIds = await verifyAssignees(
      client,
      task.project_id,
      task.team_id,
      userIds
    );

    await insertAssignees(
      client,
      taskId,
      uniqueIds,
      currentUser.id
    );

    await client.query("COMMIT");
    return getTask(taskId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function removeAssignee(taskId, userId) {
  const result = await pool.query(
    `DELETE FROM task_assignees
     WHERE task_id = $1 AND user_id = $2
     RETURNING *`,
    [taskId, userId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Task assignment not found");
  }

  return result.rows[0];
}

async function deleteTask(taskId) {
  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1 RETURNING id",
    [taskId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Task not found");
  }

  return result.rows[0];
}

async function listSubtasks(taskId) {
  const result = await pool.query(
    `SELECT *
     FROM subtasks
     WHERE task_id = $1
     ORDER BY position ASC, created_at ASC`,
    [taskId]
  );

  return result.rows;
}

async function createSubtask(taskId, data, currentUser) {
  const result = await pool.query(
    `INSERT INTO subtasks
       (task_id, title, description, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      taskId,
      data.title,
      data.description || null,
      currentUser.id,
    ]
  );

  return result.rows[0];
}

async function updateSubtask(taskId, subtaskId, data) {
  const fields = {
    title: "title",
    description: "description",
    isCompleted: "is_completed",
  };

  const updates = [];
  const values = [];
  let index = 1;

  for (const [key, column] of Object.entries(fields)) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      updates.push(`${column} = $${index++}`);
      values.push(data[key]);
    }
  }

  if (!updates.length) {
    throw new ApiError(400, "No subtask fields were provided");
  }

  updates.push("updated_at = NOW()");
  values.push(taskId, subtaskId);

  const result = await pool.query(
    `UPDATE subtasks
     SET ${updates.join(", ")}
     WHERE task_id = $${index}
       AND id = $${index + 1}
     RETURNING *`,
    values
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Subtask not found");
  }

  return result.rows[0];
}

async function deleteSubtask(taskId, subtaskId) {
  const result = await pool.query(
    `DELETE FROM subtasks
     WHERE task_id = $1 AND id = $2
     RETURNING *`,
    [taskId, subtaskId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Subtask not found");
  }

  return result.rows[0];
}

async function addDependency(taskId, dependsOnTaskId, currentUser) {
  if (taskId === dependsOnTaskId) {
    throw new ApiError(400, "A task cannot depend on itself");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tasksResult = await client.query(
      `SELECT id, project_id, status
       FROM tasks
       WHERE id = ANY($1::uuid[])
       FOR UPDATE`,
      [[taskId, dependsOnTaskId]]
    );

    if (tasksResult.rowCount !== 2) {
      throw new ApiError(404, "Both tasks must exist");
    }

    const currentTask = tasksResult.rows.find((t) => t.id === taskId);
    const dependencyTask = tasksResult.rows.find(
      (t) => t.id === dependsOnTaskId
    );

    if (currentTask.project_id !== dependencyTask.project_id) {
      throw new ApiError(400, "Task dependencies must be within the same project");
    }

    // Prevent cycles: if the proposed dependency already depends
    // directly or indirectly on this task, reject the new relationship.
    const cycle = await client.query(
      `WITH RECURSIVE dependency_chain(task_id) AS (
         SELECT depends_on_task_id
         FROM task_dependencies
         WHERE task_id = $1

         UNION

         SELECT td.depends_on_task_id
         FROM task_dependencies td
         JOIN dependency_chain dc
           ON td.task_id = dc.task_id
       )
       SELECT 1
       FROM dependency_chain
       WHERE task_id = $2
       LIMIT 1`,
      [dependsOnTaskId, taskId]
    );

    if (cycle.rowCount) {
      throw new ApiError(400, "This dependency would create a cycle");
    }

    const result = await client.query(
      `INSERT INTO task_dependencies
         (task_id, depends_on_task_id, created_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (task_id, depends_on_task_id) DO NOTHING
       RETURNING *`,
      [taskId, dependsOnTaskId, currentUser.id]
    );

    await client.query("COMMIT");

    return result.rows[0] || {
      task_id: taskId,
      depends_on_task_id: dependsOnTaskId,
      alreadyExists: true,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listDependencies(taskId) {
  const result = await pool.query(
    `SELECT
       td.id,
       td.depends_on_task_id,
       t.title,
       t.status,
       t.due_date
     FROM task_dependencies td
     JOIN tasks t ON t.id = td.depends_on_task_id
     WHERE td.task_id = $1
     ORDER BY t.created_at ASC`,
    [taskId]
  );

  return result.rows;
}

async function removeDependency(taskId, dependencyId) {
  const result = await pool.query(
    `DELETE FROM task_dependencies
     WHERE task_id = $1 AND id = $2
     RETURNING *`,
    [taskId, dependencyId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Task dependency not found");
  }

  return result.rows[0];
}

async function reviewTask(taskId, data) {
  const result = await pool.query(
    `UPDATE tasks
     SET qa_status = $1,
         qa_feedback = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [
      data.qaStatus,
      data.qaFeedback || null,
      taskId,
    ]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Task not found");
  }

  return result.rows[0];
}

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  assignUsers,
  removeAssignee,
  deleteTask,
  listSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  addDependency,
  listDependencies,
  removeDependency,
  reviewTask,
};
