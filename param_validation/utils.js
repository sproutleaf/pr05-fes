import fs from 'fs';
const typeSet = new Set();

/* ----- Loops through parameterData.json and extracts all param types ----- */

function extractParameterTypes() {
    const extractTypes = (obj) => {
        if (typeof obj === 'object' && obj !== null) {
            if (Array.isArray(obj.params)) {
                obj.params.forEach(param => {
                    if (param.type) {
                        param.type.split('|').forEach(t => {
                            const trimmed = t.trim();
                            if (trimmed !== trimmed.toUpperCase()) {
                                typeSet.add(trimmed);
                            }
                        });
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

            // Note that all Constant types (i.e. BLEND, DARKEST) are in all caps
            console.log(typeSet.size + " unique types found in params:");
            const sortedTypes = Array.from(typeSet).sort();
            // sortedTypes.forEach(t => console.log(t));

            fs.writeFile('parameterTypes.json', JSON.stringify(sortedTypes, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing parameterTypes.json:', writeErr);
                } else {
                    console.log('Successfully wrote parameterTypes.json');
                }
            });
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
        }
    });
}

function removeDescriptionsFromFile() {
    const removeDescriptions = (obj) => {
        if (typeof obj === 'object' && obj !== null) {
            if (Array.isArray(obj)) {
                obj.forEach(removeDescriptions);
            } else {
                delete obj.description;
                Object.values(obj).forEach(removeDescriptions);
            }
        }
        return obj;
    }

    fs.readFile('parameterData.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        try {
            const jsonData = JSON.parse(data);
            const modifiedData = removeDescriptions(jsonData);

            fs.writeFile('parameterData.json', JSON.stringify(modifiedData, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing file:', writeErr);
                } else {
                    console.log('Successfully removed all description fields from parameterData.json');
                }
            });
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
        }
    });
}

extractParameterTypes();
// removeDescriptionsFromFile();