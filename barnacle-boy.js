const rp = require('request-promise');

exports.path = async (req, res) => {
  const payload = req.body;
  if (payload.type === 'url_verification') {
    return res.status(200).json({'challenge': payload.challenge});
  }
  const url = payload.text;
  if (!url || url === "") {
    return res.status(200).end();
  }

  const replacingText = (/^(.*)smb\:\/\/(.*)$/.test(url)) ?
    `lw://file/${url.replace('smb:','')}` : `lw://file/${url.replace(/\\/g, '/')}`;
  try {
    await rp({
      'method' : 'POST',
      'uri' : payload.response_url,
      'headers' : {'Accept': 'application/json', 'Content-Type': 'application/json'},
      'json' : true,
      'body' : {'text' : `<${replacingText}>`}
    });
    console.log(`text:${payload.text}, user:${payload.user_name}`);
  } catch(e) {
    console.log(`post message is failed: ${e}`);
  } finally {
    res.status(200).end();
  }
};