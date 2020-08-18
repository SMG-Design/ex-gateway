// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');
const grpc = require('grpc');
const projectId = 'stoked-reality-284921';
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const axios = require('axios');
const qs = require('querystring');
const exauthURL = process.env.EXAUTH;

const rooms = {};

async function push(
  topicName = 'ex-streamer',
  data = JSON.stringify({foo: 'bar'})
) {
  // Instantiates a client
  const pubsub = new PubSub({grpc, projectId});

  async function publishMessage() {
    const dataBuffer = Buffer.from(data);

    const messageId = await pubsub.topic(topicName).publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
  }

  publishMessage().catch(console.error);
}

io.on('connection', (socket) => {

  // REGISTER
  socket.on('register', async ({
    username,
    password,
    confirm_password,
    grant_type,
    client_id,
    user_type,
    user,
    organisationId
  }) => {
    if (confirm_password === password) {
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      const params = {
        username,
        password,
        client_id,
        grant_type,
        user_type,
        user: JSON.stringify(user)
      };
      // auth does a REST request, not queue managed as it needs instant response
      try {
        const exauthLogin = await axios.post(`${exauthURL}/auth/register`, qs.stringify(params), config);
        if (exauthLogin.status === 200 && exauthLogin.data) {
          const result = exauthLogin.data.response.results.rows[0];
          io.emit('register_success', {
            id: result.public_id,
            user_type: result.user_type,
            user: result.fields,
            status: 'requested'
          });
        }
      } catch (error) {
        io.emit('register_error', {
          status: error.response.status,
          ...error.response.data
        });
      }
    } else {
      io.emit('register_error', {
        message: 'password_not_match'
      });
    }
  });

  // LOGIN
  socket.on('login', async ({ username, password, organisationId }) => {
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    const params = {
      username,
      password,
      client_id: 'null',
      client_secret: 'null',
      grant_type: 'password'
    };
    // auth does a REST request, not queue managed as it needs instant response
    const exauthLogin = await axios.post(`${exauthURL}/auth/login`, qs.stringify(params), config);
    if (exauthLogin.status === 200 && exauthLogin.data && exauthLogin.data.status === 'mfa') {
      // if mfa is enabled, return: 'mfa'
      io.emit('mfa', exauthLogin.data);
    } else if (exauthLogin.status === 200 && exauthLogin.data) {
      // if success, return: 'authorized'
      io.emit('authorized', exauthLogin.data);
      rooms[exauthLogin.data.access_token] = socket;
      socket.join(exauthLogin.data.access_token);
    } else {
      // if failure, return: 'unauthorized'
      io.emit('unauthorized', exauthLogin.data);
    }
  });
});

if (module === require.main) {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}

module.exports = server;
