#!/usr/bin/env node
const cli = require('./cli');

const main = async () => {
    try {
        await cli();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

main();