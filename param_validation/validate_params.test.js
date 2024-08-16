import { assert, describe, expect, test, vi } from 'vitest';
import { validateParams, p5 } from './validate_params';
import { ZodError } from 'zod';

describe('validateParameters: multiple types allowed for single parameter', function () {
    test('saturation(): no firendly-err-msg', () => {
        assert.doesNotThrow(() => {
            validateParams('p5.saturation', ["rgb(255, 128, 128)"]);
        },
            ZodError
        );
        assert.doesNotThrow(() => {
            validateParams('p5.saturation', [[0, 50, 100]]);
        },
            ZodError
        );
        // assert.doesNotThrow(() => {
        //     let c = new p5.Color(0, 50, 100);
        //     validateParams('p5.saturation', [c]);
        // },
        //     Error,
        // );
    });
    test('saturation(): incorrect type of parameter', () => {
        try {
            const result = validateParams('p5.saturation', [true]);
            console.log('Validation result:', result);
            assert.fail('Expected an error to be thrown, but got result: ' + result);
        } catch (error) {
            console.log('Caught error:', error);
            assert(error instanceof ZodError, 'Expected the thrown value to be an instance of ZodError');
        }
    })
})