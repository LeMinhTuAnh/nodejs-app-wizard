#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const pathExists = require('path-exists');
const colors = require('colors');
const { prompt } = require('inquirer');

const generate = require('../commands/generate');

program.version('0.0.1').description('Nodejs App Wizard');

program
  .command('generate <projectName>')
  .alias('g')
  .description('Generate new Nodejs application')
  .action(projectName => {
    prompt([]).then(answers => {
      if (pathExists.sync(path.resolve(process.cwd(), projectName))) {
        console.log(
          colors.red.bold(`Error! Directory ${projectName} already exist`)
        );
        process.exit(1);
      }
      generate(projectName);
    });
  });

program.parse(process.argv);
