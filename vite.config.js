import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy API calls to backend during development
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  
  // Production build configuration
  build: {
    outDir: "dist",
    sourcemap: false, // Disable source maps in production for security
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["framer-motion", "lucide-react", "recharts"],
        },
      },
    },
  },
  
  // Preview server (for production build testing)
  preview: {
    port: 4173,
    strictPort: true,
  },
});

