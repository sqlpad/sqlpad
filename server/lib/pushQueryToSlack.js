const config = require('./config');
const request = require('request');

function pushQueryToSlack(query) {
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
            ${'```'}
            ${query.queryText}
            ${'```'}`
      },
      json: true,
      url: SLACK_WEBHOOK
    };
    request(options, function(err) {
      if (err) {
        console.error('Something went wrong while sending to Slack.');
        console.error(err);
      }
    });
  }
}

module.exports = pushQueryToSlack;
