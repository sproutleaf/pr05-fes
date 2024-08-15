import { z } from 'zod';
import data from './blendMode.json' with {type: "json"};

let schemaRegistry = new Map();
const arrDoc = JSON.parse(JSON.stringify(data));

const schemaMap = {
    'Any': z.any(),
    'Array': z.array(z.any()),
    'Boolean': z.boolean(),
    'Function': z.function(),
    'Integer': z.number().int(),
    'Number': z.number(),
    'Number[]': z.array(z.number()),
    'Object': z.object({}),
    // Allows string for any regex
    'RegExp': z.string().regex((.*?)),
    'String': z.string()
};

const generateZodSchemasForFunc = func => {
    const ichDot = func.lastIndexOf('.');
    const funcName = func.slice(ichDot + 1);
    const funcClass = func.slice(0, ichDot !== -1 ? ichDot : 0) || 'p5';

    let funcInfo = arrDoc[funcClass][funcName];

    let overloads = [];
    if (funcInfo.hasOwnProperty('overloads')) {
        for (const overload of funcInfo.overloads) {
            overloads.push({ params: overload.params });
        }
    }

    const createParamSchema = param => {
        if (param.includes('|')) {
            const types = param.split('|');
            return types.every(t => /^[A-Z]+$/.test(t))
                ? z.enum(types)
                : z.union(types.map(t => schemaMap[t] || z.any()));
        }

        let schema = schemaMap[param.type] || z.any();
        return param.optional ? schema.optional() : schema;
    }

    const overloadSchemas = overloads.map(overload => {
        return z.tuple(overload.params.map(createParamSchema));
    });

    return overloadSchemas.length === 1 ? overloadSchemas[0] : z.union(overloadSchemas);
}

function validateParams(func, args) {
    if (!schemaRegistry.has(func)) {
        let funcSchemas = generateZodSchemasForFunc(func);
        schemaRegistry.set(func, funcSchemas);
    }

    return schemaRegistry.get(func).parse(args);
}

function describeZodSchema(schema, indent = 0) {
    const spaces = '  '.repeat(indent);

    if (schema instanceof z.ZodUnion) {
        return `Union of:\n${schema._def.options.map(option =>
            `${spaces}  - ${describeZodSchema(option, indent + 1)}`
        ).join('\n')}`;
    }

    if (schema instanceof z.ZodTuple) {
        return `Tuple [\n${schema._def.items.map(item =>
            `${spaces}  ${describeZodSchema(item, indent + 1)}`
        ).join(',\n')}\n${spaces}]`;
    }

    if (schema instanceof z.ZodArray) {
        return `Array of ${describeZodSchema(schema.element, indent)}`;
    }

    if (schema instanceof z.ZodObject) {
        const shape = schema._def.shape();
        return `Object {\n${Object.entries(shape).map(([key, value]) =>
            `${spaces}  ${key}: ${describeZodSchema(value, indent + 1)}`
        ).join(',\n')}\n${spaces}}`;
    }

    if (schema instanceof z.ZodOptional) {
        return `Optional(${describeZodSchema(schema._def.innerType, indent)})`;
    }

    if (schema instanceof z.ZodNumber) return 'Number';
    if (schema instanceof z.ZodString) return 'String';
    if (schema instanceof z.ZodBoolean) return 'Boolean';
    if (schema instanceof z.ZodAny) return 'Any';

    return 'Unknown Schema Type';
}

let fillSchemas = generateZodSchemasForFunc('p5.fill');
console.log(describeZodSchema(fillSchemas));
// validateParams('p5.fill', [100, 100, 100, undefined]);
