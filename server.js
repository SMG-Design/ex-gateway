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

const itemTypes = ['rtmp', 'zoom', 'webrtc', 'video', 'forum', 'chat', 'html', 'poll', 'presentation'];

const itemTypeConfig = {
  rtmp: {
    topic: 'ex-streamer'
  },
  vod: {
    topic: 'ex-streamer',
  },
  otf: {
    topic: 'ex-streamer',
  },
  webrtc: {
    topic: 'ex-collab'
  },
  zoom: {
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
  },
  poll: {
    topic: 'ex-poll',
    options: {
      mode: ['enum', 'required', ['timed', 'poll', 'survey', 'quiz']],
      show_responses: ['boolean', 'optional'],
      questions: ['array', 'required'],
    },
  },
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
        response (user, payload) {
          if (payload.data.instance) {
            if (payload.data.operators) {
              // each user in the list of operators needs to be notified of this
              payload.data.operators.forEach((operator) => {
                io.to(operator).emit('client_chat_incoming', { ...payload });
              });
            } else if (payload.data.participants) {
              // each user in the list of participants needs to be notified of the new room
              payload.data.participants.forEach((participant) => {
                io.to(participant).emit('consumer_chat_incoming', { ...payload });
              });
            }
          }
        },
      },
      activate: {
        callback (socket, { id, data }) {
          if (data && data.instance) {
            socket.join(data.instance);
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
    webrtc: {
      read: {},
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
          payload.data.instance = uuidv4();
          return payload;
        },
        callback(socket, { id, data }) {
          socket.join(data.instance);
        },
        response (user, payload) {
          if (payload.data.instance) {
            if (payload.data.mode === 'round-robin') {
              // each user in the list of operators needs notifying
              payload.data.operators.forEach((operator) => {
                io.to(operator).emit('client_webrtc_incoming', { ...payload, user });
              });
            } else if (payload.data.mode === 'instant') {
              if (payload.data.participants) {
                payload.data.participants.forEach((contact) => {
                  io.to(contact).emit('consumer_webrtc_incoming', { ...payload, user });
                });
              }
            }
          }
        },
      },
      callback: {
        response (user, payload) {
          if (payload.data.mode && payload.data.mode === 'round-robin') {
            // each user in the list of operators needs to be notified of this changed status
            payload.data.operators.forEach((operator) => {
              io.to(operator).emit('client_webrtc_callback', { ...payload, user });
            });
          }
        },
      },
      accept: {
        callback (socket, { id, data }) {
          if (data.instance) {
            socket.join(data.instance);
          }
        },
        response (user, payload) {
          if (payload.data.instance && payload.data.instance.status !== 'capacity_reached') {
            if (payload.data.mode && payload.data.mode === 'round-robin') {
              // each user in the list of operators needs to be notified of this
              payload.data.operators.forEach((operator) => {
                io.to(operator).emit('client_webrtc_joined', { ...payload, user });
              });
            }
          }
        },
      },
      leave: {},
      end: {
        response (user, payload) {
          if (payload.data.instance) {
            if (payload.data.mode && payload.data.mode === 'group') {
              // group mode sends message to all those who were listening for the host to complete the session
              io.in(payload.id).emit('consumer_webrtc_completed', payload);
            }
          }
        },
      },
    },
    zoom: {
      sign: {},
    },
    rtmp: {
      get: {},
    },
    otf: {
      activate: {},
    },
    poll: {
      get: {
        callback (socket, { id }) {
          socket.join(`${id}`);
        },
      },
      answer: {
        callback (_socket, { id, data }, user) {
          io.to(`${id}_response`).emit('client_poll_answer', { id, data, user });
        },
        response (user, payload) {
          io.to(`${payload.id}`).emit(`consumer_poll_answer`, { payload });
        },
      }
    },
    online: {
      users: {
        topic: false,
        compute(socket, user, { type }) {
          return new Promise((resolve, reject) => {
            // const sockets = (io.sockets.adapter.rooms[`${user.eventId}_${type}`]) ? io.sockets.adapter.rooms[`${user.eventId}_${type}`].sockets : {};
            if (!socket.user) {
              socket.user = JSON.stringify(user);
            }
            console.log(type);
            const room = (type) ? `${user.eventId}_${type}` : `${user.eventId}`;
            console.log('room', room);
            io.of('/').adapter.clients([room], (err, sockets) => {
              const userArr = {};
              if (err) {
                console.log('error getting client ids', err);
              }
              io.of('/').adapter.customRequest(sockets, (err, responses) =>{
                if (err) {
                  console.log('error on custom request', err);
                } else if (responses) {
                  console.log('responses', responses);
                  // responses contains array of objects
                  responses.forEach((users) => {
                    const usersObj = JSON.parse(users);
                    for (let id in usersObj) {
                      if (!userArr[usersObj[id].id] && usersObj[id].visible) {
                        userArr[usersObj[id].id] = (({ email, ...user }) => user)(usersObj[id]);
                      }
                    }
                  });
                }
                resolve({
                  type,
                  users: userArr,
                });
              });
            });
          });
          // let sockets;
          // if (!type) {
          //   sockets = (io.sockets.adapter.rooms[`${user.eventId}`]) ? io.sockets.adapter.rooms[`${user.eventId}`].sockets : {};
          // } else {
          //   sockets = (io.sockets.adapter.rooms[`${user.eventId}_${type}`]) ? io.sockets.adapter.rooms[`${user.eventId}_${type}`].sockets : {};
          // }
          // const userArr = {};
          // if (!socket.user) {
          //   socket.user = JSON.stringify(user);
          // }
          // for (let socketId in sockets) {
          //   if (sockets[socketId] === true && io.sockets.connected[socketId] && io.sockets.connected[socketId].user) {
          //     const userObj = JSON.parse(io.sockets.connected[socketId].user);
          //     if (!userArr[userObj.id] && userObj.visible) {
          //       userArr[userObj.id] = (({ email, ...user }) => user)(userObj);
          //     }
          //   }
          // }
          // return userArr;
        },
      },
      visibility: {
        topic: false,
        compute(socket, user, { visibility }) {
          console.log('visibility', visibility);
          if (socket.user) {
            user = JSON.parse(socket.user);
          }
          user.visible = visibility;
          socket.user = JSON.stringify(user);
          if (user.visible) {
            socket.to(`${user.eventId}`).emit(`consumer_online_join`, {
              type: user.user_type,
              id: user.id,
              user: (({ email, ...user }) => user)(user),
            });
          } else {
            socket.to(`${user.eventId}`).emit(`consumer_online_leave`, {
              type: user.user_type,
              id: user.id,
            });
          }
        },
      },
    },
  },
  client: {
    rtmp: {
      get: {},
      activate: {},
      otf: {},
    },
    vod: {
      encode: {},
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
        },
        response (user, payload) {
          if (payload.data.instance) {
            // each user in the list of operators needs to be notified of this
            if (payload.data && payload.data.operators) {
              payload.data.operators.forEach((operator) => {
                io.to(operator).emit('client_chat_activated', { ...payload, user });
              });
            }
          }
        },
      },
    },
    webrtc: {
      get: {},
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
        response (user, payload) {
          if (payload.data.instance) {
            if (payload.data.mode && payload.data.mode === 'group') {
              // group mode sends message to all those who were listening for the host to start the session
              io.in(payload.id).emit('consumer_webrtc_activated', { ...payload });
            } else {
              // each user in the list of contacts needs notifying
              payload.data.participants.forEach((contact) => {
                console.log(contact);
                io.to(contact).emit('consumer_webrtc_incoming', { ...payload });
              });
            }
          }
        },
      },
      assign: {},
      activate: {
        callback (socket, { id, data }) {
          if (data.instance) {
            socket.join(data.instance);
          }
        },
        response (user, payload) {
          if (payload.data.instance && payload.data.instance.status !== 'capacity_reached') {
            // each user in the list of operators needs to be notified of this
            payload.data.operators.forEach((operator) => {
              io.to(operator).emit('client_webrtc_activated', { ...payload, user });
            });
          }
        },
      },
      end: {
        response (user, payload) {
          if (payload.data.instance) {
            if (payload.data.mode && payload.data.mode === 'group') {
              // group mode sends message to all those who were listening for the host to complete the session
              io.in(payload.id).emit('consumer_webrtc_completed', payload);
            }
          }
        },
      },
    },
    poll: {
      // listener: {
      //   callback (socket, { id }) {
      //     socket.join(`${id}_response`);
      //   },
      // },
      get: {
        callback (socket, { id }) {
          socket.join(`${id}`);
          socket.join(`${id}_response`);
        },
      },
      add: {
        response (user, payload) {
          console.log('payload for response', payload);
          if (payload.data && payload.data.poll && payload.data.poll.configuration.mode === 'live') {
            io.in(payload.id).emit('consumer_poll_question', {
              id: payload.id,
              data: {
                poll: payload.data.poll,
                id: payload.data.id,
                question: payload.data.question,
                order: payload.data.order,
                answers: payload.data.answers,
              },
            });
          } else {
            io.in(user.id).emit('consumer_poll_question', {
              id: payload.id,
              error: 'no_mode',
            });
          }
        },
      },
    },
    user: {
      topic: false,
      get: {
        compute(socket, user, { id }) {
          return getUser(user.token, id);
        },
      }
    },
  },
};

