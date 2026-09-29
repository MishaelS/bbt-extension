import * as assert from 'assert';
import { JSDOM } from 'jsdom';
import { getMarkup } from '../../webview/html';
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
    let safeEvalMany: Function;
    let formatNumberResult: Function;

    before(async () => {
        setupMockEnvironment();

        // Get the logic code directly from the imported function
        const logicCode = getNumberLogic();

        // Create a function that extracts safeEval
        const fn = new Function(logicCode + '; return { safeEval, safeEvalMany, formatNumberResult, INT_TYPES };');
        const exported = fn();
        safeEval = exported.safeEval;
        safeEvalMany = exported.safeEvalMany;
        formatNumberResult = exported.formatNumberResult;
    });

    describe('safeEval()', () => {
        it('should evaluate integer addition', () => {
            const result = safeEval('5 + 3');
            assert.strictEqual(result, 8);
            assert.strictEqual(safeEval('+5'), 5);
            assert.strictEqual(safeEval('(+5) + 3'), 8);
            assert.strictEqual(safeEval('0008 + 1'), 9);
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
            assert.throws(() => safeEval('true.constructor'), /Invalid characters/);
        });

        it('should handle bitwise operations', () => {
            const result = safeEval('0xFF & 0x0F');
            assert.strictEqual(result, 15);
        });

        it('should handle shift operations', () => {
            const result = safeEval('0b1010 << 2');
            assert.strictEqual(result, 40);
            assert.strictEqual(safeEval('8 >>> 1'), 4);
        });

        it('should parse short hex literals', () => {
            const result = safeEval('xFF');
            assert.strictEqual(result, 255);
        });

        it('should parse short binary literals', () => {
            const result = safeEval('b1010');
            assert.strictEqual(result, 10);
        });

        it('should handle mixed short and standard formats', () => {
            const result = safeEval('xFF + 0b1');
            assert.strictEqual(result, 256);
        });

        it('should preserve operators before short hex literals', () => {
            const result = safeEval('(x10) << 8 | 0x31');
            assert.strictEqual(result, 4145);
        });

        it('should throw on unclosed short hex expression', () => {
            assert.throws(() => safeEval('(x10 << 8 | 0x31'));
        });

        it('should parse short hex with spaces', () => {
            const result = safeEval('x F F');
            assert.strictEqual(result, 255);
        });

        it('should evaluate comparison expressions as booleans', () => {
            assert.strictEqual(safeEval('0xFF > 128'), true);
            assert.strictEqual(safeEval('5 <= 3'), false);
            assert.strictEqual(safeEval('5 == 5 && 2 != 3'), true);
        });

        it('should evaluate boolean literals and logical operators', () => {
            assert.strictEqual(safeEval('true && !false'), true);
            assert.strictEqual(safeEval('0 || 5'), true);
        });

        it('should preserve integers beyond Number.MAX_SAFE_INTEGER', () => {
            const result = safeEval('9007199254740993 + 10');
            assert.strictEqual(result, 9007199254741003n);
            assert.strictEqual(formatNumberResult(result, 16), '0x2000000000000B');
            assert.strictEqual(formatNumberResult(result, 2), '0b100000000000000000000000000000000000000000000000001011');
        });

        it('should evaluate comma-separated expressions independently', () => {
            assert.deepStrictEqual(
                safeEvalMany('1 + 2, 0x10, 5 > 3'),
                [3, 16, true]
            );
        });

        it('should reject empty and nested comma expressions', () => {
            assert.throws(() => safeEvalMany('1,,2'), /Empty expression/);
            assert.throws(() => safeEvalMany('(1, 2)'), /only allowed between expressions/);
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
        const hex = isInteger ? '0x' + value.toString(16) : '- (float only)';
        assert.strictEqual(hex, '- (float only)');
    });
});

describe('Number Mode Rendering', () => {
    let document: Document;
    let convertNumber: Function;

    beforeEach(() => {
        const dom = new JSDOM('<!DOCTYPE html><body>' + getMarkup() + '</body>');
        document = dom.window.document;
        const fn = new Function(
            'document',
            getNumberLogic() + '; return { convertNumber };'
        );
        convertNumber = fn(document).convertNumber;
    });

    function render(input: string): void {
        (document.getElementById('numInput') as HTMLInputElement).value = input;
        convertNumber(false);
    }

    it('should render boolean results without numeric conversions', () => {
        render('0xFF > 128 && true');
        assert.strictEqual(document.getElementById('decLabel')?.textContent, 'BOOL');
        assert.strictEqual(document.getElementById('decVal')?.textContent, 'true');
        assert.strictEqual(document.getElementById('hexVal')?.textContent, '- (boolean)');
        assert.strictEqual(document.getElementById('binVal')?.textContent, '- (boolean)');
    });

    it('should render multiple comma-separated results in every base', () => {
        render('1 + 2, 0x10, 5 > 3');
        assert.strictEqual(document.getElementById('decLabel')?.textContent, 'RESULT');
        assert.strictEqual(document.getElementById('decVal')?.textContent, '3, 16, true');
        assert.strictEqual(document.getElementById('hexVal')?.textContent, '0x3, 0x10, - (boolean)');
        assert.strictEqual(document.getElementById('binVal')?.textContent, '0b11, 0b10000, - (boolean)');
    });

    it('should render a large integer without precision loss', () => {
        render('9007199254740993 + 10');
        assert.strictEqual(document.getElementById('decVal')?.textContent, '9007199254741003');
        assert.strictEqual(document.getElementById('hexVal')?.textContent, '0x2000000000000B');
    });
});

