import { z } from 'zod';
import path from 'path';
import * as dotenv from 'dotenv';

// Attempt to load .env from current directory, package directory, or parent
dotenv.config();
if (!process.env.DB_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), 'time-tracking-app/.env') });
}
if (!process.env.DB_URL) {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const envSchema = z.object({
    PORT: z.coerce
        .number()
        .int('PORT must be an integer')
        .positive('PORT must be positive')
        .default(5050),
    DB_URL: z
        .string()
        .min(1, 'DB_URL cannot be empty')
        .regex(/^mongodb(\+srv)?:\/\/.+/, 'DB_URL must be a valid MongoDB connection string (e.g. mongodb://... or mongodb+srv://...)'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment configuration:');
    parsedEnv.error.issues.forEach((issue) => {
        console.error(`  - [${issue.path.join('.') || 'ENV'}]: ${issue.message}`);
    });
    process.exit(1);
}

export const env = parsedEnv.data;
export type Env = z.infer<typeof envSchema>;
