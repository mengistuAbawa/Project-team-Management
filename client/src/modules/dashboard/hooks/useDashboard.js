import { useMemo } from 'react';
import { demoProjects, demoTasks } from '../../../data/mockData.js';
export function useDashboard() {
  return useMemo(() => ({
    projectCount: demoProjects.length,
    taskCount: demoTasks.length,
    completedTasks: demoTasks.filter((task) => task.status === 'Done').length,
  }), []);
}
