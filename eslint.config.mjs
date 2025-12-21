import nextPlugin from "eslint-config-next";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = [
    ...nextPlugin,
    {
        plugins: {
            "unused-imports": unusedImports,
        },
        rules: {
            "indent": ["error", 4],
            "max-len": ["error", { code: 150 }],
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];

export default eslintConfig;
