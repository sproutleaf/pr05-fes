# Issues

## Overridden Constants and Functions

**Approaches**:

* Using a JavaScript parser to statically analyze the user's source code, and discover accidentally overridden constants and functions.

  * Out of all the parsers experimented (`oxc`, `SWC`, `Babel`, `Acorn` and `Espree`), `Acorn` and `Espree` are consistently the fastest.

    ![Parser Benchmarking](/images/parser-benchmark.png)

  * Will also experiment with `chevrotain` and `HandBuilt`, based on the performance results generated from this [benchmark](https://chevrotain.io/performance/).

    ![Parsing Libraries](/images/parsing-libraries.png)

* Use `ESLint`, with the options [no-redeclare](https://eslint.org/docs/latest/rules/no-redeclare#rule-details) and [no-param-reassign](https://eslint.org/docs/latest/rules/no-param-reassign#rule-details) enabled. This could mean a very simple change of configuration file. It's also possible to [configure a parser in ESLint](https://eslint.org/docs/latest/use/configure/parser) so that user's source code can be turned into an AST for evalution.

**Next Steps**:

* Benchmark 4 parsers (`Acorn`, `Espree`, `Chevrotain` and `HandBuilt`) with `benchmark.js` for statistically significant results.
* Experiement with using ESLint and custom configuration.

## Parameter Validation

**Approach**: Using a JavaScript validation library at runtime to detect errors.

**Options**:

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

**Validation Libraries Not Being Considered for FES Project**:

* [Zod](https://zod.dev/): Zod, although popular and developer-friendly, was designed primarily for TypeScript

**Next Steps**:

* Go through all the p5.js functions and ensure that all types of parameters can be validated using the above libraries.
* Benchmarking the performance for the above libraries.
* Evaluating the error messages after parameter validation.

**Concerns**:

* Given the amount of p5.js functions, there might be a lot of configuration involved to ensure that all parameters are validated.
* How can we make sure that, if a p5.js function is added or modified, the validation logic will also be updated accordingly? (Maybe we can look at how documentation is updated to keep in sync with source code for now)

# References

* [benchmark.js](https://benchmarkjs.com/): a benchmarking library that supports high-resolution timers and returns statistically significant results.
* [JavaScript Parsing Libraries Benchmark](https://chevrotain.io/performance/)
* [Top 10 Javascript Data Validation Libraries](https://byby.dev/js-object-validators)
