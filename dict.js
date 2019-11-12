#!/usr/bin/env node
const run_script = require('./lib/parser_and_executer').parse_and_execute;
// allow commander to parse `process.argv`

run_script(process.argv);