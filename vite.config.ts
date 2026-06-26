import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works on a GitHub Pages project subpath
  // (erelado.github.io/ai-conversation-journey-investigator/) and locally.
  base: './',
  plugins: [react()],
})
