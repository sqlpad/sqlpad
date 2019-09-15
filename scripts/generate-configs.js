const fs = require('fs');
const path = require('path');
const configItems = require('../server/lib/config/configItems')

let md = '';

configItems.filter(item => item.key !== 'config').sort((a, b) => a.key.localeCompare(b.key)).forEach(item => {
  const key = `**${item.key}**  \n`;
  const description = `${item.description}  \n`;
  const envVar = `Env var: \`${item.envVar}\`  \n`;
  const defaultString = item.default ? 'Default: `' + item.default + '`\n' : '';

  md += key + description + envVar + defaultString + '\n'
})

const readme = fs.readFileSync(path.join(__dirname, '../README.md'), { encoding: 'utf8' });

const findRegEx = /### Config variables.*## Development/s;
const replaceVal = `### Config variables  \n\n${md}## Development`;
const writeVal = readme.replace(findRegEx, replaceVal);

fs.writeFileSync(path.join(__dirname, '../README.md'), writeVal, { encoding: 'utf8'})