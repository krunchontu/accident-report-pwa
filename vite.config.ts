import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'nominatim-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'SG Accident Kaki',
        short_name: 'Accident Kaki',
        description: 'Field-ready motor accident documentation tool for Singapore drivers. Guided photos, GIA eligibility check, deadline tracking, and PDF export. Works offline.',
        theme_color: '#1B2A4A',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        id: '/',
        scope: '/',
        lang: 'en-SG',
        dir: 'ltr',
        categories: ['productivity', 'utilities', 'lifestyle'],
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Report New Accident',
            short_name: 'New Report',
            url: '/#/accident/triage',
            description: 'Start documenting a new accident immediately',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'View Past Reports',
            short_name: 'Reports',
            url: '/#/records',
            description: 'View and manage your saved accident reports',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Emergency Numbers',
            short_name: 'Emergency',
            url: '/#/emergency-numbers',
            description: 'Quick access to Singapore emergency contacts',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
          },
        ],
      },
    }),
  ],
})
