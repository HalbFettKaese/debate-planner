<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import MemberChip from './MemberChip.vue';
import { computed, onMounted } from 'vue';

const props = defineProps<{
    memberName: string,
}>()

const appStore = useAppStore()

const member = appStore.members[props.memberName]

const children = member?.children

const isPlaceholder = props.memberName === 'placeholder'

const hidden = computed(() => props.memberName === appStore.dragging)

const isNew = !member?.experienced

function dragover(event: DragEvent) {
    event.preventDefault()
}

function drop(event: DragEvent){
    if (appStore.dragging) {
        appStore.addChild(props.memberName, appStore.dragging)
        appStore.dragging = undefined
    }
}
</script>

<template>
    <template v-if="isPlaceholder">
        <div data-ignore>
            <v-chip
                class="card placeholder"
                style="pointer-events: none;"
                data-ignore
                :base-color="'#00000000'"
            >{{ appStore.dragging ?? '' }}</v-chip>
        </div>
    </template>
    <MemberChip
        v-else-if="children.length === 0"
        :member-name="memberName"
        @drop="drop($event)"
        @dragover="dragover($event)"
    ></MemberChip>
    <v-sheet
        v-else
        :class="{ isNew, hidden }"
        :data-ignore="hidden ? '' : undefined"
        elevation="5"
        
        style="width:fit-content;height:fit-content;border-radius:19px;margin:2px;"
        :border="'md'"
        @drop="drop($event)"
        @dragover="dragover($event)"
    >
        <MemberChip
            :member-name="memberName"
            :max-width="true"
        ></MemberChip>
        <template
            v-for="childName of children"
            :key="childName"
        >
            <MemberChip
                :member-name="childName"
                :max-width="true"
            ></MemberChip>
        </template>
    </v-sheet>
</template>

<style scoped>
.card {
    margin: 2px 2px 2px 0px;
}
.placeholder {
    border-style: dashed;
    border-width: 2px;
}
.hidden {
    display: none;
}

.isNew {
    border-color: color-mix(in srgb, rgb(var(--v-border-color)) 12%, rgb(var(--v-theme-green)));
    --v-border-opacity: 100%;
}
</style>