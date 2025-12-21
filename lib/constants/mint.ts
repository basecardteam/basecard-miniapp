/**
 * Mint 페이지에서 사용하는 상수들
 */

export const MAX_SKILLS = 8;
export const MAX_WEBSITES = 3;

export const ALL_SKILLS = [
    "Solidity",
    "Rust",
    "Security",
    "Javascript",
    "Typescript",
    "Go",
    "Game development",
    "Data",
    "UI/UX",
    "Prototyping",
    "Research",
    "Music",
    "Illustration",
    "Writing",
    "Video",
    "Graphic design",
    "Animation",
    "Visual design",
    "Design",
    "Digital art",
    "Photography",
    "Community",
    "Product management",
    "Strategy",
    "Business development",
    "Legal",
    "Marketing",
] as const;

export const ROLES = ["Developer", "Designer", "Marketer", "Founder", "BD", "PM"] as const;

export type Role = (typeof ROLES)[number];
export type Skill = (typeof ALL_SKILLS)[number];

