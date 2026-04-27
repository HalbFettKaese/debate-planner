<script setup lang="ts">
import { computed, mergeProps, useAttrs, useSlots, type Ref } from 'vue'

const attrs = useAttrs()
const slots = useSlots()

const {
    selectOptions,
    valueRef,
    selectOptionNaming = (key) => key,
    selectOptionValues = (key) => key,
} = defineProps<{
    selectOptions: string[],
    valueRef: Ref<any>,
    selectOptionNaming?: (key: string) => string,
    selectOptionValues?: (key: string) => any,
}>()

const model = computed({
    get: () => {
        return [ valueRef.value ]
    },
    set: (sel: [string]) => {
        valueRef.value = sel[0]
    }
})
</script>

<template>
    <v-menu>
        <template v-slot:activator="{ props: menu }">
            <template v-if="Object.keys(slots).length !== 0">
                <v-btn v-bind="mergeProps(menu, attrs)"><slot></slot></v-btn>
            </template>
            <template v-else>
                <v-btn v-bind="mergeProps(menu, attrs)"></v-btn>
            </template>
        </template>
        <v-list v-model:selected="model">
            <v-list-item
                v-for="langKey in selectOptions"
                :key="langKey"
                :value="selectOptionValues(langKey)"
            >
                <v-list-item-title>{{ selectOptionNaming(langKey) }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
