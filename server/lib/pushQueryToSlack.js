const logger = require('./logger');
const request = require('request');

function pushQueryToSlack(config, query) {
  const SLACK_WEBHOOK = config.get('slackWebhook');
  if (SLACK_WEBHOOK) {
    const PUBLIC_URL = config.get('publicUrl');
    const BASE_URL = config.get('baseUrl');

    const options = {
      method: 'post',
      body: {
        text: `New Query <${PUBLIC_URL}${BASE_URL}/queries/${query._id}|${
          query.name
        }> 
saved by ${query.modifiedBy} on SQLPad 
${'```sql'}
${query.queryText}
${'```'}`
      },
      json: true,
      url: SLACK_WEBHOOK
    };
    request(options, function(err) {
      if (err) {
        logger.error(err, 'Problem sending query to slack');
      }
    });
  }
}

module.exports = pushQueryToSlack;
