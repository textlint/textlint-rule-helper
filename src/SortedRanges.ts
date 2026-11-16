/**
 * A set of half-open ranges `[start, end)`.
 * It keeps the ranges sorted and merged, so that `has(index)` is a binary search.
 *
 * `has(index)` returns the same result as checking `start <= index && index < end` for each added range.
 * @internal
 */
export class SortedRanges {
    // starts[i] < ends[i] <= starts[i + 1]
    private starts: number[] = [];
    private ends: number[] = [];

    add(start: number, end: number): void {
        // An empty range contains no index
        if (!(start < end)) {
            return;
        }
        const starts = this.starts;
        const ends = this.ends;
        const length = starts.length;
        // Fast path: ranges are mostly added in the order of the document
        if (length === 0 || ends[length - 1] < start) {
            starts.push(start);
            ends.push(end);
            return;
        }
        // first range whose end >= start: it overlaps or touches the new range, or it is after the new range
        let low = 0;
        let high = length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (ends[mid] < start) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        // merge all ranges that overlap or touch [start, end)
        let last = low;
        let mergedStart = start;
        let mergedEnd = end;
        while (last < length && starts[last] <= end) {
            if (starts[last] < mergedStart) {
                mergedStart = starts[last];
            }
            if (ends[last] > mergedEnd) {
                mergedEnd = ends[last];
            }
            last++;
        }
        starts.splice(low, last - low, mergedStart);
        ends.splice(low, last - low, mergedEnd);
    }

    has(index: number): boolean {
        const starts = this.starts;
        // last range whose start <= index
        let low = 0;
        let high = starts.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (starts[mid] <= index) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        const i = low - 1;
        return i >= 0 && index < this.ends[i];
    }
}
