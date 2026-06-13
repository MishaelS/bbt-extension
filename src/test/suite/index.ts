import glob from 'glob';
import Mocha from 'mocha';
import * as path from 'path';

export function run(): Promise<void>
{
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000
    });

    const testsRoot = path.resolve(__dirname, '.');

    return new Promise((c, e) => {
        glob('*.test.js', { cwd: testsRoot, ignore: ['hover.test.js', 'number.test.js', 'ascii.test.js'] }, (err: Error | null, files: string[]) => {
            if (err) {
                return e(err);
            }

            console.log(`Found ${files.length} integration test files:`, files);

            // Add only integration test files
            files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

            try {
                if (files.length === 0) {
                    console.log('No integration tests found, skipping...');
                    c();
                    return;
                }

                mocha.run((failures: number) => {
                    if (failures > 0) {
                        e(new Error(`${failures} tests failed.`));
                    } else {
                        c();
                    }
                });
            } catch (err) {
                e(err);
            }
        });
    });
}