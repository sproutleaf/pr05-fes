import { assert, describe, test, vi } from 'vitest';
import { validateParams } from './validate_params';
import { ZodError } from 'zod';

vi.mock('p5', () => ({
    default: {
        Color: MockP5Color
    }
}));

describe('validateParameters: multiple types allowed for single parameter', function () {
    test('saturation(): no friendly-err-msg', () => {
        assert.doesNotThrow(() => {
            validateParams('p5.saturation', ["rgb(255, 128, 128)"]);
        }, ZodError);
        assert.doesNotThrow(() => {
            validateParams('p5.saturation', [[0, 50, 100]]);
        }, ZodError);
        assert.doesNotThrow(() => {
            let c = new MockP5Color(0, 50, 100);
            validateParams('p5.saturation', [c]);
        }, ZodError);
    });
    test('saturation(): incorrect type of parameter', () => {
        assert.throws(() => {
            validateParams('p5.saturation', [true]);
        }, ZodError);
    })
});

// Note that this test is not accurate—the constant passed in should be a variable, instead of a string. This will be fixed as the code is moved to the p5.js repo and constants imported.
describe('validateParameters: constant as parameter', function () {
    test('blendMode(): no friendly-err-msg', () => {
        assert.doesNotThrow(() => {
            validateParams('p5.blendMode', ["MULTIPLY"]);
        }, ZodError);
    });
    test('blendMode(): wrong constant', () => {
        assert.throws(() => {
            validateParams('p5.blendMode', ["WRONG"]);
        }, ZodError);
    });
    test('blendMode(): wrong type of parameter', () => {
        assert.throws(() => {
            validateParams('p5.blendMode', [100]);
        }, ZodError);
    });
});

describe('validateParameters: overloaded functions with optional parameter', function () {
    test('fill(): no friendly-err-msg', () => {
        assert.doesNotThrow(() => {
            validateParams('p5.fill', [100, 100, 100, 0.5]);
        }, ZodError);
        assert.doesNotThrow(() => {
            validateParams('p5.fill', [100, 100, 100, undefined]);
        }, ZodError);
        assert.doesNotThrow(() => {
            validateParams('p5.fill', [100, 100, 100]);
        }, ZodError);
        assert.doesNotThrow(() => {
            validateParams('p5.fill', ["Black"]);
        }, ZodError);
        assert.doesNotThrow(() => {
            validateParams('p5.fill', [255, 255]);
        }, ZodError);
        assert.doesNotThrow(() => {
            validateParams('p5.fill', [[255, 255, 255]]);
        }, ZodError);
        assert.doesNotThrow(() => {
            let c = new MockP5Color(255, 255, 255);
            validateParams('p5.fill', [c]);
        }, ZodError);
    });
});