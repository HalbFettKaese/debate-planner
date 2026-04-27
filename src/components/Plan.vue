<script setup lang="ts">
import { onMounted } from 'vue';
import MemberSlot from './MemberSlot.vue';
import { useAppStore, type RoomDefinition } from '@/stores/app';
import { useI18n } from 'vue-i18n';
import RoomOptions from './RoomOptions.vue';
import RoomActions from './RoomActions.vue';
import SlotTitle from './SlotTitle.vue'

const { t } = useI18n()

const appStore = useAppStore()

onMounted(() => {
    if (appStore.initialized) return
    appStore.initialized = true
    appStore.addRoom()
})

</script>

<template>
    <div
        v-for="room of appStore.rooms"
        :key="room.id"
        style="display: flex; flex-direction: row;"
    >
        <RoomOptions :roomId="room.id"></RoomOptions>
        <VTable
            class="room"
        >
            <VRow>
                <VCol
                    v-for="slot of room.slots"
                    :key="slot.id"
                >
                    <div style="display:flex;flex-direction: row;">
                        <SlotTitle :roomId="room.id" :slot="slot" />
                        
                        <RoomActions :roomId="room.id" :slotId="slot.id"></RoomActions>
                    </div>
                </VCol>
            </VRow>
            <VRow style="margin-top:5px;">
                <MemberSlot
                    v-for="slot of room.slots"
                    :roomId="room.id"
                    :slotId="slot.id"
                    :memberNames="appStore.getRoomMembers(room.id)[slot.id] ?? []"
                ></MemberSlot>
            </VRow>
        </VTable>
    </div>
</template>

<style scoped>
.room {
    padding: 10px;
    margin-bottom: 10px;
    box-shadow: 0px 1px 2px 0px rgba(var(--v-shadow-color), var(--v-shadow-key-opacity, 0.3)), 0px 2px 6px 2px rgba(var(--v-shadow-color), var(--v-shadow-ambient-opacity, 0.15));
    border-radius: 20px;
    width: 100%;
}
</style>