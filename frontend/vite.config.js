import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 👇 El export debe ser así
export default defineConfig({
  // base: "./app/", para el IIS y para producción
  base: "/", // para desarrollo con railway
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});



/*import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8081", // Solo se usa en desarrollo
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});*/
