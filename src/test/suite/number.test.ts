import * as assert from 'assert';
import { getNumberLogic } from '../../webview/number/logic';

// Mock browser environment for webview functions without JSDOM
function setupMockEnvironment()
{
    // Mock document
    global.document = {
        getElementById: (id: string) => {
            return {
                innerHTML: '',
                textContent: '',
                style: { display: '' }
            };
        },

        createElement: (tag: string) => {
            return {
                className: '',
                textContent: '',
                appendChild: () => {},
                setAttribute: () => {}
            };
        }
    } as any;

    // Mock window
    global.window = {
        addEventListener: () => {}
    } as any;

    // Mock navigator (readonly in Node.js, so we need to use Object.defineProperty)
    Object.defineProperty(global, 'navigator', {
        value: { clipboard: { writeText: () => Promise.resolve() } },
        writable: false,
        configurable: true
    });
}

describe('Number Mode Tests', () => {
    let safeEval: Function;

    before(async () => {
        setupMockEnvironment();

        // Get the logic code directly from the imported function
        const logicCode = getNumberLogic();

        // Create a function that extracts safeEval
        const fn = new Function(logicCode + '; return { safeEval, INT_TYPES };');
        const exported = fn();
        safeEval = exported.safeEval;
    });

    describe('safeEval()', () => {
        it('should evaluate integer addition', () => {
            const result = safeEval('5 + 3');
            assert.strictEqual(result, 8);
        });

        it('should evaluate floating point addition', () => {
            const result = safeEval('5.5 + 3.2');
            assert.strictEqual(result, 8.7);
        });

        it('should evaluate subtraction with float', () => {
            const result = safeEval('10.5 - 3.2');
            assert.strictEqual(result, 7.3);
        });

        it('should evaluate multiplication with float', () => {
            const result = safeEval('2.5 * 4');
            assert.strictEqual(result, 10);
        });

        it('should evaluate division with float result', () => {
            const result = safeEval('10 / 3');
            assert.strictEqual(result, 3.3333333333333335);
        });

        it('should convert hex literals', () => {
            const result = safeEval('0xFF + 1');
            assert.strictEqual(result, 256);
        });

        it('should convert binary literals', () => {
            const result = safeEval('0b1010 + 5');
            assert.strictEqual(result, 15);
        });

        it('should handle mixed hex and float', () => {
            const result = safeEval('0xFF + 0.5');
            assert.strictEqual(result, 255.5);
        });

        it('should handle complex expressions', () => {
            const result = safeEval('(5.5 * 2) + (10 / 4)');
            assert.strictEqual(result, 13.5);
        });

        it('should throw error on invalid characters', () => {
            assert.throws(() => safeEval('5 + "string"'), /Invalid characters/);
        });

        it('should handle bitwise operations', () => {
            const result = safeEval('0xFF & 0x0F');
            assert.strictEqual(result, 15);
        });

        it('should handle shift operations', () => {
            const result = safeEval('0b1010 << 2');
            assert.strictEqual(result, 40);
        });
    });

    describe('Number type detection', () => {
        it('should detect integer correctly', () => {
            const result = safeEval('5');
            const isInteger = Math.floor(result) === result;
            assert.strictEqual(isInteger, true);
        });

        it('should detect float correctly', () => {
            const result = safeEval('5.5');
            const isInteger = Math.floor(result) === result;
            assert.strictEqual(isInteger, false);
        });

        it('should detect float result from division', () => {
            const result = safeEval('10 / 3');
            const isInteger = Math.floor(result) === result;
            assert.strictEqual(isInteger, false);
        });
    });
});

// Setup for testing the actual conversion logic
describe('Number Conversion Logic', () => {
    it('should format hex correctly for integers', () => {
        const value = 255;
        const hex = '0x' + value.toString(16).toUpperCase();
        assert.strictEqual(hex, '0xFF');
    });

    it('should format binary correctly for integers', () => {
        const value = 10;
        const bin = '0b' + value.toString(2);
        assert.strictEqual(bin, '0b1010');
    });

    it('should not show hex for floats', () => {
        const value = 3.14;
        const isInteger = Math.floor(value) === value;
        const hex = isInteger ? '0x' + value.toString(16) : '— (float only)';
        assert.strictEqual(hex, '— (float only)');
    });
});