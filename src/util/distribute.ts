import type { AppStore, RoomDefinition, SlotDefinition } from "@/stores/app";
import { shuffleSubsequence } from "./array";

type Draft = Record<string, [string, string]> // Maps from member name to [room, slot]

type Stats = {
    countTotal: number,
    countNew: number,
    countExperienced: number,
}

type Party = {
    parentName: string,
} & Stats

type Slot = {
    size: number,
    roomId: string,
    definition: SlotDefinition,
    parties: Party[],
} & Stats

type RoomMap = Record<string, Slot>

function getAllParties(appStore: AppStore): Record<string, RoomMap>
function getAllParties(appStore: AppStore, wantedRoom: string): RoomMap
function getAllParties(appStore: AppStore, wantedRoom?: string) {
    if (wantedRoom) {
        const room = appStore.rooms.find(r => r.id === wantedRoom)!
        const roomMembers = appStore.getRoomMembers(wantedRoom)
        const roomDict = {} as RoomMap
        for (const slot of room.slots) {
            const slotList = [] as Party[]
            const slotMembers = roomMembers[slot.id] ?? []
            var slotTotal = 0
            var slotExperienced = 0
            for (const parentName of slotMembers) {
                const parent = appStore.members[parentName]
                var countTotal = 1
                var countExperienced = parent.experienced ? 1 : 0
                for (const childName of parent.children) {
                    countExperienced += appStore.members[childName].experienced ? 1 : 0
                    countTotal += 1
                }
                slotTotal += countTotal
                slotExperienced += countExperienced
                const countNew = countTotal - countExperienced
                slotList.push({ parentName, countTotal, countExperienced, countNew })
            }
            roomDict[slot.id] = {
                size: slot.unlimitedSlots ? Infinity : room.slotSize,
                roomId: room.id,
                definition: slot,
                countTotal: slotTotal,
                countExperienced: slotExperienced,
                countNew: slotTotal - slotExperienced,
                parties: slotList,
            }
        }
        return roomDict
    }
    const result = {} as Record<string, RoomMap>
    for (const room of appStore.rooms) {
        result[room.id] = getAllParties(appStore, room.id)
    }
    return result
}

function makeDraft(appStore: AppStore): Draft {
    const allParties = getAllParties(appStore)
    var draft: Draft = {}
    for (const roomKey of Object.keys(allParties)) {
        // First sort the members that were already assigned a room
        if (roomKey === 'rootUnsorted') continue
        draft = {...draft, ...makeRoomDraft(allParties[roomKey])}
    }
    // Now sort the members who weren't assigned to any room
    const targetSlots: Slot[] = []
    for (const roomMap of Object.values(allParties)) {
        for (const slot of Object.values(roomMap)) {
            if (slot.definition.id === 'unsorted') continue
            targetSlots.push(slot)
        }
    }
    return {...draft, ...makeDraftFromSlots(allParties.rootUnsorted.unsorted, targetSlots)}
}

function makeRoomDraft(appStore: AppStore, roomId: string): Draft
function makeRoomDraft(allParties: RoomMap): Draft
function makeRoomDraft(appStore: AppStore | RoomMap, roomId?: string): Draft {
    const allParties: RoomMap = roomId === undefined
        ? appStore as RoomMap
        : getAllParties(appStore as AppStore, roomId)
    const {unsorted, ...others} = allParties
    return makeDraftFromSlots(unsorted, Object.values(others))
}

function makeDraftFromSlots(sourceSlot: Slot, targetSlots: Slot[]) {
    sourceSlot.parties.sort((a, b) => a.countTotal - b.countTotal)
    var lower = 0
    var abort = false
    for (var upper = 1; !abort; upper++) {
        abort = upper >= sourceSlot.parties.length
        if (abort || sourceSlot.parties[lower].countTotal !== sourceSlot.parties[upper].countTotal) {
            shuffleSubsequence(sourceSlot.parties, lower, upper)
            lower = upper
        }
    }
    // Source parties are now sorted by size (ascending) and otherwise shuffled randomly
    const draft: Draft = {}
    while (sourceSlot.parties.length > 0) {
        const sourceParty = sourceSlot.parties.pop()!
        sourceSlot.countExperienced -= sourceParty.countExperienced
        sourceSlot.countNew -= sourceParty.countNew
        sourceSlot.countTotal -= sourceParty.countTotal
        const { parentName, countTotal, countNew, countExperienced } = sourceParty
        const validTargets = targetSlots.filter(slot => slot.definition.free && slot.countTotal + countTotal <= slot.size)
        const limitedTargets: Slot[] = []
        const unlimitedTargets: Slot[] = []
        for (const target of validTargets) {
            (target.definition.unlimitedSlots ? unlimitedTargets : limitedTargets).push(target)
        }
        if (limitedTargets.length > 0) {
            const target = limitedTargets[Math.floor(Math.random()*limitedTargets.length)]
            moveParty(sourceParty, target, draft)
        } else if (unlimitedTargets.length > 0) {
            const minSize = unlimitedTargets.reduce((x, slot) => Math.min(x, slot.countTotal), Infinity)
            const minTargets = unlimitedTargets.filter(slot => slot.countTotal === minSize)
            const target = minTargets[Math.floor(Math.random() * minTargets.length)]
            moveParty(sourceParty, target, draft)
        }
    }
    return draft
}

function moveParty(party: Party, targetSlot: Slot, draft: Draft) {
    draft[party.parentName] = [targetSlot.roomId, targetSlot.definition.id]
    targetSlot.countExperienced += party.countExperienced
    targetSlot.countNew += party.countNew
    targetSlot.countTotal += party.countTotal
    targetSlot.parties.push(party)
}

function distributeDraft(appStore: AppStore, draft: Draft, toRooms?: boolean) {
    for (const memberName of Object.keys(draft)) {
        const member = appStore.members[memberName]
        if (member.location.slot !== 'unsorted') {
            continue
        }
        const [ room, slot ] = draft[memberName]
        const index = (appStore.getRoomMembers(room)[slot] ?? []).length
        appStore.moveMember(memberName, {
            room,
            slot: toRooms ? 'unsorted' : slot,
            index,
        })
    }
}

export function distributeAll(appStore: AppStore, toRooms?: boolean) {
    const draft = makeDraft(appStore)
    distributeDraft(appStore, draft, toRooms)
}

export function distributeRoom(appStore: AppStore, roomId: string) {
    const draft = makeRoomDraft(appStore, roomId)
    distributeDraft(appStore, draft)
}