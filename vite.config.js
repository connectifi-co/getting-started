import { resolve } from 'path';
import { defineConfig } from 'vite';

const port = 9090;
const apiHost = process.env.API_HOST || `http://localhost:${port}`;

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      root: '.',
      build: {
        outDir: './serve'
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
      server: {
        port: port,
        open: '/examples/index.html',
          proxy: {
          '/api': apiHost,
        }
      }
    };
  }
})