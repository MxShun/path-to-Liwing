const rp = require('request-promise');

exports.path =  async (req, res) => {
  const payload = req.body;
  if (payload.type === 'url_verification') {
    return res.status(200).json({'challenge': payload.challenge});
  }

  let message = payload.text;
  let postText;
  // 空メッセージのときはUsageを表示
  if (!message || message === "") {
    postText = 'Usage: /path -l(optional) <path>';
  }
  else {
    // -lオプション付き：Mac↔Liwingパス変換
    if(message.startsWith('-l ')) {
      message = message.replace('-l ', '');
      postText = (/^(.*)smb\:\/\/(.*)$/.test(message)) ?
      `<lw://file/${message.replace('smb:', '')}>` : `<smb:${message.replace(/\\/g, '/').replace('lw://file/', '')}>`;
    }
    // 通常：Mac↔Windowパス変換
    else {
      postText = (/^(.*)smb\:\/\/(.*)$/.test(message)) ?
        `<${(message.replace(/\//g, '\\')).replace('smb:', '')}>` : `<smb:${message.replace(/\\/g, '/')}>`;
    }
  }

  try {
    await rp({
      'method': 'POST',
      'uri': payload.response_url,
      'headers': {'Accept': 'application/json', 'Content-Type': 'application/json'},
      'json': true,
      'body': {'text': postText}
    });
    console.log(`text:${payload.text}, user:${payload.user_name}`);
  } catch(e) {
    console.log(`post message is failed: ${e}`);
  } finally {
    res.status(200).end();
  }
};