import { MAX_SKILLS, MAX_WEBSITES, ROLES } from "@/lib/constants/mint";
import { z } from "zod";

/**
 * Mint 폼 유효성 검사 스키마
 */
export const mintFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    role: z.enum(ROLES, {
        message: "Role is required",
    }),
    bio: z.string().optional(),
    github: z.string().optional(),
    farcaster: z.string().optional(),
    x: z.string().optional(),
    linkedin: z.string().optional(),
    websites: z
        .array(z.string().url("Invalid URL"))
        .max(MAX_WEBSITES, `Maximum ${MAX_WEBSITES} websites allowed`),
    selectedSkills: z
        .array(z.string())
        .max(MAX_SKILLS, `Maximum ${MAX_SKILLS} skills allowed`),
    profileImageFile: z.instanceof(File).optional().nullable(),
});

export type MintFormData = z.infer<typeof mintFormSchema>;
