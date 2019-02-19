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
    '.prettierrc',
    'jest.config.js',
  ];

  metaFiles.forEach(file => {
    cp.sync(
      path.resolve(__dirname, '../resources/' + file),
      projectName + '/' + file
    );
  });

  cp.sync(
    path.resolve(__dirname, '../resources/.gitignore.sample'),
    projectName + '/.gitignore'
  );

  // copy .vscode/*.*
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

  // copy core/koa.js and setup api using Koajs
  if (answers.addKoa) {
    cp.sync(
      path.resolve(__dirname, '../resources/core/koa.config.js'),
      `${projectName}/src/core/koa.core.js`
    );
    cp.sync(
      path.resolve(__dirname, '../resources/app/handler.js'),
      `${projectName}/src/app/handler.js`
    );
    cp.sync(
      path.resolve(__dirname, '../resources/app/router.js'),
      `${projectName}/src/app/router.js`
    );
    replace.sync({
      files: path.resolve(projectName, 'src/bootstrap.js'),
      from: '$__router',
      to: `const router = require('./app/router');`,
    });
    replace.sync({
      files: path.resolve(projectName, 'src/bootstrap.js'),
      from: '$__koaConf',
      to: `const app = require('./config/koa.config')(router, logger);');`,
    });
    replace.sync({
      files: path.resolve(projectName, 'src/bootstrap.js'),
      from: '$__startApiServerDeclare',
      to: `const startApiServer = () =>
      new Promise((resolve, reject) => {
        http.createServer(app.callback()).listen(config.get('port'), err => {
          if (err) return reject(err);
          resolve();
        });
      });`,
    });
    replace.sync({
      files: path.resolve(projectName, 'src/bootstrap.js'),
      from: '$__startApiServerExecute',
      to: `await startApiServer();`,
    });
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
  988;
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
