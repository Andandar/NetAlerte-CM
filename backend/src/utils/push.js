const axios = require('axios');
async function sendPushFCM(token, title, body) {
  await axios.post('https://fcm.googleapis.com/fcm/send', {
    to: token,
    notification: { title, body }
  }, {
    headers: {
      Authorization: `key=${process.env.FCM_SERVER_KEY}`,
      'Content-Type': 'application/json'
    }
  });
}
module.exports = { sendPushFCM }; 