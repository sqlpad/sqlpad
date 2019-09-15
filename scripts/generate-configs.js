const fs = require('fs');
const path = require('path');
const configItems = require('../server/lib/config/configItems')

let rows = ``;

configItems.sort((a, b) => a.key.localeCompare(b.key)).forEach(item => {
  const defaulthtml = item.default ? `<br>default: <code>${item.default}</code>` : '';
  rows += `<tr>
      <td>${item.key}</td>
      <td>${item.envVar}</td>
      <td>${item.description}${defaulthtml}</td>
    </tr>`;
})

const html = `
<table>
  <thead>
    <tr>
      <th>
        key
      </th>
      <th>
        Env var
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

fs.writeFileSync(path.join(__dirname, '../CONFIGURATION.md'), html, { encoding: 'utf8'})