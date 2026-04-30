<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import { computed } from 'vue';

const appStore = useAppStore()

const props = defineProps<{
    memberName: string,
    maxWidth?: boolean,
    drop?: (event: DragEvent) => any,
    dragover?: (event: DragEvent) => any,
}>()

const id = () => undefined

const member = appStore.members[props.memberName]

const dragStart = (event: DragEvent) => {
    appStore.dragging = props.memberName;
}

const hidden = computed(() => props.memberName === appStore.dragging)
</script>

<template>
    <div :data-ignore="hidden ? '' : undefined">
        <v-chip
            class="card"
            :class="{ hidden, maxWidth, new: !member.experienced }"
            @dragstart="dragStart($event)"
            @dragend="appStore.dragging = undefined"
            draggable
            close-icon="mdi-close"
            closable
            @click:close="appStore.deleteMember(memberName)"
            @dblclick="appStore.unlink(memberName)"
            @drop="(drop ?? id)($event)"
            @dragover="(dragover ?? id)($event)"
        >
            {{ memberName }}
        </v-chip>
    </div>
</template>

<style scoped>
.card {
    margin: 2px 2px 2px 0px;
}
.new {
    background-color: rgb(var(--v-theme-green));
}
.hidden {
    display: none;
}

.maxWidth {
    width: 100%;
    margin: 0px;
}
</style>