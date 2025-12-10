import { z } from "zod";

const envSchema = z.object({
    NEXT_PUBLIC_BACKEND_API_URL: z.string().default("http://api.basecard.org"),
    NEXT_PUBLIC_LOG_LEVEL: z
        .enum(["debug", "info", "warn", "error"])
        .optional()
        .default("info"),
    NEXT_PUBLIC_ENABLE_LAZY_LOAD_TEST: z.boolean().optional().default(false),
});

const _env = envSchema.safeParse({
    NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
    NEXT_PUBLIC_ENABLE_LAZY_LOAD_TEST:
        process.env.NEXT_PUBLIC_ENABLE_LAZY_LOAD_TEST === "true"
            ? true
            : undefined,
});

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    throw new Error("Invalid environment variables");
}

export const config = {
    BACKEND_API_URL: _env.data.NEXT_PUBLIC_BACKEND_API_URL,
    LOG_LEVEL: _env.data.NEXT_PUBLIC_LOG_LEVEL,
    ENABLE_LAZY_LOAD_TEST: _env.data.NEXT_PUBLIC_ENABLE_LAZY_LOAD_TEST,
};
