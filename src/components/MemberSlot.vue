<script setup lang="ts">
import MemberParty from './MemberParty.vue'
import { ref, computed, useTemplateRef } from 'vue';
import { useAppStore } from '@/stores/app';
import CreateChip from './CreateChip.vue';

const appStore = useAppStore()

const container = useTemplateRef('container')
const placeholderIdx = ref<number>()
const ignoreCount = ref(0)

const props = defineProps<{
    roomId: string,
    slotId: string,
    memberNames: string[],
}>()

const isRootUnsorted = props.roomId === 'rootUnsorted'

const isHorizontal = isRootUnsorted

const contents = computed(() => {
    if (placeholderIdx.value === undefined) {
        return props.memberNames
    }
    const cards = [...props.memberNames] as (string | undefined)[]
    cards.splice(placeholderIdx.value, 0, undefined)
    return cards
})

const drop = (event: DragEvent) => {
    const memberName = appStore.dragging
    if (memberName !== undefined && placeholderIdx.value !== undefined) {
        appStore.moveMember(memberName, {
            index: placeholderIdx.value - ignoreCount.value,
            room: props.roomId,
            slot: props.slotId,
        })
    }
    placeholderIdx.value = undefined
}

function dragover(event: DragEvent) {
    if (!container.value) return
    const children = container.value.children
    ignoreCount.value = 0
    for (var i = 0; i < children.length; i++) {
        const child = children[i]
        const rect = child.getBoundingClientRect()
        const ignore = child.hasAttribute('data-ignore')
        const border = isHorizontal ? (ignore ? rect.right : rect.left + 10) : (ignore ? rect.bottom : rect.top + 10)
        const cursor = isHorizontal ? event.clientX : event.clientY
        if (cursor <= border) {
            placeholderIdx.value = i
            event.preventDefault()
            return;
        }
        if (ignore) {
            ignoreCount.value += 1
        }
    }
    placeholderIdx.value = children.length
    event.preventDefault()
}

function dragleave(event: DragEvent) {
    if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as HTMLElement))
        return;
    placeholderIdx.value = undefined
}

</script>

<template>
    <VCol
        @dragleave="dragleave($event)"
        @dragover="dragover($event)"
        @drop="drop($event)"
    >
        <v-divider></v-divider>
        <div
            class="card-container"
            ref="container"
            :class="{ isHorizontal }"
        >
            <MemberParty
                v-for="memberName in contents"
                :key="memberName"
                :memberName="memberName ?? 'placeholder'"
            ></MemberParty>
            <CreateChip v-if="roomId === 'rootUnsorted'"></CreateChip>
        </div>
    </VCol>
</template>

<style scoped>

.card-container {
    display: flex;
    flex-direction: column;
    min-height: 80px;
}

.isHorizontal {
    flex-direction: row;
    flex-wrap: wrap;
}

</style>