import { debateStyles } from '@/config/debatestyles';
import { defineStore } from 'pinia';

export type MemberLocation = {
    room: string,
    slot: string,
    index: number
}

export type SlotDefinition = {
    id: string,
    free: boolean,
    unlimitedSlots?: boolean,
}

export type RoomDefinition = {
    format: keyof typeof debateStyles,
    slots: SlotDefinition[],
    slotSize: number,
    id: string,
    displayName: string,
}

export type DebateFormat = keyof typeof debateStyles

export const useAppStore = defineStore('app', {
    state: () => ({
        initialized: false,
        members: {} as Record<string, {
            experienced: boolean,
            location: MemberLocation,
            children: string[],
            parent?: string,
        }>,
        rooms: [
            {
                slots: [{
                    free: false,
                    id: "unsorted"
                }],
                slotSize: 0,
                id: "rootUnsorted"
            }
        ] as RoomDefinition[],
        dragging: undefined as string | undefined,
        roomCounter: 0,
    }),
    getters: {
        getRoomMembers: (state) => (room: string) => {
            const inRoom = Object.keys(state.members).filter(memberName => state.members[memberName].location.room === room)
            inRoom.sort((a, b) => (state.members[a].location.index) - (state.members[b].location.index as number))
            const result: Record<string, string[]> = {}
            for (const memberName of inRoom) {
                const slot = state.members[memberName].location.slot
                if (!result[slot]) {
                    result[slot] = []
                }
                result[slot].push(memberName)
            }
            return result
        }
    },
    actions: {
        removeMemberFromSlot(memberName: string) {
            const member = this.members[memberName]
            if (member.parent) {
                const parent = this.members[member.parent]
                const idx = parent.children.findIndex(el => el === memberName)
                parent.children.splice(idx, 1)
                delete member.parent
            }
            const location = member.location
            if (location === undefined) return

            member.location = {index: -1, room: "undefined", slot: "undefined"}

            const slot = this.getRoomMembers(location.room)[location.slot] ?? []

            for (const other of slot) {
                const otherLocation = this.members[other].location as MemberLocation
                if (otherLocation.index >= location.index) {
                    otherLocation.index -= 1
                }
            }
        },
        moveMember(memberName: string, location: MemberLocation) {
            this.removeMemberFromSlot(memberName)
            if (location) {
                const slot = this.getRoomMembers(location.room)[location.slot] ?? []
                for (const other of slot) {
                    const otherLocation = this.members[other].location as MemberLocation
                    if (otherLocation.index >= location.index) {
                        otherLocation.index += 1
                    }
                }
            }
            this.members[memberName].location = location
        },
        addChild(parentName: string, childName: string) {
            var parent = this.members[parentName]
            while (parent.parent) {
                parentName = parent.parent
                parent = this.members[parentName]
            }
            this.removeMemberFromSlot(childName)
            const child = this.members[childName]
            child.parent = parentName
            child.location = {
                room: 'undefined',
                slot: 'undefined',
                index: 0,
            }
            parent.children.push(childName)
            for (const grandchildName of child.children) {
                parent.children.push(grandchildName)
                this.members[grandchildName].parent = parentName
            }
            child.children = []
        },
        addRoom(index?: number) {
            if (index === undefined) {
                index = this.rooms.length - 1
            }
            const newRoom = this.generateRoom("opd")
            this.rooms.splice(index, 0, newRoom)
        },
        generateRoom(format: DebateFormat): RoomDefinition {
            this.roomCounter += 1
            const roomTemplate = debateStyles[format]
            const id = this.roomCounter.toString()
            return { format, id, displayName: '', ...roomTemplate }
        },
        setRoomType(index: number, format: DebateFormat) {
            const roomId = this.rooms[index].id
            const displayName = this.rooms[index].displayName
            const members = Object.values(this.getRoomMembers(roomId)).flat(1)
            for (const member of members) {
                const location = {...this.members[member].location}
                location.slot = "unsorted"
                this.moveMember(member, location)
            }
            this.rooms[index] = { format, displayName, id: roomId, ...debateStyles[format] }
        },
        addMember(name: string, experienced: boolean) {
            const unsorted = this.getRoomMembers('rootUnsorted').unsorted ?? []
            this.members[name] = {
                children: [],
                experienced,
                location: {
                    index: unsorted.length,
                    room: 'rootUnsorted',
                    slot: 'unsorted',
                }
            }
        },
        deleteMember(memberName: string) {
            const member = this.members[memberName]
            const { room, slot, index } = member.location
            while (member.children.length > 0) {
                const child = member.children[member.children.length - 1]
                this.moveMember(child, { room, slot, index})
            }
            this.removeMemberFromSlot(memberName)
            delete this.members[memberName]
        },
        moveRoom(sourceIdx: number, targetIdx: number) {
            const room = this.rooms[sourceIdx]
            this.rooms[sourceIdx] = this.rooms[targetIdx]
            this.rooms[targetIdx] = room
        },
        deleteRoom(index: number) {
            var rootUnsorted = (this.getRoomMembers('rootUnsorted')['unsorted'] ?? []).length
            Object.values(this.getRoomMembers(this.rooms[index].id)).flat().forEach(memberName => {

                this.moveMember(memberName, {
                    room: 'rootUnsorted',
                    slot: 'unsorted',
                    index: rootUnsorted
                })
                rootUnsorted += 1
            })
            this.rooms.splice(index, 1)
        }
    }
})

export type AppStore = typeof useAppStore extends (_: any) => infer T ? T : never
