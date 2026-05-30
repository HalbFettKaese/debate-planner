<script setup lang="ts">
import { onMounted } from 'vue';
import MemberSlot from './MemberSlot.vue';
import { useAppStore, type SlotDefinition } from '@/stores/app';
import RoomOptions from './RoomOptions.vue';
import RoomActions from './RoomActions.vue';
import SlotTitle from './SlotTitle.vue'

const appStore = useAppStore()

onMounted(() => {
    if (appStore.initialized) return
    appStore.initialized = true
    appStore.addRoom()
})

function filterUnsorted(roomId: string, slots: SlotDefinition[]): SlotDefinition[] {
    if (appStore.rooms.length > 2 || roomId === 'rootUnsorted') {
        return [{
            id: 'unsorted',
            free: false
        },{
            id: 'unsortedJury',
            free: false
        }].concat(slots)
    }
    return slots
}

</script>

<template>
    <div
        v-for="room of appStore.rooms"
        :key="room.id"
        style="display: flex; flex-direction: row;"
    >
        <RoomOptions :roomId="room.id"></RoomOptions>
        <v-sheet class="room">
            <table style="table-layout: fixed;width:100%; column-gap:20px;">
                <thead>
                <tr>
                    <td
                        v-for="slot of filterUnsorted(room.id, room.slots)"
                        :key="slot.id"
                    >
                        <div>
                            <SlotTitle :roomId="room.id" :slot="slot" style="float:left;"/>
                            
                            <RoomActions :roomId="room.id" :slotId="slot.id" style="float:left;margin-left:10px;"></RoomActions>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td v-for="slot of filterUnsorted(room.id, room.slots)" :key="slot.id">
                        <v-divider></v-divider>
                    </td>
                </tr>
                </thead>
                <tbody>
                <tr style="margin-top:5px;">
                    <MemberSlot
                        v-for="slot of filterUnsorted(room.id, room.slots)"
                        :roomId="room.id"
                        :slotId="slot.id"
                        :memberNames="appStore.getRoomMembers(room.id)[slot.id] ?? []"
                    ></MemberSlot>
                </tr>
                </tbody>
            </table>
        </v-sheet>
    </div>
</template>

<style scoped>
.room {
    padding: 10px;
    margin-bottom: 10px;
    box-shadow: 0px 1px 2px 0px rgba(var(--v-shadow-color), var(--v-shadow-key-opacity, 0.3)), 0px 2px 6px 2px rgba(var(--v-shadow-color), var(--v-shadow-ambient-opacity, 0.15));
    border-radius: 20px;
    width: 100%;
    height: fit-content;
}

td {
    padding-right: 5px;
    padding-left: 5px;
}
</style>