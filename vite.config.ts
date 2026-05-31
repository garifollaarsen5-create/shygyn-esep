import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { viteSingleFile } from "vite-plugin-singlefile";

// SINGLEFILE=1 болса — бәрін бір index.html ішіне біріктіреді
// (екі рет басып ашуға болатын нұсқа, серверсіз).
const singleFile = process.env.SINGLEFILE === "1";

// Базасы салыстырмалы болсын — қай хостингте де (GitHub Pages, Netlify) істейді
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    ...(singleFile ? [viteSingleFile()] : []),
    ...(singleFile ? [] : [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "ШығынЕсеп — шығынды есептеу",
        short_name: "ШығынЕсеп",
        description: "Жеке шығындарыңызды бақылайтын қосымша",
        theme_color: "#0E7A5F",
        background_color: "#0F1512",
        display: "standalone",
        orientation: "portrait",
        lang: "kk",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    ]),
  ],
});
