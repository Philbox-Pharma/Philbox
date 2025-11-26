// eslint.config.js
import js from "@eslint/js";

export default [
  {
    ...js.configs.recommended,

    ignores: [
      // Dependencies
      "node_modules",
      "package-lock.json",
      "yarn.lock",

      // Environment files
      ".env",
      ".env.local",
      ".env.production",
      ".env.development",

      // Testing
      "coverage",

      // Build outputs
      "dist",
      "build",

      // Logs
      "logs",
      "*.log",
      "npm-debug.log*",

      // Misc
      ".DS_Store",
      "uploads",
      "temp"
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    },
  },
];
