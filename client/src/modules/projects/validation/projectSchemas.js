import { z } from 'zod';
export const projectSchema=z.object({name:z.string().min(3),client:z.string().min(2),dueDate:z.string().min(1),description:z.string().optional()});
