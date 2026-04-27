<script setup lang="ts">
import { useAppStore, type SlotDefinition } from "@/stores/app";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const appStore = useAppStore()
const { t } = useI18n()

const props = defineProps<{
	roomId: string,
	slot: SlotDefinition,
}>()

const memberCount = computed(() => (appStore.getSlotCount(props.roomId, props.slot.id)))
</script>

<template>
	<h2 style="margin-left:5px;margin-top:0px;margin-bottom:0px;">
		{{ t(slot.id) }}
		<template v-if="memberCount > 0">({{ memberCount }})</template>
	</h2>
</template>
