const fs = require('fs');
const path = require('path');
const configItems = require('../server/lib/config/configItems')

let md = `

## Config

`;

let rows = ``;

configItems.sort((a, b) => a.key.localeCompare(b.key)).forEach(item => {
  const defaulthtml = item.default ? `<br>default: <code>${item.default}</code>` : '';
  rows += `<tr>
      <td>${item.key}<br />${item.envVar}</td>
      <td>${item.description}${defaulthtml}</td>
    </tr>`;

  let defaultString = item.default ? 'default: `' + item.default + '`\n' : ''
  md += '**' + item.key + '**  \n' + item.description + '  \n' + 'Env var: `' + item.envVar + '`  \n' + defaultString + '\n'
})

const html = `
<table>
  <thead>
    <tr>
      <th>
        key<br/>ENV_VAR
      </th>
      <th>
        description
      </th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
`

fs.writeFileSync(path.join(__dirname, '../CONFIGURATION.md'), md + html, { encoding: 'utf8'})