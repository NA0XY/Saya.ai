import { z } from 'zod';
import { EnvSchema } from '../config/env';

export type Env = z.infer<typeof EnvSchema>;
