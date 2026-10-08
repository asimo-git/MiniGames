import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.{test,spec}.ts', // the tests themselves, not the application code
        'src/api/types.ts', // only type/interface, no executable code
        'src/utils/types.ts', // only type/interface, no executable code
        'src/api/firebase.ts', // only initialization of the Firebase SDK and handles for pulling its logic, without application logic
        'src/main.ts', // entry point: connects styles and starts the router
        'src/data/**', // static configuration data, no logic
      ],
      reporter: ['text', 'html'],
    },
  },
});
