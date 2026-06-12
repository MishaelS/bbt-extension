import * as assert from 'assert';

describe('ASCII Mode Tests', () => {
    describe('Hex detection', () => {
        it('should detect valid hex codes', () => {
            const hexPattern = /^[0-9a-fA-F]{1,2}$/;
            assert.strictEqual(hexPattern.test('FF'), true);
            assert.strictEqual(hexPattern.test('0A'), true);
            assert.strictEqual(hexPattern.test('1'), true);
        });

        it('should reject invalid hex codes', () => {
            const hexPattern = /^[0-9a-fA-F]{1,2}$/;
            assert.strictEqual(hexPattern.test('FFF'), false);
            assert.strictEqual(hexPattern.test('GH'), false);
        });

        it('should detect hex with 0x prefix', () => {
            const withPrefix = '0xFF';
            const withoutPrefix = withPrefix.replace(/^0x/i, '');
            assert.strictEqual(withoutPrefix, 'FF');
        });
    });

    describe('Dec detection', () => {
        it('should detect valid decimal codes', () => {
            const decPattern = /^\d+$/;
            assert.strictEqual(decPattern.test('72'), true);
            assert.strictEqual(decPattern.test('255'), true);
            assert.strictEqual(decPattern.test('0'), true);
        });

        it('should reject invalid decimal codes', () => {
            const decPattern = /^\d+$/;
            assert.strictEqual(decPattern.test('72a'), false);
        });
    });

    describe('Character conversion', () => {
        it('should convert ASCII code to character', () => {
            const codes = [72, 101, 108, 108, 111];
            const text = codes.map(c => String.fromCharCode(c)).join('');
            assert.strictEqual(text, 'Hello');
        });

        it('should convert character to ASCII code', () => {
            const text = 'Hello';
            const codes = Array.from(text).map(c => c.charCodeAt(0));
            assert.deepStrictEqual(codes, [72, 101, 108, 108, 111]);
        });

        it('should handle special characters', () => {
            const newlineCode = 10;
            assert.strictEqual(String.fromCharCode(newlineCode), '\n');

            const carriageReturnCode = 13;
            assert.strictEqual(String.fromCharCode(carriageReturnCode), '\r');

            const tabCode = 9;
            assert.strictEqual(String.fromCharCode(tabCode), '\t');
        });

        it('should mark non-printable characters', () => {
            const nonPrintableCode = 1;
            const isPrintable = nonPrintableCode >= 32 && nonPrintableCode <= 126;
            assert.strictEqual(isPrintable, false);
        });
    });

    describe('Hex to text conversion', () => {
        it('should convert hex array to text', () => {
            const hexBytes = ['48', '65', '6C', '6C', '6F'];
            const text = hexBytes.map(b => String.fromCharCode(parseInt(b, 16))).join('');
            assert.strictEqual(text, 'Hello');
        });

        it('should handle hex string without spaces', () => {
            const hexString = '48656C6C6F';
            const bytes: string[] = [];
            for (let i = 0; i < hexString.length; i += 2) {
                bytes.push(hexString.substr(i, 2));
            }

            const text = bytes.map(b => String.fromCharCode(parseInt(b, 16))).join('');
            assert.strictEqual(text, 'Hello');
        });

        it('should handle hex with 0x prefix', () => {
            const input = '0x48 0x65 0x6C 0x6C 0x6F';
            const cleaned = input.replace(/0x/gi, '').trim();
            const bytes = cleaned.split(/\s+/);
            const text = bytes.map(b => String.fromCharCode(parseInt(b, 16))).join('');
            assert.strictEqual(text, 'Hello');
        });
    });

    describe('Dec to text conversion', () => {
        it('should convert decimal array to text', () => {
            const decCodes = [72, 101, 108, 108, 111];
            const text = decCodes.map(c => String.fromCharCode(c)).join('');
            assert.strictEqual(text, 'Hello');
        });

        it('should parse space-separated decimals', () => {
            const input = '72 101 108 108 111';
            const codes = input.trim().split(/\s+/).map(c => parseInt(c, 10));
            const text = codes.map(c => String.fromCharCode(c)).join('');
            assert.strictEqual(text, 'Hello');
        });
    });

    describe('Text to codes conversion', () => {
        it('should convert text to hex codes', () => {
            const text = 'Hello';
            const hexCodes = Array.from(text).map(c => 
                '0x' + c.charCodeAt(0).toString(16).toUpperCase()
            );
            assert.deepStrictEqual(hexCodes, ['0x48', '0x65', '0x6C', '0x6C', '0x6F']);
        });

        it('should convert text to decimal codes', () => {
            const text = 'Hello';
            const decCodes = Array.from(text).map(c => c.charCodeAt(0).toString());
            assert.deepStrictEqual(decCodes, ['72', '101', '108', '108', '111']);
        });

        it('should pad hex codes to 2 digits', () => {
            const code = 10;
            const hex = code.toString(16).toUpperCase().padStart(2, '0');
            assert.strictEqual(hex, '0A');
        });
    });
});