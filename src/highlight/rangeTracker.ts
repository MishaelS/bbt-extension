export interface OffsetRange
{
    start: number;
    end: number;
}

export interface OffsetChange
{
    rangeOffset: number;
    rangeLength: number;
    textLength: number;
}

export function normalizeOffsetRanges(ranges: OffsetRange[]): OffsetRange[]
{
    const sorted = ranges
        .filter(range => range.end > range.start)
        .map(range => ({ ...range }))
        .sort((left, right) => left.start - right.start || left.end - right.end);

    const merged: OffsetRange[] = [];
    for (const range of sorted) {
        const previous = merged[merged.length - 1];
        if (previous && range.start <= previous.end) {
            previous.end = Math.max(previous.end, range.end);
        } else {
            merged.push(range);
        }
    }
    return merged;
}

export function subtractOffsetRanges(
    ranges: OffsetRange[],
    cuts: OffsetRange[]
): OffsetRange[]
{
    let remaining = normalizeOffsetRanges(ranges);

    for (const cut of normalizeOffsetRanges(cuts)) {
        const next: OffsetRange[] = [];
        for (const range of remaining) {
            if (cut.end <= range.start || cut.start >= range.end) {
                next.push(range);
                continue;
            }

            if (cut.start > range.start) {
                next.push({ start: range.start, end: Math.min(cut.start, range.end) });
            }
            if (cut.end < range.end) {
                next.push({ start: Math.max(cut.end, range.start), end: range.end });
            }
        }
        remaining = next;
    }

    return normalizeOffsetRanges(remaining);
}

export function updateOffsetRanges(
    ranges: OffsetRange[],
    changes: OffsetChange[]
): OffsetRange[]
{
    let updated = normalizeOffsetRanges(ranges);
    const descendingChanges = [...changes].sort((left, right) => right.rangeOffset - left.rangeOffset);

    for (const change of descendingChanges) {
        updated = updated
            .map(range => applyChange(range, change))
            .filter((range): range is OffsetRange => range !== null);
    }

    return normalizeOffsetRanges(updated);
}

function applyChange(range: OffsetRange, change: OffsetChange): OffsetRange | null
{
    const changeStart = change.rangeOffset;
    const changeEnd = change.rangeOffset + change.rangeLength;
    const delta = change.textLength - change.rangeLength;

    if (change.rangeLength === 0) {
        if (changeStart < range.start) {
            return { start: range.start + delta, end: range.end + delta };
        }
        if (changeStart >= range.start && changeStart <= range.end) {
            return { start: range.start, end: range.end + delta };
        }
        return range;
    }

    if (changeEnd <= range.start) {
        return { start: range.start + delta, end: range.end + delta };
    }
    if (changeStart >= range.end) {
        return range;
    }

    const start = range.start < changeStart ? range.start : changeStart;
    const end = range.end <= changeEnd
        ? changeStart + change.textLength
        : range.end + delta;

    return end > start ? { start, end } : null;
}
