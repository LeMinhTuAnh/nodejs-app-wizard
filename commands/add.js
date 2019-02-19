const inquirer = require('inquirer');
const colors = require('colors');
const cp = require('cp-file');
const cmd = require('node-cmd');
const path = require('path');
const pathExist = require('path-exists');

const addSchema = () => {
  console.log('add schema');
};

module.exports = {
  addSchema,
};
