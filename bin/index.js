#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const pathExists = require('path-exists');
const colors = require('colors');
const { prompt } = require('inquirer');

const generate = require('../commands/generate');
const add = require('../commands/add');

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


program
  .command('add <type>')
  .alias('a')
  .description('Add component to app')
  .action(type => {
    console.log(type);
    if (!type) {
      prompt([
        {
          type: 'list',
          name: 'type',
          message: 'Select component type',
          choices: [
            {
              name: 'Schema',
              value: 'schema',
            },
          ],
        },
      ])
        .then(answers => {
          switch (answers.type) {
            case 'schema': {
              add.addSchema();
              break;
            }

            default: {
              process.exit(0);
            }
          }
        })
        .catch(e => console.error(e));
    }
  });

program.parse(process.argv);
