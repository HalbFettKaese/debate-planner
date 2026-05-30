

/**
 * Shuffles a subsequence of a list in-place.
 * @param list The list to shuffle
 * @param startIdx The starting index of the relevant subsequence (inclusive)
 * @param endIdx The ending index of the relevant subsequence (exclusive)
 */
export function shuffleSubsequence<T>(list: T[], startIdx: number, endIdx: number): void
export function shuffleSubsequence<T>(list: T[]): void
export function shuffleSubsequence<T>(list: T[], startIdx?: number, endIdx?: number) {
    if (startIdx === undefined) startIdx = 0
    if (endIdx === undefined) endIdx = list.length

    const n = endIdx - startIdx // Length of subsequence
    for (var i = n - 1; i >= 1; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = list[startIdx + i]
        list[startIdx + i] = list[startIdx + j]
        list[startIdx + j] = temp
    }
}

export function getRandom<T>(list: T[]): T | undefined {
    const idx = Math.floor(Math.random() * list.length)
    return list[idx]
}
