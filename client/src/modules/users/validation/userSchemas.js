import { z } from 'zod';
export const userSchema = z.object({ name:z.string().min(2), email:z.email(), role:z.string().min(1) });
