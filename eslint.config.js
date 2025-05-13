/**
 * Najprostsza wersja konfiguracji ESLint, która powinna działać
 * bez względu na wersje pakietów.
 */
export default [
  {
    // Podstawowe zasady dla wszystkich plików
    ignores: [
      "node_modules/**",
      "dist/**", 
      "build/**",
      "*.min.js",
      "coverage/**",
      ".astro/**",
    ],
    // Globalne reguły dla wszystkich plików JS/TS
    rules: {
      // Typowe zasady JS
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "warn",
    }
  }
];
