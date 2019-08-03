const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const packageJson = require('../package.json');
const configItems = require('./config/configItems');

const helpOptions = configItems.map(item => {
  let lastFlag = '';
  if (Array.isArray(item.cliFlag)) {
    lastFlag = item.cliFlag[item.cliFlag.length - 1];
  } else if (item.cliFlag) {
    lastFlag = item.cliFlag;
  }

  return {
    key: item.key,
    flag: lastFlag,
    description: item.description,
    envVar: item.envVar
  };
});

const helpText = `
SQLPad version:  ${packageJson.version}

Usage:  sqlpad [options]

Options:

${helpOptions
  .filter(option => Boolean(option.flag))
  .map(option => {
    return `  --${option.flag}    ${option.description}\n`;
  })
  .join('\n')}`;

// If version is requested show version then exit
if (argv.v || argv.version) {
  console.log('SQLPad version ' + packageJson.version);
  process.exit();
}

// If help is requested show help
if (argv.h || argv.help) {
  console.log(helpText);
  process.exit();
}
