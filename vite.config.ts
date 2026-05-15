import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tailwindcss from '@tailwindcss/vite'
import tsrxSolid from '@tsrx/vite-plugin-solid';
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  base: "/ghost_note/",
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tsrxSolid(),
    tanstackStart({ prerender: { enabled: true } }),
    solidPlugin({ ssr: true }),
  ],
})
