if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { v4: uuidv4 } = require('uuid');
// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');
const grpc = require('grpc');
const projectId = 'stoked-reality-284921';
const io = require('socket.io')(process.env.PORT || 8880, {
  serveClient: false
});
const redis = require('socket.io-redis');
const axios = require('axios');
const exauthURL = process.env.EXAUTH;
io.adapter(redis({ host: process.env.EXGATEWAYCACHEIP, port: process.env.EXGATEWAYCACHEPORT }));

// Instantiates a client
const pubsub = new PubSub({grpc, projectId});

const rooms = {};

const itemTypes = ['rtmp', 'zoom', 'webrtc', 'video', 'forum', 'chat', 'html'];

const itemTypeConfig = {
  rtmp: {
    topic: 'ex-streamer'
  },
  webrtc: {
    topic: 'ex-collab'
  },
  chat: {
    topic: 'ex-discussion',
    options: {
      moderation: ['enum', 'required', ['trust', 'post-moderate', 'pre-approve']],
      moderators: ['array', 'optional'],
      threads: ['boolean', 'optional'],
      private: ['boolean', 'optional'],
      participants: ['array', 'optional'],
      data: ['object', 'optional'],
    },
  },
  forum: {
    topic: 'ex-discussion',
    options: {
      moderation: ['enum', 'required', ['trust', 'post-moderate', 'pre-approve']],
      moderators: ['array', 'optional'],
      threads: ['boolean', 'optional'],
      private: ['boolean', 'optional']
    }
  }
};

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
      },
      read: {
        topic: 'ex-manage'
      },
      delete: {
        topic: 'ex-manage'
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
      },
      read: {
        topic: 'ex-manage'
      },
      delete: {
        topic: 'ex-manage'
      }
    },
    itinerary: {
      create: {
        topic: 'ex-manage',
        acl: ['edit_itinerary'],
        validation: {
          id: ['uuid', 'required'],
          name: ['string', 'optional', 2, 250],
          website: ['string', 'optional', 4, 250],
          start_date: ['datetime', 'optional'],
          end_date: ['datetime', 'optional'],
          event: ['uuid', 'optional'],
          landing_page: ['uuid', 'optional']
        }
      },
      update: {
        topic: 'ex-manage',
        acl: ['edit_itinerary'],
        validation: {
          id: ['uuid', 'required'],
          name: ['string', 'optional', 2, 250],
          website: ['string', 'optional', 4, 250],
          start_date: ['datetime', 'optional'],
          end_date: ['datetime', 'optional'],
          event: ['uuid', 'optional'],
          landing_page: ['uuid', 'optional']
        }
      },
      read: {
        topic: 'ex-manage',
        acl: ['view_itinerary']
      },
      delete: {
        topic: 'ex-manage',
        acl: ['delete_itinerary']
      }
    },
    item: {
      create: {
        acl: ['edit_item'],
        validation: {
          title: ['string', 'optional', 2, 250],
          start_date: ['datetime', 'optional'],
          end_date: ['datetime', 'optional'],
          itinerary: ['uuid', 'required'],
          landing_page: ['uuid', 'optional'],
          type: ['enum', 'required', itemTypes],
          configuration: ['object', 'optional']
        }
      },
      update: {
        acl: ['edit_event'],
        validation: {
          id: ['uuid', 'required'],
          title: ['string', 'optional', 2, 250],
          start_date: ['datetime', 'optional'],
          end_date: ['datetime', 'optional'],
          itinerary: ['uuid', 'required'],
          landing_page: ['uuid', 'optional'],
          type: ['enum', 'required', itemTypes],
          configuration: ['object', 'optional']
        }
      },
      read: {},
      delete: {}
    }
  },
  consumer: {
    event: {
      get: {
        topic: 'ex-manage'
      }
    },
    itinerary: {
      get: {
        topic: 'ex-manage'
      }
    },
    chat: {
      get: {
        callback(socket, { id, data }) {
          if (data && data.instance) {
            socket.join(data.instance);
          } else {
            socket.join(id);
          }
        }
      },
      start: {
        prepare (user, payload) {
          if (!payload.data) {
            payload.data = {};
          }
          payload.data.sent = new Date();
          payload.data.from = user;
          payload.data.instance = uuidv4();
          return payload;
        },
        callback(socket, { id, data }) {
          socket.join(data.instance);
        },
        response (payload) {
          console.log('start response', payload);
          if (payload.instance) {
            // each user in the list of operators needs to be notified of this
            payload.operators.forEach((operator) => {
              io.to(operator).emit('client_chat_incoming', { ...payload });
            });
          }
        },
      },
      send: {
        prepare (user, payload) {
          payload.data.sent = new Date();
          payload.data.from = user;
          payload.data.uuid = uuidv4();
          console.log('preparing send', payload);
          return payload;
        },
        callback (socket, { id, data }) {
          console.log('consumer_chat_receive', data);
          if (data.instance) {
            io.to(data.instance).emit('consumer_chat_receive', { id, ...data });
          } else {
            io.to(id).emit('consumer_chat_receive', { id, ...data });
          }
        },
      },
      remove: {
        callback (socket, { id, data }) {
          io.to(id).emit('consumer_chat_remove', { id, ...data });
        },
      },
    },
    rtmp: {
      get: {}
    }
  },
  client: {
    rtmp: {
      get: {},
      activate: {}
    },
    chat: {
      ban: {
        callback (socket, { id, data }) {
          io.to(id).emit('consumer_chat_remove', { id, ...data });
        },
      },
      get: {},
      activate: {
        callback (socket, { id, data }) {
          if (data.instance) {
            socket.join(data.instance);
          }
        }
      },
    },
  },
};

