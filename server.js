if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');
const grpc = require('grpc');
const projectId = 'stoked-reality-284921';
const io = require('socket.io')(process.env.PORT || 8880, {
  serveClient: false
});
const axios = require('axios');
const exauthURL = process.env.EXAUTH;

// Instantiates a client
const pubsub = new PubSub({grpc, projectId});

const rooms = {};

const actions = {
  admin: {
    organisation: {
      create: {
        topic: 'ex-manage',
        acl: ['edit_organisation'],
        validation: {
          name: ['string', 'required', 2, 250],
          website: ['string', 'optional', 4, 250],
          primary_contact: ['object', 'required'],
          parent: ['uuid', 'optional'],
          landing_page: ['uuid', 'optional']
        }
      },
      update: {
        topic: 'ex-manage',
        acl: ['edit_organisation'],
        validation: {
          id: ['uuid', 'required'],
          name: ['string', 'optional', 2, 250],
          website: ['string', 'optional', 4, 250],
          primary_contact: ['object', 'optional'],
          parent: ['uuid', 'optional'],
          landing_page: ['uuid', 'optional']
        }
      }
    },
    event: {
      create: {
        topic: 'ex-manage',
        acl: ['edit_event'],
        validation: {
          name: ['string', 'required', 2, 250],
          website: ['string', 'optional', 4, 250],
          start_date: ['datetime', 'required'],
          end_date: ['datetime', 'required'],
          organisation: ['uuid', 'required'],
          parent: ['uuid', 'optional'],
          landing_page: ['uuid', 'optional']
        }
      },
      update: {
        topic: 'ex-manage',
        acl: ['edit_event'],
        validation: {
          id: ['uuid', 'required'],
          name: ['string', 'optional', 2, 250],
          website: ['string', 'optional', 4, 250],
          start_date: ['datetime', 'optional'],
          end_date: ['datetime', 'optional'],
          organisation: ['uuid', 'optional'],
          parent: ['uuid', 'optional'],
          landing_page: ['uuid', 'optional']
        }
      }
    }
  }
};

function push(
  topicName = 'ex-manage',
  data = {}
) {

  async function publishMessage() {
    const dataBuffer = Buffer.from(JSON.stringify(data));

    const messageId = await pubsub.topic(topicName).publish(dataBuffer);
    return messageId;
  }

  return publishMessage();
}
function pull(
  subscriptionName = 'ex-gateway-subscription',
  timeout = 60
) {
  const subscription = pubsub.subscription(subscriptionName);
  let messageCount = 0;
  const messageHandler = message => {
    console.log(`Received message ${message.id}:`);
    messageCount += 1;
    const body = message.data ? JSON.parse(Buffer.from(message.data, 'base64').toString()) : null;
    if (rooms[body.user.token]) {
      console.log('pushing to socket', body.socketId, Object.keys(rooms));
      const socket = rooms[body.user.token].socket;
      socket.emit(`${body.domain}_${body.action}_${body.command}`, body);
    } else {
      // socket not found
      console.log('socket not found', body);
    }
    // "Ack" (acknowledge receipt of) the message
    message.ack();
  };
  subscription.on('message', messageHandler);
  // regurgitate the handler occasionally \\
  setTimeout(() => {
    subscription.removeListener('message', messageHandler);
    console.log(`${messageCount} message(s) received. Refreshing.`);
    pull(subscriptionName, timeout);
  }, timeout * 1000);
}

pull();

// middleware
io.use((socket, next) => {
  let token = socket.handshake.query['x-auth'];
  rooms[token] = { token, socket };
  next();
});

io.on('connection', (socket) => {
  // AUTHORIZE
  socket.on('authorize', async ({ method, token }) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    if (method === 'oauth2') {
      // need to do actual logic to verify the user here
      try {
        const resp = await axios.get(`${exauthURL}/auth/user`, config);
        if (resp.status !== 200) {
          throw new Error('not logged in');
        }
        const exauthUser = resp.data;
        socket.emit('authorized', exauthUser);
        rooms[token] = { ...exauthUser, token, socket };
        socket.join(socket.id);
      } catch (error) {
        console.log(error);
        socket.emit('unauthorized', { error: error.message });
      }
    }
  });

  // mapping table and topics outlined above, this is where we prep the listeners for the user
  Object.keys(actions).forEach(domain => {
    // domain = admin
    Object.keys(actions[domain]).forEach(action => {
      // action = organisation
      Object.keys(actions[domain][action]).forEach(command => {
        // command = create
        const commandProps = actions[domain][action][command];
        socket.on(`${domain}_${action}_${command}`, async (payload) => {
          const { topic, validation, acl } = commandProps;
          try {
            const user = Object.assign({}, rooms[socket.request._query['x-auth']], { socket: undefined });
            delete user[socket];
            const messageId = await push(topic, { domain, action, command, payload, user, socketId: socket.id });
            console.log(`${domain}_${action}_${command}`, { status: 202, topic, messageId });
            socket.emit(`${domain}_${action}_${command}`, { status: 202, topic, messageId });
          } catch (error) {
            console.error(error);
            socket.emit(`${domain}_${action}_${command}`, { status: 400, error: error.message });
          }
        });
      });
    });
  });
});
module.exports = io;
