const inquirer = require('inquirer');
const mkdirp = require('mkdirp');
const cp = require('cp-file');
const replace = require('replace-in-file');
const cmd = require('node-cmd');
const path = require('path');
const colors = require('colors');

const initGit = (projectName, answers) => {
  cmd.run(`cd ${projectName} && git init`);
};

const initDirectoryStructure = (projectName, answers) => {
  const dirs = ['src', 'src/core', 'src/app', 'src/lib', 'config', '.vscode'];
  dirs.forEach(dir => {
    mkdirp(`${projectName}/${dir}`);
  });
};

const initFiles = (projectName, answers) => {
  // copy package.json and replace package name
  cp.sync(
    path.resolve(__dirname, '../resources/package.json'),
    projectName + '/package.json'
  );
  replace.sync({
    files: path.resolve(projectName, 'package.json'),
    from: '$__appName',
    to: projectName,
  });

  // copy meta files
  const metaFiles = [
    '.editorconfig',
    '.eslintignore',
    '.eslintrc.json',
    '.gitignore',
    '.prettierrc',
    'jest.config.js',
  ];

  metaFiles.forEach(file => {
    cp.sync(
      path.resolve(__dirname, '../resources/' + file),
      projectName + '/' + file
    );
  });

  // copy .vscode/*.*
  if (answers.supportVscode) {
    cp.sync(
      path.resolve(__dirname, '../resources/.vscode/extensions.json'),
      projectName + '/.vscode/extensions.json'
    );
    cp.sync(
      path.resolve(__dirname, '../resources/.vscode/launch.json'),
      projectName + '/.vscode/launch.json'
    );
    cp.sync(
      path.resolve(__dirname, '../resources/.vscode/settings.json'),
      projectName + '/.vscode/settings.json'
    );
    cp.sync(
      path.resolve(__dirname, '../resources/.vscode/tasks.json'),
      projectName + '/.vscode/tasks.json'
    );
  }

  // copy config files
  const configFiles = [
    'custom-environment-variables.yml',
    'default.yml',
    'development.yml',
    'production.yml',
  ];

  configFiles.forEach(file => {
    cp.sync(
      path.resolve(__dirname, `../resources/config/${file}`),
      `${projectName}/config/${file}`
    );
  });

  // copy src/bootstrap.js
  cp.sync(
    path.resolve(__dirname, '../resources/bootstrap.js'),
    `${projectName}/src/bootstrap.js`
  );

  // copy core/koa.js
  if (answers.addKoa) {
    cp.sync(
      path.resolve(__dirname, '../resources/core/koa.config.js'),
      `${projectName}/src/core/koa.core.js`
    );
  }

  // copy core/messageBroker.js
  if (answers.addMessageBroker) {
    cp.sync(
      path.resolve(__dirname, '../resources/core/messageBroker.js'),
      `${projectName}/src/core/messageBroker.js`
    );
  }

  // init logger
  cp.sync(
    path.resolve(__dirname, '../resources/core/logger.js'),
    `${projectName}/src/core/logger.js`
  );
  switch (answers.logger) {
    case 'console': {
      replace.sync({
        files: path.resolve(projectName, 'src/core/logger.js'),
        from: '$__logger',
        to: 'console',
      });
    }

    case 'winston': {
      cp.sync(
        path.resolve(__dirname, '../resources/core/winston.config.js'),
        `${projectName}/src/core/winston.config.js`
      );
      replace.sync({
        files: path.resolve(projectName, 'src/core/logger.js'),
        from: '$__logger',
        to: 'require("./winston.config.js")',
      });
    }

    default: {
      replace.sync({
        files: path.resolve(projectName, 'src/core/logger.js'),
        from: '$__logger',
        to: 'console',
      });
    }
  }
};

const initNpm = (projectName, answers) => {
  cmd.run(`cd ${projectName} && npm install`);
};

const questions = [
  {
    type: 'confirm',
    name: 'supportVscode',
    default: true,
    message: 'Add support for Visual Studio Code',
  },
  {
    type: 'confirm',
    name: 'addKoa',
    default: true,
    message: 'Add Koajs',
  },
  {
    type: 'list',
    name: 'logger',
    defalt: 'console',
    message: 'Select default logger',
    choices: [
      {
        name: 'Console',
        value: 'console',
      },
      {
        name: 'Winston',
        value: 'winston',
      },
    ],
  },
];

module.exports = projectName => {
  console.log(
    colors.grey(`\n Generate Project ${colors.bgCyan.white(projectName)}`)
  );

  inquirer
    .prompt(questions)
    .then(answers => {
      initDirectoryStructure(projectName, answers);

      initGit(projectName, answers);

      initFiles(projectName, answers);

      initNpm(projectName, answers);

      colors.green.bold(`Application ${projectName} is created !!!`);
    })
    .catch(e => console.log(e));
};
