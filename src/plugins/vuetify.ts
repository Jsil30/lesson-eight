import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'dashboardDark',
    themes: {
      dashboardDark: {
        dark: true,
        colors: {
          background: '#0f1117',
          surface: '#181b24',
          'surface-bright': '#1f2330',
          primary: '#818cf8',
          secondary: '#2dd4bf',
          accent: '#c4b5fd',
          info: '#38bdf8',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
          'on-surface': '#f1f5f9',
          'on-background': '#f1f5f9',
        },
        variables: {
          'high-emphasis-opacity': 0.95,
          'medium-emphasis-opacity': 0.78,
          'border-color': '#f1f5f9',
          'border-opacity': 0.14,
        },
      },
    },
  },
  defaults: {
    VCard: {
      rounded: 'lg',
      elevation: 0,
      border: true,
    },
  },
})
