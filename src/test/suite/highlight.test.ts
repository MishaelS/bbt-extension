import * as assert from 'assert';
import {
    normalizeOffsetRanges,
    subtractOffsetRanges,
    updateOffsetRanges
} from '../../highlight/rangeTracker';

describe('Text Highlight Range Tracking', () => {
    it('should normalize overlapping and adjacent ranges', () => {
        assert.deepStrictEqual(
            normalizeOffsetRanges([
                { start: 8, end: 12 },
                { start: 0, end: 4 },
                { start: 3, end: 8 }
            ]),
            [{ start: 0, end: 12 }]
        );
    });

    it('should preserve non-overlapping parts when recoloring or clearing text', () => {
        assert.deepStrictEqual(
            subtractOffsetRanges(
                [{ start: 0, end: 10 }],
                [{ start: 3, end: 7 }]
            ),
            [
                { start: 0, end: 3 },
                { start: 7, end: 10 }
            ]
        );
    });

    it('should shift highlights when text is inserted before them', () => {
        assert.deepStrictEqual(
            updateOffsetRanges(
                [{ start: 10, end: 20 }],
                [{ rangeOffset: 5, rangeLength: 0, textLength: 3 }]
            ),
            [{ start: 13, end: 23 }]
        );
    });

    it('should expand highlights when text is inserted inside them', () => {
        assert.deepStrictEqual(
            updateOffsetRanges(
                [{ start: 10, end: 20 }],
                [{ rangeOffset: 15, rangeLength: 0, textLength: 4 }]
            ),
            [{ start: 10, end: 24 }]
        );
    });

    it('should resize or remove highlights after replacements', () => {
        assert.deepStrictEqual(
            updateOffsetRanges(
                [{ start: 10, end: 20 }],
                [{ rangeOffset: 12, rangeLength: 3, textLength: 2 }]
            ),
            [{ start: 10, end: 19 }]
        );
        assert.deepStrictEqual(
            updateOffsetRanges(
                [{ start: 10, end: 20 }],
                [{ rangeOffset: 10, rangeLength: 10, textLength: 0 }]
            ),
            []
        );
    });

    it('should apply multi-cursor edits using original document offsets', () => {
        assert.deepStrictEqual(
            updateOffsetRanges(
                [{ start: 10, end: 20 }],
                [
                    { rangeOffset: 5, rangeLength: 0, textLength: 2 },
                    { rangeOffset: 15, rangeLength: 2, textLength: 0 }
                ]
            ),
            [{ start: 12, end: 20 }]
        );
    });
});
