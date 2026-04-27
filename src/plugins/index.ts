import {createPinia} from 'pinia';
/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'

// Plugins
import vuetify from './vuetify'


import { languages } from '../config/lang'
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: languages,
})

export function registerPlugins (app: App) {
 app.use(vuetify)
 app.use(createPinia())
 app.use(i18n)
}