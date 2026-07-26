import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' にすることでリポジトリ名に依存せず GitHub Pages で動作する
export default defineConfig({
  base: './',
  plugins: [react()],
})
