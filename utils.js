const fs = require('fs');
const typeSet = new Set();

/* ----- Loops through parameterData.json and extracts all param types ----- */

const extractTypes = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj.params)) {
            obj.params.forEach(param => {
                if (param.type) {
                    param.type.split('|').forEach(t => typeSet.add(t.trim()));
                }
            });
        }
        Object.values(obj).forEach(extractTypes);
    }
};

fs.readFile('parameterData.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        const jsonData = JSON.parse(data);
        extractTypes(jsonData);

        console.log(typeSet.size + " unique types found in params:");
        Array.from(typeSet).sort().forEach(t => console.log(t));
    } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
    }
});