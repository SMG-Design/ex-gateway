# [Extream Gateway](index.html)

Websocket based Gateway for all activities. This includes Admin CRUD, Client Management Portal and Consumer Applications.

This gateway is intended to be consumed by our JavaScript Browser SDK, Wordpress Plugin and Node.JS SDK.

## Extream handles groupings with the following separation

1. Organisation - an organisation can host multiple events
1. Event - an event can run multiple itineraries (over multiple days)
1. User Group - a user group belongs to an organisation
1. User Permissions - permissions are applied to a user group
1. User - a user belongs to many groups, across multiple organisations
1. Itinerary - an itinerary has a start and end date/time and is the home of multiple itinerary items
1. Itinerary Item - an itinerary item has a start and end date/time and belongs to an itinerary

## Itinerary Item Types

We support the following types of itinerary items
1. RTMP Live stream (streamed into our RTMP servers and URL delivered via the Gateway to the RTMP server)
1. Zoom video call (with participant criteria)
1. WebRTC video call (with participant criteria)
1. Video playback (video upload and URL delivered via the Gateway to the Content server)
1. Forum (moderators and participants)
1. Chat room (moderators and participants)
1. HTML (direct upload of third-party content such as Cisco Webex)

## Gateway Communication

### Security

The socket connection is authenticated using an oauth2 authorization code. This can be obtained from https://api.extream.app/auth/oauth2/authorize

Set the `userToken` based on the users localStorage or the oauth2 authorization code if null. Get the users status and display a login form if required.

In the meta of a response to any command, you will have information whether the command requires login. If no login is required, the oauth2 authorization code will be enough.

An example authenticated process assuming using socket.io:
```javascript
const userToken = localStorage.getItem('ex-authentication') || `YOUR_ACCESS_TOKEN`;
const socket = io('https://gateway.extream.app', {
  transports: ['websocket']
});
// Socket connected
socket.on('connect', onConnect);
// Socket got disconnected
socket.on('disconnect', onDisconnect);
// Socket is authenticated
socket.on('authenticated', onAuthenticated);
function onConnect() {
  console.log('Successfully connected to the ex-gateway');
  socket.emit('authenticate', { method: 'oauth2', token: userToken });
}
function onDisconnect() {
  console.log('Disconnected from ex-gateway');
  // Reconnect
}
function onAuthenticated(data) {
  const {
    organisationId,
    authStatus
  } = data;
  console.log(`Successfully connected to organisation ${organisationId} and current users status is: ${authStatus}`);
  if (authStatus === 'unauthorized') {
    // Show user login process and request username and password. Trigger the 'login' event on form submission. We support Multi-Factor Auth.
  }
}
function doLogin({ username, password }) {
  socket.on('mfa', onMFA);
  socket.on('authorized', onAuthorized);
  socket.on('unauthorized', onUnauthorized);
  socket.emit('login', { username, password });
}
function doMFA(code) {
  // emitting mfa will return either authorized or unauthorized, as setup during doLogin.
  socket.emit('mfa', { code };
}
function onMFA(data) {
  const {
    mfaSubject,
    mfaBody,
    mfaTooltip
  } = data;
  // Show HTML form containing mfaSubject, mfaBody and mfaTooltip
}
function onUnauthorized(error) {
  console.log(`An error occurred during login: ${error}`);
}
function onAuthorized(data) {
  const {
    userId,
    groups
  } = data;
  console.log(`User logged in with User ID: ${userId}`);
}
```

## Commands

* [Admin](admin.html)
* [Security](security.html)
* [Client](client.html)
* [Consumer](consumer.html)