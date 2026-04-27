/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        dark: false,
        colors: {
          green: "rgb(60, 219, 49)",
          editbg: '#ffffff'
        }
      },
      dark: {
        dark: true,
        colors: {
          green: 'rgb(31, 115, 31)',
          editbg: '#000000'
        }
      }
    }
  },
})
