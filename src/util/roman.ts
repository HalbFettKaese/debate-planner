const bases = {
    1: {
        one: 'I',
        five: 'V',
    },
    10: {
        one: 'X',
        five: 'L'
    },
    100: {
        one: 'C',
        five: 'D',
    },
    1000: {
        one: 'M',
    }
} as Record<number, {
    one: string,
    five?: string,
}>

function romanSection(n: number, base: number) {
    const b = bases[base]
    const c = bases[base * 10]
    if (!b.five || n <= 3) {
        return b.one.repeat(n)
    } else if (n == 4) {
        return b.one + b.five
    } else if (n <= 8) {
        return b.five + b.one.repeat(n - 5)
    } else {
        return b.one.repeat(10 - n) + c.one
    }
}

export function toRomanNumerals(n: number): string {
    var result = ''
    for (const base of [1000, 100, 10, 1]) {
        result += romanSection(Math.floor(n / base), base)
        n %= base
    }
    return result
}