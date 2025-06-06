const yaml = require('yaml');

// Build a nested tree from flat S3 keys
function buildTree(items, directoriesOnly = false) {
    const root = {};
    for (const item of items) {
        const parts = item.name.split('/').filter(Boolean);
        let node = root;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            // Only add files if its not directories only mode
            if (!node[part]) {
                if (i === parts.length - 1 && !item.name.endsWith('/')) {
                    if (!directoriesOnly) {
                        node[part] = { __file: item };
                    }
                } else {
                    node[part] = {};
                }
            }
            node = node[part];
        }
    }
    return root;
}

// Same as buildTree, but returns the raw object for json/yaml
function buildTreeObject(items, directoriesOnly = false) {
    const root = {};
    for (const item of items) {
        const parts = item.name.split('/').filter(Boolean);
        let node = root;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!node[part]) {
                if (i === parts.length - 1 && !item.name.endsWith('/')) {
                    if (!directoriesOnly) {
                        node[part] = { __file: item };
                    }
                } else {
                    node[part] = {};
                }
            }
            node = node[part];
        }
    }
    return root;
}

// Recursively print the tree with tree characters, thanks ChatGPT!
function printTree(
    node,
    prefix = '',
    fullPath = false,
    pathSoFar = [],
    showSize = false,
    showDate = false,
    sortTime = false,
    maxDepth = undefined,
    currentDepth = 0,
    fileLimit = undefined
) {
    let output = '';
    let entries = Object.entries(node).filter(([k]) => k !== '__file');

    // Sort by lastModified if sortTime is true
    if (sortTime) {
        entries = entries.sort((a, b) => {
            const aTime = a[1].__file?.lastModified || 0;
            const bTime = b[1].__file?.lastModified || 0;
            return bTime - aTime;
        });
    }

    entries.forEach(([name, child], idx) => {
        const last = idx === entries.length - 1;
        const pointer = last ? '└── ' : '├── ';
        const nextPrefix = prefix + (last ? '    ' : '│   ');
        const currentPath = [...pathSoFar, name];
        const displayName = fullPath ? currentPath.join('/') : name;

        if (child.__file) {
            let sizeStr = '';
            if (showSize && child.__file.size !== undefined) {
                sizeStr = ` [${child.__file.size} bytes]`;
            }
            let dateStr = '';
            if (showDate && child.__file.lastModified) {
                dateStr = ` (${new Date(child.__file.lastModified).toISOString()})`;
            }
            output += `${prefix}${pointer}${displayName}${sizeStr}${dateStr}\n`;
        } else {
            output += `${prefix}${pointer}${displayName}\n`;
            // Only recurse if maxDepth is not set or we haven't reached it yet
            // AND fileLimit is not set or we haven't exceeded it
            if (
                (maxDepth === undefined || currentDepth + 1 < maxDepth) &&
                (fileLimit === undefined || Object.keys(child).length <= fileLimit)
            ) {
                output += printTree(
                    child,
                    nextPrefix,
                    fullPath,
                    currentPath,
                    showSize,
                    showDate,
                    sortTime,
                    maxDepth,
                    currentDepth + 1,
                    fileLimit
                );
            } else if (fileLimit !== undefined && Object.keys(child).length > fileLimit) {
                output += `${nextPrefix}[file-limit ${fileLimit} exceeded]\n`;
            }
        }
    });
    return output;
}

function formatTree(items, options = {}) {
    const directoriesOnly = options['directories-only'] || options.d;
    const outputFormat = options.output || options.o || 'text';

    if (outputFormat === 'json') {
        const treeObj = buildTreeObject(items, directoriesOnly);
        return JSON.stringify(treeObj, null, 2);
    }

    if (outputFormat === 'yaml') {
        const treeObj = buildTreeObject(items, directoriesOnly);
        return yaml.stringify(treeObj);
    }

    // Default: text output
    const fullPath = options['full-path'] || options.f;
    const showSize = options['size'] || options.s;
    const showDate = options['date'] || options.D;
    const sortTime = options['sort-time'] || options.t;
    const maxDepth = options['max-depth'] || options.L;
    const fileLimit = options['file-limit'] || options.F;

    const tree = buildTree(items, directoriesOnly);

    let output = '.\n';
    output += printTree(
        tree,
        '',
        fullPath,
        [],
        showSize,
        showDate,
        sortTime,
        maxDepth,
        0,
        fileLimit
    );
    return output;
}

module.exports = {
    formatTree,
};