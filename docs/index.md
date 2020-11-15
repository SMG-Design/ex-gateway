# [Extream Gateway](index.html)

Websocket based Gateway for all activities. This includes Admin CRUD, Client Management Portal and Consumer Applications.

This gateway is intended to be consumed by our JavaScript Browser SDK, Wordpress Plugin and Node.JS SDK. But will work with standard socket libraries.

## Extream handles groupings with the following separation

1. Organisation - an organisation can host multiple events
1. Event - an event can run multiple itineraries (over multiple days)
1. User Group - a user group belongs to an organisation
1. User Permissions - permissions are applied to a user group
1. User - a user belongs to many groups, across multiple organisations
1. Itinerary - an itinerary has a start and end date/time, has a parent/child hierarchy and is the home of multiple itinerary items
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

To authenticate a user, first a login request must be made to https://auth.extream.app/auth/login. This will return an access token.

All non-authenticated requests must contain a basic authorization header using the value of the client token.

Users are tied to an event ID. To authenticate a user, the event ID must be provided in the payload. You can retrieve event IDs from the admin area.

To authenticate a user, `POST` the following  urlencoded payload to `https://auth.extream.app/auth/login.

```x-www-form-urlencoded
grant_type=password
username={username}
password={password}
eventId={eventId}
```

Response expected payload:

```JSON
{
    "accessToken": "1461072f9a5fc20ff054ab71299d8d88645c44b6",
    "accessTokenExpiresAt": "2020-11-16T00:40:43.464Z",
    "refreshToken": "3c60db2a1255553942edd7dd023fe90994fa4740",
    "refreshTokenExpiresAt": "2020-11-17T00:40:43.464Z",
    "id": "8c3b38a3-e394-42dc-9c7e-5a741f238061"
}
```

Once authenticated, a socket connection can be established. The connection is verified using the access token from authenticating.

Set the `userToken` based on the users localStorage ex-authentication value.

An example authenticated process assuming using socket.io:
```javascript
const userToken = localStorage.getItem('ex-authentication');
const socket = io(`https://gateway.extream.app?x-auth=${userToken}`, {
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
  socket.emit('authorize', { method: 'oauth2', token: userToken });
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
}
function doLogin({ username, password }) {
  socket.on('mfa', onMFA);
  socket.on('authorized', onAuthorized);
  socket.on('unauthorized', onUnauthorized);
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