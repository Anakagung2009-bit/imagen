import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",  // Jika perlu menonaktifkan aturan
      '@next/next/no-img-element': 'off', // Menonaktifkan peringatan no-img-element
      'prefer-const': 'off', // Menonaktifkan aturan prefer-const
      'react-hooks/exhaustive-deps': 'off', // Menonaktifkan aturan exhaustive-deps
      'no-warning-comments': 'off', // Menonaktifkan semua warning komentar
      'no-console': 'off', // Menonaktifkan peringatan terkait console
      'react/jsx-no-target-blank': 'off', // Menonaktifkan peringatan terkait target="_blank"
    },
  },
];

export default eslintConfig;
