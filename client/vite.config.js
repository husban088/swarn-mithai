import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Production build me console.log / debugger nahi jate (chhota + tez JS)
  esbuild: process.env.NODE_ENV === "production" || process.argv.includes("build") ? { drop: ["console", "debugger"] } : {},
  server: {
    port: 5173,
    proxy: { "/api": { target: "http://localhost:5000", changeOrigin: true } },
  },
  build: {
    target: "es2019",
    cssCodeSplit: true,
    reportCompressedSize: false,
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // React + router alag chunk: browser ise lamba cache karta hai, har deploy par dobara download nahi hota
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
