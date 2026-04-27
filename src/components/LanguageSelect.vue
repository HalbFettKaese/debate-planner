<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import IconDropdown from './IconDropdown.vue';
const i18n = useI18n();
</script>

<template>
    <IconDropdown
        :select-options="i18n.availableLocales"
        :value-ref="i18n.locale"
        :select-option-naming="(key) => i18n.messages.value[key].nativeName.toString()"
        icon="mdi-web"
    ></IconDropdown>
</template>
