# Revamping the Friendly Error System (FES) in p5.js

**Author**: [Miaoye Que](https://github.com/sproutleaf)\
**pr05 Mentors**: [Dave Pagurek](https://github.com/davepagurek), [Kenneth Lim](https://github.com/limzykenneth)\
**p5.js Lead**: [Qianqian Ye](https://github.com/Qianqianye)

## Table of Content

- [Revamping the Friendly Error System (FES) in p5.js](#revamping-the-friendly-error-system-fes-in-p5js)
  - [Table of Content](#table-of-content)
  - [#1: Overridden Constants and Functions](#1-overridden-constants-and-functions)
  - [#2: Parameter Validation](#2-parameter-validation)
  - [Road Map](#road-map)
  - [Project Timeline](#project-timeline)
  - [Related GitHub Issues](#related-github-issues)
  - [References](#references)

## #1: Overridden Constants and Functions

**Approach**:

- Use a JavaScript parser to statically analyze the user's source code, and discover accidentally overridden constants and functions.

  - Out of all the parsers experimented (`oxc`, `SWC`, `Babel`, `Acorn` and `Espree`), `Acorn` and `Espree` are consistently the fastest. Experiment here is based on [Ken's repo](https://github.com/limzykenneth/p5-fes).

    ![Parser Benchmarking](/images/parser-benchmark.png)

  - Wrote a file with hundreds of p5 overrides for `Acorn` and `Espree` to parse; benchmarked results show that `Espree` is a lot faster on a sigfinicantly larger file.
  
    ![Acorn vs Espree](/images/acorn-espree.png)

- We also noted that `Espree` is the default parser in and developed by `ESLint`. It's possible for us to incorporate `ESLint` in p5.js, use `Espree` and customize with various `ESLint` rules, such as [no-redeclare](https://eslint.org/docs/latest/rules/no-redeclare#rule-details) and [no-param-reassign](https://eslint.org/docs/latest/rules/no-param-reassign#rule-details). However, this might not be needed eventually since `ESLint` comes with many default configurations that seem excessive for p5's use case and out of scope for what we want to offer to the users.

**Measurement**:

- **Dependency Size**: using the dev.2.0 branch, we can do some size investigation. For example, with reference to the rollup visualizer below, we can see that `parameterData.json` currently is 10% of the package size—this can be further reduced. As a point of comparison, `color.js` currently adds ~50kb to the bundle size, and we don't want the parser to be a lot bigger than that.

  ![Rollup Visualizer](/images/rollup-size.png)

- **Performance**: important but not critical, since we have other ways to optimize it (i.e. parsing the string of user code in a worker thread). Regardless, we need to measure performance, and we can do it by running the parser with a larger JavaScript file with p5.js code to produce more statistically significant result.

**Next Steps**:

- [x] Benchmark 2 parsers (`Acorn`, `Espree`) with a larger file and the help of [tinybench](https://github.com/tinylibs/tinybench).
- [ ] Add `Espree` to where we [currently detect overridden constants and functions](https://github.com/processing/p5.js/blob/b99f57f9a2c25c636e69b7d7944991a14ad7c0c2/src/core/friendly_errors/sketch_reader.js#L4).

## #2: Parameter Validation

**Current Approach**:

Currently, parameter validation has the workflow below:

- Based on p5.js documentation, [build a copy of data](https://github.com/processing/p5.js/blob/4fd250812b48a364ac464f106d0d2c086f28ee33/docs/preprocessor.js#L217) for all functions with only the parts required by FES.
- [Reduce the data above to a simpler format](https://github.com/processing/p5.js/blob/dev-2.0/utils/convert.js).
- The generated file, `parameterData.json` is then used with [validate_params.js](https://github.com/processing/p5.js/blob/dev-2.0/src/core/friendly_errors/validate_params.js) at runtime to generate errors for the users.

This approach has several issues:

- `parameterData.json` is substantial in size.
- Parameter validation's latency can be further reduced.

**Proposed Approach**:

Use [Zod](https://zod.dev/), a TypeScript-first schema validation library with static type inference to perform parameter validation.

`Zod` has the following advantages:

- `Zod` is already used in p5's website building process, see [config for p5's website](https://github.com/processing/p5.js-website/blob/main/src/content/tutorials/config.ts#L19). Using `Zod` improves consistency in the p5.js ecosystem.
- `Zod`-based schema definitions should be more concise than `parameterData.json`.
- Among similar libraries, `Zod` is a top-tier choice. See [Comparison](https://zod.dev/?id=comparison), where `Zod` is compared with some other widely-used validation libraries, including `joi` and `yup`, which will be introduced below.

**Other Options Explored**:

- [joi](https://www.npmjs.com/package/joi): Feature-rich, powerful, provides detailed error messages out-of-the-box that can be used in FES. Multiple definitions possible to support complex overloading of functions. However, performance might be slow as a result of the rich suite of features (pending benchmarking). Example usage below:

```javascript
const Joi = require('joi');

const blendModeSchema = Joi.string().valid('BLEND', 'MULTIPLY', 'ADD');
const endShapeSchema = Joi.string().valid('CLOSE');

function validateParameters(schema, params) {
  const { error } = schema.validate(params);
  if (error) {
    console.error(`Invalid parameters: ${error.message}`);
    return false;
  }
  return true;
}

validateParameters(Joi.array().items(blendModeSchema), ['BLEND']);
validateParameters(Joi.array().items(blendModeSchema), ['INVALID']);
```

- [yup](https://www.npmjs.com/package/yup): Commonly used in frontend applications with capabilities to deal with complex overloading. Able to leverage on declarative schema definition and asynchronous validation. Example usage below:

```javascript
const yup = require('yup');

const blendModeSchema = yup.string().oneOf(['BLEND', 'MULTIPLY', 'ADD']);
const endShapeSchema = yup.string().oneOf(['CLOSE']);

function validateParameters(schema, params) {
  try {
    schema.validateSync(params);
    return true;
  } catch (error) {
    console.error(`Invalid parameters: ${error.message}`);
    return false;
  }
}

validateParameters(yup.array().of(blendModeSchema), ['BLEND']);
validateParameters(yup.array().of(blendModeSchema), ['INVALID']);
```

- [superstruct](https://docs.superstructjs.org/): lightweight library with high performance and easy custom validation. Example usage below:

```javascript
const { struct, enums, array } = require('superstruct');

// Define schemas for blendMode and endShape
const blendModeSchema = enums(['BLEND', 'MULTIPLY', 'ADD']);
const endShapeSchema = enums(['CLOSE']);

function validateParameters(schema, params) {
  try {
    schema(params);
    return true;
  } catch (error) {
    console.error(`Invalid parameters: ${error.message}`);
    return false;
  }
}

console.log(validateParameters(array(blendModeSchema), ['BLEND']));
console.log(validateParameters(array(blendModeSchema), ['INVALID']));
```

**Measurement**:

- **Performance** is more important for this task because we are executing parameter validation at runtime.

## Road Map

- [ ] Overridden Constants and Functions
  - [x] Select a parser (or ESLint config + AST-enabled parser)
  - [ ] Replace current method (comparing user's internal with p5.js code) with parser method
  - [ ] Test for dependency size reduction

- [ ] Parameter Validation
  - [ ] Write a parser that would generate Zod schemas from `parameterData.json`
  - [ ] Replace current parameter validation with Zod-based parameter validation
  - [ ] Clean up legacy code usage
  - [ ] Support interleaved parameters (not a priority)
  - [ ] Support top-level parameter validation wrapping (not a priority)

- [ ] Additional Tasks (lower priority & implementation optional)
  - [ ] Catch errors that do not originate from p5.js and provide friendly errors
  - [ ] Expand and complete the internationalization feature of FES

## Project Timeline

- July
  - [x] Finish Research
  - [x] Finish writing project plan

- August
  - [ ] Implementing parameter validation (first 2 weeks)
  - [ ] Implementing detecting overridden constants and functions (second 2 weeks)

- September
  - [ ] Integration, revision, and testing
  - [ ] Investigate other areas for FES improvements, select prioritized items

- October
  - [ ] Draft research docs and start experiments for additional areas
  - [ ] Documentation and final presentation

## Related GitHub Issues

- [#6972](https://github.com/processing/p5.js/pull/6972): TypeScript type exporting
- [#6959](https://github.com/processing/p5.js/issues/6959): interleaved API parameters
- [#6597](https://github.com/processing/p5.js/issues/6597): wrapping top-level function calls in a decorator

## References

- [zod-accelerator](https://github.com/duplojs/duplojs-zod-accelerator): accelerates Zod's throughput up to ~100x.
- [benchmark.js](https://benchmarkjs.com/): a benchmarking library that supports high-resolution timers and returns statistically significant results.
- [JavaScript Parsing Libraries Benchmark](https://chevrotain.io/performance/)
- [Top 10 Javascript Data Validation Libraries](https://byby.dev/js-object-validators)
- [Parameters and Return Types Validation for Functions](https://github.com/colinhacks/zod/issues/3394)