// Performance and edge case tests
describe('Performance and Edge Cases', () => {
    let safeEval: Function;

    before(async () => {
        setupMockEnvironment();
        const logicCode = getNumberLogic();
        const fn = new Function(logicCode + '; return { safeEval, INT_TYPES };');
        const exported = fn();
        safeEval = exported.safeEval;
    });

    describe('Edge Cases', () => {
        it('should handle zero', () => {
            const result = safeEval('0');
            assert.strictEqual(result, 0);
        });

        it('should handle negative numbers', () => {
            const result = safeEval('-255');
            assert.strictEqual(result, -255);
        });

        it('should handle negative floats', () => {
            const result = safeEval('-3.14');
            assert.strictEqual(result, -3.14);
        });

        it('should handle very large numbers', () => {
            const result = safeEval('999999999');
            assert.strictEqual(result, 999999999);
        });

        it('should handle very small floats', () => {
            const result = safeEval('0.0001');
            assert.strictEqual(result, 0.0001);
        });

        it('should handle zero hex', () => {
            const result = safeEval('0x0');
            assert.strictEqual(result, 0);
        });

        it('should handle zero binary', () => {
            const result = safeEval('0b0');
            assert.strictEqual(result, 0);
        });

        it('should handle complex nested operations', () => {
            const result = safeEval('((5 + 3) * 2) - 1');
            assert.strictEqual(result, 15);
        });

        it('should handle operations with multiple hex values', () => {
            const result = safeEval('0xFF + 0x0F + 0x01');
            assert.strictEqual(result, 271);
        });

        it('should handle operations with multiple binary values', () => {
            const result = safeEval('0b1010 + 0b0101 + 0b0001');
            assert.strictEqual(result, 16);
        });
    });

    describe('Performance', () => {
        it('should evaluate simple expression quickly', () => {
            const start = Date.now();
            safeEval('5 + 3');
            const elapsed = Date.now() - start;
            assert.ok(elapsed < 100, `Operation took ${elapsed}ms, should be < 100ms`);
        });

        it('should evaluate complex expression quickly', () => {
            const start = Date.now();
            safeEval('((5.5 * 2) + (10 / 4)) * (8 - 3)');
            const elapsed = Date.now() - start;
            assert.ok(elapsed < 100, `Operation took ${elapsed}ms, should be < 100ms`);
        });

        it('should evaluate many hex conversions quickly', () => {
            const start = Date.now();
            for (let i = 0; i < 100; i++) {
                safeEval('0xFF + 0xAB + 0x12');
            }
            const elapsed = Date.now() - start;
            assert.ok(elapsed < 500, `100 operations took ${elapsed}ms, should be < 500ms`);
        });

        it('should handle integer type detection efficiently', () => {
            const start = Date.now();
            const result = safeEval('255');
            const isInteger = Math.floor(result) === result;
            const elapsed = Date.now() - start;
            assert.strictEqual(isInteger, true);
            assert.ok(elapsed < 50, `Operation took ${elapsed}ms, should be < 50ms`);
        });

        it('should handle float detection efficiently', () => {
            const start = Date.now();
            const result = safeEval('3.14159');
            const isFloat = Math.floor(result) !== result;
            const elapsed = Date.now() - start;
            assert.strictEqual(isFloat, true);
            assert.ok(elapsed < 50, `Operation took ${elapsed}ms, should be < 50ms`);
        });
    });

    describe('Error Handling', () => {
        it('should throw on division by zero attempt in expression', () => {
            assert.throws(() => safeEval('1 / 0'), /Invalid result/);
        });

        it('should throw on invalid hex literals', () => {
            assert.throws(() => safeEval('0xGG'), /Invalid characters/);
        });

        it('should throw on invalid binary literals', () => {
            assert.throws(() => safeEval('0b2'), /Invalid characters/);
        });

        it('should throw on unclosed parentheses', () => {
            assert.throws(() => safeEval('(5 + 3'));
        });

        it('should throw on double operators', () => {
            assert.throws(() => safeEval('5 ++ 3'));
        });

        it('should reject empty string', () => {
            assert.throws(() => safeEval(''), /Invalid characters|Invalid result|SyntaxError/);
        });

        it('should handle whitespace in expressions', () => {
            const result = safeEval('5   +   3');
            assert.strictEqual(result, 8);
        });
    });
});
