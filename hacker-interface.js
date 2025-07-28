const chalk = require('chalk');
const figlet = require('figlet');
const packageJson = require('./package.json');

console.log(
  chalk.green(
    figlet.textSync('UAIS', { horizontalLayout: 'full' })
  )
);

console.log(chalk.blue(`Version ${packageJson.version}`));
console.log(chalk.yellow('Welcome to the UAIS CLI!'));