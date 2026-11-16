import assert from "assert";
import { SortedRanges } from "../src/SortedRanges";

// Same check as IgnoreNodeManager#isIgnoredIndex
const naiveHas = (ranges: [number, number][], index: number) => {
    return ranges.some(([start, end]) => start <= index && index < end);
};

const assertSameAsNaive = (ranges: [number, number][], maxIndex: number) => {
    const sortedRanges = new SortedRanges();
    ranges.forEach(([start, end]) => sortedRanges.add(start, end));
    for (let index = -2; index <= maxIndex + 2; index++) {
        assert.strictEqual(
            sortedRanges.has(index),
            naiveHas(ranges, index),
            `index: ${index}, ranges: ${JSON.stringify(ranges)}`
        );
    }
};

describe("SortedRanges", () => {
    it("should return false when it has no range", () => {
        assert.strictEqual(new SortedRanges().has(0), false);
    });
    it("should treat a range as [start, end)", () => {
        assertSameAsNaive([[2, 5]], 10);
    });
    it("should ignore an empty range", () => {
        assertSameAsNaive([[3, 3]], 10);
    });
    it("should handle adjacent ranges", () => {
        assertSameAsNaive([[0, 2], [2, 4]], 10);
        assertSameAsNaive([[2, 4], [0, 2]], 10);
    });
    it("should handle nested ranges", () => {
        assertSameAsNaive([[0, 10], [2, 4], [3, 3], [5, 10]], 12);
        assertSameAsNaive([[2, 4], [0, 10]], 12);
    });
    it("should handle ranges added in any order", () => {
        assertSameAsNaive([[8, 9], [0, 1], [4, 6], [2, 3], [5, 8], [1, 2]], 12);
    });
    it("should handle the same range added twice", () => {
        assertSameAsNaive([[1, 3], [1, 3]], 5);
    });
    it("should return false for NaN", () => {
        const sortedRanges = new SortedRanges();
        sortedRanges.add(0, 10);
        assert.strictEqual(sortedRanges.has(NaN), naiveHas([[0, 10]], NaN));
    });
    it("should be same as checking each range for random ranges", () => {
        // deterministic pseudo random numbers
        let seed = 1;
        const random = (max: number) => {
            seed = (seed * 1103515245 + 12345) % 2147483648;
            return seed % max;
        };
        for (let count = 0; count < 500; count++) {
            const ranges: [number, number][] = [];
            const rangeCount = random(12);
            for (let i = 0; i < rangeCount; i++) {
                const start = random(40);
                ranges.push([start, start + random(8)]);
            }
            assertSameAsNaive(ranges, 50);
        }
    });
});
