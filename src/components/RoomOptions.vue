<script setup lang="ts">
import { debateStyles } from '@/config/debatestyles';
import { useAppStore } from '@/stores/app';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    roomId: string,
}>()

const appStore = useAppStore()

const index = computed(() => appStore.rooms.findIndex(r => r.id === props.roomId))
const room = computed(() => appStore.rooms[index.value])

const { t } = useI18n()

const debateStyle = defineModel({
    get: () => room.value.format,
    set: (style: typeof room.value.format) => {
        
        if (appStore.rooms[index.value].format === style) return
        appStore.setRoomType(index.value, style)
    }
})

</script>

<template>
    <div v-if="roomId !== 'rootUnsorted'" style="display: flex; flex-direction: column; margin-right: 10px; margin-bottom:10px; height:fit-content;">
        <v-text-field
            v-model="room.displayName"
            density="compact"
            :placeholder="t('room_name_placeholder') + room.id"
            hide-details
        ></v-text-field>
        <v-select
            :label="t('label_group_size')"
            v-model="room.slotSize"
            :items="[1, 2, 3, 4, 5, 6]"
            density="compact"
            hide-details
        ></v-select>
        <v-select
            :label="t('label_debate_style')"
            v-model="debateStyle"
            :items="Object.keys(debateStyles).map(s => ({
                title: t(s),
                value: s,
            }))"
            density="compact"
            hide-details
        >
            <template v-slot:selection="{ item }">
                {{ t(item.value + '_compact') }}
            </template>
        </v-select>
        <v-btn-group density="comfortable">
            <v-btn icon="mdi-arrow-up" @click="appStore.moveRoom(index, index-1)" :disabled="index === 0"></v-btn>
            <v-btn icon="mdi-arrow-down" @click="appStore.moveRoom(index, index+1)" :disabled="index === appStore.rooms.length - 2"></v-btn>
            <v-btn icon="mdi-plus" @click="appStore.addRoom(index + 1)"></v-btn>
            <v-btn icon="mdi-delete" @click="appStore.deleteRoom(index)" :disabled="appStore.rooms.length <= 2"></v-btn>
        </v-btn-group>
    </div>
</template>