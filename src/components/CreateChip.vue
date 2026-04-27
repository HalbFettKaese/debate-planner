<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import { useTemplateRef, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const appStore = useAppStore()

const { t } = useI18n()

const isNew = ref(false)

const name = ref<string>('')

const fake_div = useTemplateRef('fakeDiv')
const input = useTemplateRef('input')

const fakeDivWidth = ref(10)

const updateWidth = () => {
    if (fake_div.value && input.value) {
        fake_div.value.innerText = name.value.length > 0 ? name.value : input.value.getAttribute('placeholder') ?? ''
        fakeDivWidth.value = fake_div.value.clientWidth + 12
    }
}
onMounted(updateWidth)

function addMember() {
    if (name.value.length == 0) return
    appStore.addMember(name.value, !isNew.value)
    name.value = ''
    updateWidth()
}
function keydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        addMember()
    }
}
function toggleNew() {
    isNew.value = !isNew.value
    
    if (input.value) {
        input.value.focus()
    }
}
</script>

<template>
    <v-chip
        class="card"
        :class="{ new: isNew }"
        data-ignore
    >
        <input
            v-model="name"
            @keydown="keydown($event)"
            @input="updateWidth()"
            ref="input"
            :style="{width: fakeDivWidth + 'px'}"
            :placeholder="t('name_placeholder')"
        ></input>
        <v-btn
            icon
            density="compact"
            style="margin-left:5px;"
            :color="isNew ? undefined : 'green'"
            @click="toggleNew()"
        >
            <v-icon icon="mdi-school"></v-icon>
            <v-tooltip activator="parent" location="bottom">{{ t('tooltipToggleNew') }}</v-tooltip>
        </v-btn>
        <v-btn
            icon
            density="compact"
            style="margin-left:5px;margin-right:-5px;"
            @click="addMember()"
        >
            <v-icon icon="mdi-plus"></v-icon>
            <v-tooltip activator="parent" location="bottom">{{ t('tooltipAddMember') }}</v-tooltip>
        </v-btn>
        <div class="fake_div" ref="fakeDiv"></div>
    </v-chip>
</template>
<style scoped>
.card {
    margin: 2px 2px 2px 0px;
}
.new {
    background-color: rgb(var(--v-theme-green));
}
.fake_div {
    position: absolute;
    left: -100500vw;
    top: -100500vh;
}

input {
    font-family: inherit;
    border: none;
    border-radius: 8px;
    background: rgba(var(--v-theme-editbg), 0.3);
    padding-left: 5px;
    margin-left: -2px;
}
input:focus {
    outline: none;
}
</style>