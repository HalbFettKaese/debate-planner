<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>{{ t('title') }}</v-app-bar-title>
      <LanguageSelect />
      <v-btn
        icon="mdi-theme-light-dark"
        @click="$vuetify.theme.cycle()"
      />
      <v-btn icon="mdi-github" href="https://github.com/HalbFettKaese/debate-planner"></v-btn>
    </v-app-bar>
    <v-main>
      <v-container max-width="100%">
        <Plan></Plan>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import LanguageSelect from './components/LanguageSelect.vue'
import { useI18n } from 'vue-i18n'
import Plan from './components/Plan.vue';
import { watch } from 'vue';
const { t, locale } = useI18n()

function updateLocale() {
  document.title = t('title')
}
watch(locale, updateLocale)
</script>