function push(
  topicName = 'ex-manage',
  data = {},
  eventId = null,
  source = process.env.SOURCE || 'app-engine'
) {
  data.source = source;
  data.eventId = eventId;
  async function publishMessage() {
    const dataBuffer = Buffer.from(JSON.stringify(data));

    return await pubsub.topic(topicName).publish(dataBuffer);
  }

  return publishMessage();
}

async function logEvent(eventData, authData, socketId) {
  let eventId = '';
  const prepAuth = authData;
  if (prepAuth.user && prepAuth.user.eventId) {
    eventId = prepAuth.user.eventId;
    prepAuth.user = (({ eventId, ...user }) => user)(prepAuth.user);
  }
  const data = {
    event: eventData,
    auth: prepAuth,
    socketId: socketId,
    timestamp: Date.now()
  };
  await push('ex-monitoring', data, eventId, 'ex-gateway');
}

function pull(
  subscriptionName = `ex-gateway-subscription-${process.env.SOURCE}`,
  timeout = 60
) {
  const subscription = pubsub.subscription(subscriptionName);
  let messageCount = 0;
  const messageHandler = message => {
    messageCount += 1;
    const body = message.data ? JSON.parse(Buffer.from(message.data, 'base64').toString()) : null;
    console.log(`Received message: ${message.id}`);
    console.log(`body:`, body);
    if (!body.user) {
      // theres no user, we reject it but pull from the queue as nobody should have it
      console.log('no user', `${body.domain}_${body.action}_${body.command}`);
      message.ack();
      return true;
    }
    // run the response if found for this action
    if (actions[body.domain][body.action][body.command].response) {
      actions[body.domain][body.action][body.command].response(body.user, body.payload);
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
  return resp.data;
};

const getUser = async (token, id) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  const resp = await axios.get(`${exauthURL}/auth/user/${id}`, config);
  if (resp.status !== 200) {
    throw new Error('not logged in');
  }
  return resp.data;
};

io.of('/').adapter.customHook = (sockets, cb) => {
  const userArr = {};
  for (let i = 0; i < sockets.length; i++) {
    const socketId = sockets[i];
    console.log('does the socket exist?', !!io.of('/').connected[socketId]);
    if (io.of('/').connected[socketId] && io.of('/').connected[socketId].user) {
      const userObj = JSON.parse(io.of('/').connected[socketId].user);
      console.log('user object', userObj);
      if (!userArr[userObj.id] && userObj.visible) {
        userArr[userObj.id] = (({ email, ...user }) => user)(userObj);
      }
    } else {
      console.log('call request');
    }
  }
  cb(JSON.stringify(userArr));
};

io.on('reconnect', async (socket) => {
  try {
    const token = socket.request._query['x-auth'];
    const exauthUser = await verifyUser(token);
    socket.emit('authorized', exauthUser);
    socket.join(exauthUser.id);
    socket.join(`${exauthUser.eventId}_${exauthUser.user_type}`);
    socket.join(exauthUser.eventId);
    console.log(exauthUser.user_type);
    exauthUser.visible = true;
    socket.user = JSON.stringify(exauthUser);
    socket.to(`${exauthUser.eventId}`).emit(`consumer_online_join`, {
      type: exauthUser.user_type,
      id: exauthUser.id,
      user: (({ email, ...user }) => user)(exauthUser),
    });
  } catch (error) {
    console.log(error);
    socket.emit('unauthorized', { error: error.message });
  }
});

io.on('connection', async (socket) => {
  // AUTHORIZE
  socket.on('authorize', async ({ method, token }) => {
    if (method === 'oauth2') {
      const command = 'authorize';
      // need to do actual logic to verify the user here
      try {
        const user = await verifyUser(token);
        await logEvent({command, success: true}, {token, user}, socket.id);
        // console.log(user);
        socket.emit('authorized', user);
        socket.join(user.id);
        console.log('joining online room', `${user.eventId}_${user.user_type}`);
        socket.join(`${user.eventId}_${user.user_type}`);
        socket.join(user.eventId);
        // default visibility for the logging in user
        user.visible = true;        
        socket.user = JSON.stringify(user);
        socket.to(`${user.eventId}`).emit(`consumer_online_join`, {
          type: user.user_type,
          id: user.id,
          user: (({ email, ...user }) => user)(user),
        });
      } catch (error) {
        console.log(error);
        await logEvent({command, success: false}, {token}, socket.id);
        socket.emit('unauthorized', { error: error.message });
      }
    }
  });

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    } else {
      if (socket.user) {
        const user = JSON.parse(socket.user);
        socket.to(`${user.eventId}`).emit(`consumer_online_leave`, {
          type: user.user_type,
          id: user.id,
        });
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
          const token = socket.request._query['x-auth'];
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
            const exAuthUser = await verifyUser(token);
            const user = {...exAuthUser, token};
            if (!Object.keys(socket.rooms).includes(user.id)) {
              socket.join(user.id);
            }
            if (!Object.keys(socket.rooms).includes(user.user_type)) {
              socket.join(user.user_type);
            }
            if (commandProps.prepare) {
              payload = commandProps.prepare(user, payload);
            }
            if (commandProps.callback) {
              commandProps.callback(socket, payload, user);
            }
            if (topic !== false) {
              const messageId = await push(topic, { domain, action, command, payload, user, socketId: socket.id }, user.eventId);
              console.log(messageId);
              console.log(`${domain}_${action}_${command}`, { status: 202, topic, messageId });
              socket.emit(`${domain}_${action}_${command}`, { status: 202, topic, messageId });
            } else {
              socket.emit(`${domain}_${action}_${command}`, { status: 200, payload: await commandProps.compute(socket, user, payload) });
            }
            await logEvent({domain, action, command, payload, topic, success: true}, {token, user: exAuthUser}, socket.id);
          } catch (error) {
            console.error(error);
            await push('ex-monitoring', {event: {domain, action, command, topic, success: false}, auth: {token}, socketId: socket.id, timestamp: Date.now()}, null, 'ex-gateway');
            socket.emit(`${domain}_${action}_${command}`, { status: 400, error: error.message });
          }
        });
      });
    });
  });
});
module.exports = io;
