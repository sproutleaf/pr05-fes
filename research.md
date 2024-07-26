# Issues

## Overridden Constants and Functions

**Approaches**:

* Using a JavaScript parser to statically analyze the user's source code, and discover accidentally overridden constants and functions.

  * Out of all the parsers experimented (`oxc`, `SWC`, `Babel`, `Acorn` and `Espree`), `Acorn` and `Espree` are consistently the fastest.

    ![Parser Benchmarking](/images/parser-benchmark.png)

  * ~~Will also experiment with `chevrotain` and `HandBuilt`, based on the performance results generated from this [benchmark](https://chevrotain.io/performance/).~~ **UPDATE**: `chevrotain` is a parser building toolkit for JavaScript and not readily used as a parser, whereas `HandBuilt` is simply not a JavaScript parser. Therefore, I shouldn't experiment with either.

    ![Parsing Libraries](/images/parsing-libraries.png)

* Use `ESLint`, with the options [no-redeclare](https://eslint.org/docs/latest/rules/no-redeclare#rule-details) and [no-param-reassign](https://eslint.org/docs/latest/rules/no-param-reassign#rule-details) enabled. This could mean a very simple change of configuration file. It's also possible to [configure a parser in ESLint](https://eslint.org/docs/latest/use/configure/parser) so that user's source code can be turned into an AST for evalution.

**Measurement**:

* **Dependency Size**: using the dev.2.0 branch, we can do some size investigation. For example, with reference to the rollup visualizer below, we can see that `parameterData.json` currently is 10% of the package size—this can be further reduced. As a point of comparison, `color.js` currently adds ~50kb to the bundle size, and we don't want the parser to be a lot bigger than that.

  ![Rollup Visualizer](/images/rollup-size.png)

* **Performance**: important but not critical, since we have other ways to optimize it (i.e. parsing the string of user code in a worker thread). Regardless, we need to measure performance, and we can do it by running the parser with a larger JavaScript file with p5.js code to produce more statistically significant result.

**Next Steps**:

* Benchmark 2 parsers (`Acorn`, `Espree`) with a larger file and the help of [tinybench](https://github.com/tinylibs/tinybench).
* Experiement with using ESLint by adding an AST-enabled parser and setting custom configuration.

## Parameter Validation

**Approach**: Using a JavaScript validation library at runtime to detect errors.

**Options**:

* [Zod](https://zod.dev/): a Typescript-first schema validation tool with static type inference. Currently, p5.js documentation fits the jsdoc format, and can be readily leveraged upon to generate TypeScript definitions to be used with `Zod`.

  * `Zod` is already used in p5's website building process.

* [joi](https://www.npmjs.com/package/joi): Feature-rich, powerful, provides detailed error messages out-of-the-box that can be used in FES. Multiple definitions possible to support complex overloading of functions. However, performance might be slow as a result of the rich suite of features (pending benchmarking). Example usage below:

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

* [yup](https://www.npmjs.com/package/yup): Commonly used in frontend applications with capabilities to deal with complex overloading. Able to leverage on declarative schema definition and asynchronous validation. Example usage below:

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

* [superstruct](https://docs.superstructjs.org/): lightweight library with high performance and easy custom validation. Example usage below:

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

~~**Validation Libraries Not Being Considered for FES Project**:~~

~~* [Zod](https://zod.dev/): Zod, although popular and developer-friendly, was designed primarily for TypeScript~~

**Measurement**:

* **Performance** is more important for this task because we are executing parameter validation at runtime.

**Next Steps**:

* ~~Go through all the p5.js functions and ensure that all types of parameters can be validated using the above libraries.~~ **UPDATE**: won't be a concern because we are going to use `p5js/docs/reference/data.json` and `p5js/docs/reference/parameterData.json` readily.
* Benchmarking the performance for the above libraries, with priority given to `Zod`.
* Evaluating the error messages after parameter validation.

**Concerns: (ALL ADDRESSED DURING MEETING)**

* ~~Given the amount of p5.js functions, there might be a lot of configuration involved to ensure that all parameters are validated.~~
* ~~How can we make sure that, if a p5.js function is added or modified, the validation logic will also be updated accordingly? (Maybe we can look at how documentation is updated to keep in sync with source code for now)~~

## Related GitHub Issues

* [#6972](https://github.com/processing/p5.js/pull/6972): TypeScript type exporting
* [#6959](https://github.com/processing/p5.js/issues/6959): interleaved API paramters
* [#6597](https://github.com/processing/p5.js/issues/6597): wrapping top-level function calls in a decorator

## References

* [benchmark.js](https://benchmarkjs.com/): a benchmarking library that supports high-resolution timers and returns statistically significant results.
* [JavaScript Parsing Libraries Benchmark](https://chevrotain.io/performance/)
* [Top 10 Javascript Data Validation Libraries](https://byby.dev/js-object-validators)
