const axios = require('axios');

const sendMessage = (phone, message) => {
  axios({
    method: 'POST',
    url: 'https://d7sms.p.rapidapi.com/secure/send',
    headers: {
      'content-type': 'application/json',
      authorization: 'Basic Znp1ZjUxODI6aU9ydWNnSko=',
      'x-rapidapi-host': 'd7sms.p.rapidapi.com',
      'x-rapidapi-key': 'db9064791emsh291cc13852a96bap138adfjsnc8fa1dc21713',
      accept: 'application/json',
      useQueryString: true,
    },
    data: {
      to: 971562316353,
      from: 'D7-Rapid',
      content: 'Test Message',
    },
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};
module.exports = sendMessage;
