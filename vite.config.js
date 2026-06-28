import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig(async () => {
  const plugins = [];

  if (isDev) {
    const { default: mkcert } = await import('vite-plugin-mkcert');
    plugins.push(mkcert({ hosts: ['localhost', '192.168.100.2'] }));
  }

  plugins.push({
    name: 'fix-mindar-import-method',
    enforce: 'pre',
    load(id) {
      const cleanId = id.split('?')[0];
      if (cleanId.endsWith('mindar-image-three.prod.js')) {
        let code = readFileSync(cleanId, 'utf-8');
        return code.replace(/\basync import\(/g, "async ['import'](");
      }
    },
  });

  return {
    plugins,
    server: {
      host: true,
      port: 5175,
    },
    optimizeDeps: {
      include: ['three'],
      exclude: ['mind-ar'],
    },
  };
});
