import { z } from 'zod';
export const taskSchema=z.object({title:z.string().min(3),project:z.string().min(1),assignee:z.string().min(1),status:z.string(),priority:z.string(),dueDate:z.string().min(1)});
