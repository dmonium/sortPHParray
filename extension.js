const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Extensión "php-array-sorter" activada!');

    let disposable = vscode.commands.registerCommand('extension.sortPhpArray', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No hay un editor de texto activo.');
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage('Por favor, selecciona un array de PHP para ordenar.');
            return;
        }

        const text = editor.document.getText(selection);

        try {
            // Usamos las funciones de parseo y reconstrucción adaptadas de tu código web
            const parsedObject = parsePhpArray(text);
            const sortedObject = sortObject(parsedObject);
            const sortedPhpString = rebuildPhpArray(sortedObject);

            editor.edit(editBuilder => {
                editBuilder.replace(selection, sortedPhpString);
            });

            vscode.window.showInformationMessage('¡Array de PHP ordenado con éxito!');
        } catch (e) {
            vscode.window.showErrorMessage(`Error al ordenar el array: ${e.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };

// =============================
// Lógica de Parseo (Adaptada de tu código web)
// =============================

function parsePhpArray(str) {
    let content = str.trim();
    if (content.startsWith('[') && content.endsWith(']')) {
        content = content.substring(1, content.length - 1).trim();
    } else {
        throw new Error("El array debe comenzar y terminar con corchetes.");
    }
    if (!content) return {};

    let balance = 0;
    let inString = false;
    let quoteChar = '';
    let isAssociative = false;
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (char === "'" || char === '"') {
            if (!inString) {
                inString = true;
                quoteChar = char;
            } else if (char === quoteChar) {
                inString = false;
            }
        }
        if (!inString) {
            if (char === '[' || char === '(') balance++;
            else if (char === ']' || char === ')') balance--;
            else if (content.substring(i, i + 2) === '=>' && balance === 0) {
                isAssociative = true;
                break;
            }
        }
    }

    if (isAssociative) {
        return parseAssociativeArray(content);
    } else {
        return parseIndexedArray(content);
    }
}

function parseIndexedArray(str) {
    let result = [];
    let balance = 0;
    let start = 0;
    let inString = false;
    let quoteChar = '';

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === "'" || char === '"') {
            if (!inString) {
                inString = true;
                quoteChar = char;
            } else if (char === quoteChar) {
                inString = false;
            }
        }
        if (!inString) {
            if (char === '[' || char === '(') {
                balance++;
            } else if (char === ']' || char === ')') {
                balance--;
            } else if (char === ',' && balance === 0) {
                const itemStr = str.substring(start, i).trim();
                if (itemStr) {
                    result.push(parseValue(itemStr));
                }
                start = i + 1;
            }
        }
    }
    const lastItemStr = str.substring(start).trim();
    if (lastItemStr) {
        result.push(parseValue(lastItemStr));
    }
    return result;
}

function parseAssociativeArray(str) {
    const obj = {};
    let balance = 0;
    let start = 0;
    let inString = false;
    let quoteChar = '';
    let lastSplit = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === "'" || char === '"') {
            if (!inString) {
                inString = true;
                quoteChar = char;
            } else if (char === quoteChar) {
                inString = false;
            }
        }
        
        if (!inString) {
            if (char === '[' || char === '(') balance++;
            else if (char === ']' || char === ')') balance--;
            else if (char === ',' && balance === 0) {
                const pairStr = str.substring(lastSplit, i).trim();
                if (pairStr.includes('=>')) {
                    const idx = pairStr.indexOf('=>');
                    const keyStr = pairStr.substring(0, idx).trim();
                    const valueStr = pairStr.substring(idx + 2).trim();
                    const key = parseValue(keyStr);
                    obj[key] = parseValue(valueStr);
                }
                lastSplit = i + 1;
            }
        }
    }
    const lastPairStr = str.substring(lastSplit).trim();
    if (lastPairStr.includes('=>')) {
        const idx = lastPairStr.indexOf('=>');
        const keyStr = lastPairStr.substring(0, idx).trim();
        const valueStr = lastPairStr.substring(idx + 2).trim();
        const key = parseValue(keyStr);
        obj[key] = parseValue(valueStr);
    }
    return obj;
}

function parseValue(valueStr) {
    if (valueStr === undefined || valueStr === null) return null;
    valueStr = valueStr.trim();
    
    if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
        return parsePhpArray(valueStr);
    }
    
    if ((valueStr.startsWith("'") && valueStr.endsWith("'")) || (valueStr.startsWith('"') && valueStr.endsWith('"'))) {
        return valueStr.slice(1, -1);
    }

    if (/^-?\d+(\.\d+)?$/.test(valueStr)) {
        return parseFloat(valueStr);
    }

    if (/^(true|false)$/i.test(valueStr)) return valueStr.toLowerCase() === 'true';
    if (/^null$/i.test(valueStr)) return null;

    // Trata las variables, funciones, etc. como valores "crudos"
    return { __raw: valueStr };
}

// =============================
// Lógica de Ordenamiento (Adaptada de tu código web)
// =============================

function sortObject(obj) {
    if (typeof obj !== 'object' || obj === null || (obj && obj.__raw)) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sortObject(item));
    }

    const sortedKeys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
    const newObject = {};
    sortedKeys.forEach(key => {
        newObject[key] = sortObject(obj[key]);
    });
    return newObject;
}

// =============================
// Lógica de Reconstrucción (Adaptada de tu código web)
// =============================

function rebuildPhpArray(obj, indent = 0) {
    const indentStr = '    '.repeat(indent);
    const nextIndentStr = '    '.repeat(indent + 1);

    if (obj && typeof obj === 'object' && obj.__raw) {
        return obj.__raw;
    }

    if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        const items = obj.map(item => rebuildPhpArray(item, indent + 1));
        return `[\n${nextIndentStr}${items.join(`,\n${nextIndentStr}`)}\n${indentStr}]`;
    }

    if (typeof obj === 'object' && obj !== null) {
        const keys = Object.keys(obj);
        if (keys.length === 0) return '[]';
        const entries = keys.map(key => {
            const value = obj[key];
            const formattedValue = rebuildPhpArray(value, indent + 1);
            return `${nextIndentStr}'${key}' => ${formattedValue}`;
        });
        return `[\n${entries.join(',\n')}\n${indentStr}]`;
    }

    if (typeof obj === 'string') {
        const safe = obj.replace(/'/g, "\\'");
        return `'${safe}'`;
    }
    if (typeof obj === 'number') {
        return obj.toString();
    }
    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false';
    }
    if (obj === null) {
        return 'null';
    }

    return String(obj);
}