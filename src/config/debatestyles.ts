import type { RoomDefinition } from "@/stores/app";

export const debateStyles = {
    bpd: {
        slotSize: 2,
        slots: [
            { id: "bpd_house_1", free: true },
            { id: "bpd_house_2", free: true },
            { id: "bpd_opposition_1", free: true },
            { id: "bpd_opposition_2", free: true },
            { id: "jury", free: false },
        ]
    },
    opd: {
        slotSize: 3,
        slots: [
            { id: "opd_house", free: true },
            { id: "opd_opposition", free: true },
            { id: "opd_free_speakers", free: true, unlimitedSlots: true },
            { id: "jury", free: false},
        ]
    }
} as const satisfies Record<string, Omit<RoomDefinition, "id" | "displayName" | "format" | "juryCount">>