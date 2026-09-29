import * as assert from 'assert';
import { JSDOM } from 'jsdom';
import { getMarkup } from '../../webview/html';
import { getSharedLogic } from '../../webview/shared/logic';

describe('Shared Utilities Tests', () => {
    it('should render readable, structured history entries', () => {
        const dom = new JSDOM('<!DOCTYPE html><body>' + getMarkup() + '</body>', {
            url: 'https://bbt.test/'
        });
        const fn = new Function(
            'window',
            'document',
            'localStorage',
            'initBinaryDiff',
            'convertNumber',
            getSharedLogic() + '; return { addToHistory };'
        );
        const api = fn(
            dom.window,
            dom.window.document,
            dom.window.localStorage,
            () => {},
            () => {}
        );

        api.addToHistory('9007199254740993 + 10', '9007199254741003', 'number');

        const entry = dom.window.document.querySelector('.history-item');
        assert.ok(entry);
        assert.strictEqual(entry.querySelector('.history-mode')?.textContent, 'NUM');
        assert.strictEqual(entry.querySelector('.history-expr')?.textContent, '9007199254740993 + 10');
        assert.strictEqual(entry.querySelector('.history-result')?.textContent, '9007199254741003');
    });

    it('should use the same result-card structure for Number and ASCII', () => {
        const dom = new JSDOM('<!DOCTYPE html><body>' + getMarkup() + '</body>');
        const numberCards = dom.window.document.querySelectorAll('#numberResults .result-card');
        const asciiCards = dom.window.document.querySelectorAll('#asciiResults .result-card');

        assert.strictEqual(numberCards.length, 3);
        assert.strictEqual(asciiCards.length, 3);
        [...numberCards, ...asciiCards].forEach(card => {
            assert.ok(card.querySelector('.result-label'));
            assert.ok(card.querySelector('.result-content'));
            assert.ok(card.querySelector('.result-value'));
            assert.ok(card.querySelector('.copy-btn'));
        });
    });
});
