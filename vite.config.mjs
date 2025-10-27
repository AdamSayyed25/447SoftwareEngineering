import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/447SoftwareEngineering/', // 👈 must match your repo name
})
