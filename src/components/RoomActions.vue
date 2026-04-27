<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import { useI18n } from 'vue-i18n';
import { distributeAll, distributeRoom } from '@/util/distribute'

const { t } = useI18n()
const props = defineProps<{
    roomId: string,
    slotId: string,
}>()

const appStore = useAppStore()

const rootUnsorted = props.roomId === 'rootUnsorted'

function retrieve() {
    var count = (appStore.getRoomMembers(props.roomId)[props.slotId] ?? []).length
    const location = { room: props.roomId, slot: props.slotId }
    if (rootUnsorted) {
        for (const memberName of Object.keys(appStore.members)) {
            const member = appStore.members[memberName]
            if (member.parent || (member.location.room === 'rootUnsorted')) continue
            appStore.moveMember(memberName, {...location, index: count})
            count += 1
        }
        return
    }
    const slots = appStore.getRoomMembers(props.roomId)
    for (const slotName of Object.keys(slots)) {
        if (slotName === props.slotId) continue
        for (const memberName of slots[slotName]) {
            if (appStore.members[memberName].parent) continue
            appStore.moveMember(memberName, {...location, index: count})
            count += 1
        }
    }
}
</script>

<template>
    <div
        v-if="slotId === 'unsorted'"
        style="margin-left:30px;display:flex; flex-direction: row;"
    >
        <v-btn
            icon
            density="comfortable"
            color="green"
            @click="retrieve()"
        >
            <v-icon icon="mdi-arrow-bottom-left"></v-icon>
            <v-tooltip activator="parent" location="bottom">{{ t('tooltipRetrieve') }}</v-tooltip>
        </v-btn>
        <v-btn
            v-if="rootUnsorted"
            class="spacing"
            icon
            density="comfortable"
            color="green"
            @click="distributeAll(appStore, true)"
        >
            <v-icon icon="mdi-swap-vertical"></v-icon>
            <v-tooltip activator="parent" location="bottom">{{ t('tooltipDistributeRooms') }}</v-tooltip>
        </v-btn>
        <v-btn
            class="spacing"
            icon
            density="comfortable"
            color="green"
            @click="rootUnsorted ? distributeAll(appStore) : distributeRoom(appStore, roomId)"
        >
            <v-icon icon="mdi-shuffle"></v-icon>
            <v-tooltip activator="parent" location="bottom">
                <template v-if="rootUnsorted">{{ t('tooltipDistributeSlots') }}</template>
                <template v-else>{{ t('tooltipDistribute') }}</template>
            </v-tooltip>
        </v-btn>
</div>
</template>

<style scoped>
.spacing {
    margin-left:5px;
}
</style>