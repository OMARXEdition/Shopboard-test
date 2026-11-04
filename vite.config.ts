import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Shopboard-test/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Split Three.js core and renderer while keeping the scene lazy-loaded.
          groups: [
            {
              name: 'three',
              test: /node_modules[\\/]three[\\/]/,
              maxSize: 500_000,
            },
          ],
        },
      },
    },
  },
})
