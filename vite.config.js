import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // "prompt", ne "autoUpdate": aplikacija se ne smije sama ponovno
      // ucitati dok netko mjeri vrijeme poveza.
      registerType: "prompt",
      includeAssets: ["icons/favicon.svg"],
      manifest: {
        name: "TCCC Trainer",
        short_name: "TCCC",
        description:
          "Training tool for TCCC students. Training only, no patient data.",
        lang: "hr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        // Boje su iz tamne teme (surface-000 i brand-500).
        background_color: "#0a0b0c",
        theme_color: "#0a0b0c",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Podaci (march, questions, scenarios, casualty-card) su uvezeni u
        // paket, pa ulaze u predmemoriju zajedno s JS-om.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            // Fontovi dolaze s mreze, a aplikacija mora raditi bez nje:
            // nakon prvog ucitavanja sluze se iz predmemorije.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // Radnik se ne registrira u razvoju, da HMR ostane predvidljiv.
        enabled: false,
      },
    }),
  ],
});