function push(
  topicName = 'ex-manage',
  data = {}
) {
  data.source = process.env.SOURCE || 'app-engine';
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
    if (!body.user) {
      console.log(body);
      message.ack();
      return true;
    }
    if (body.source !== process.env.SOURCE) {
      // we've picked up a message that was intended for another environment so return it
      message.nack();
      return true;
    }
    // run the response if found for this action
    if (actions[body.domain][body.action][body.command].response) {
      actions[body.domain][body.action][body.command].response(body);
    }
    io.in(body.user.id).emit(`${body.domain}_${body.action}_${body.command}`, body);
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

const verifyUser = async (token) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  const resp = await axios.get(`${exauthURL}/auth/user`, config);
  if (resp.status !== 200) {
    throw new Error('not logged in');
  }
  const exauthUser = resp.data;
  return exauthUser;
};

// middleware
io.use((socket, next) => {
  let token = socket.handshake.query['x-auth'];
  rooms[token] = { token, socket };
  next();
});

io.on('reconnect', async (socket) => {
  console.log('reconnect');
  try {
    const exauthUser = await verifyUser(token);
    socket.emit('authorized', exauthUser);
    socket.join(exauthUser.id);
  } catch (error) {
    console.log(error);
    socket.emit('unauthorized', { error: error.message });
  }
});

io.on('connection', async (socket) => {
  // AUTHORIZE
  socket.on('authorize', async ({ method, token }) => {

    if (method === 'oauth2') {
      // need to do actual logic to verify the user here
      try {
        const exauthUser = await verifyUser(token);
        socket.emit('authorized', exauthUser);
        socket.join(exauthUser.id);
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
          let topic = commandProps.topic;
          const validation = commandProps.validation;
          const acl = commandProps.acl;
          try {
            if (action === 'item') {
              if (!payload.type) {
                // type is needed to know where to look for the data
                throw new Error('type is required');
              }
              if (!itemTypeConfig[payload.type].topic) {
                throw new Error('invalid type');
              }
              topic = itemTypeConfig[payload.type].topic;
            }
            if (!topic && itemTypeConfig[action]) {
              topic = itemTypeConfig[action].topic;
            }
            const token = socket.request._query['x-auth'];
            const user = await verifyUser(token);
            user.token = token;
            if (!Object.keys(socket.rooms).includes(user.id)) {
              socket.join(user.id);
            }
            if (commandProps.prepare) {
              payload = commandProps.prepare(user, payload);
            }
            if (commandProps.callback) {
              commandProps.callback(socket, payload);
            }
            const messageId = await push(topic, { domain, action, command, payload, user, socketId: socket.id });
            console.log(messageId);
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
