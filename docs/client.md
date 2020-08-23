# Client

* [Extream Gateway](index.html)
* [Admin](admin.html)
* [Security](security.html)
* [Client](client.html)
* [Consumer](consumer.html)

The client section documents all commands available for client based activity. This includes the electron desktop app used for NDI video switching.

Depending on the configuration set for an event, it's possible for access to commands to be with or without authorization. See [Security](security.md) for more information.

## Commands

### streaming

This section is used to manage an actor beginning a stream

#### Send

`client_rtmp_get`

#### Payload

```JSON
{
  "id": "uuid|itinerary"
}
```

#### Receiv

`client_rtmp_get`

#### Successful Payload - current user is designated actor

```JSON
{
  "addedAt": {
    "_seconds": 1598141520,
    "_nanoseconds": 469000000
  },
  "configuration": {
    "mode": "live"
  },
  "end_date": {
    "_seconds": 1598166000,
    "_nanoseconds": 0
  },
  "type": "rtmp",
  "addedBy": "091e8b52-8506-4512-b75e-149ee51c4f04",
  "itinerary": "90fea305-ecf2-420b-b143-b8496180a963",
  "title": "Live stream item 1",
  "start_date": {
    "_seconds": 1598144400,
    "_nanoseconds": 0
  },
  "authkey": "undefined|9771f0bc65568ab32c3cad1e15bd98ad914b2216",
  "url": "expired"
}
```

#### Send - Called automatically by the RTMP streaming service

`client_rtmp_activate`

#### Payload

```JSON
{
  "id": "uuid|itinerary"
}
```

#### Receive

`client_rtmp_activate`

#### Live Payload - 30 minutes before start date

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "live"
  },
  "response": {
    "id": "a3266498-2fb2-4621-90cd-004083ab5f75",
    "url": "hls_url",
    "status": "live"
  }
}
```

#### Rehearsal Payload - available until 30 minutes before start date

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "rehearsing"
  },
  "response": {
    "id": "a3266498-2fb2-4621-90cd-004083ab5f75",
    "url": "internal_hls_url",
    "status": "rehearsing"
  }
}
```

#### Recording Payload - to use to create a recorded item for playout

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "recording"
  },
  "response": {
    "id": "a3266498-2fb2-4621-90cd-004083ab5f75",
    "url": "internal_hls_url",
    "status": "recording"
  }
}
```