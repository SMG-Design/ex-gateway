# Consumer

* [Extream Gateway](index.html)
* [Admin](admin.html)
* [Security](security.html)
* [Client](client.html)
* [Consumer](consumer.html)

The consumer section documents all commands required to use the platform as a general consumer of the service.

Depending on the configuration set for an event, it's possible for access to commands to be with or without authorization. See [Security](security.md) for more information.

## Commands

### Events

This section is used to retrieve an event and record activity for the user relating to attendance etc...

#### Send

`consumer_event_get`

#### Payload

```JSON
{
  "organisation": "uuid|optional",
  "id": "uuid|optional"
}
```

#### Receive

`consumer_event_get`

#### Successful Payload - Many

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "found"
  },
  "response": [
    {
      "id": "a3266498-2fb2-4621-90cd-004083ab5f75",
      "name": "New event",
      "website": "events.tessian.com",
      "start_date": "2020-08-21T08:00:00.000Z",
      "end_date": "2020-08-22T17:00:00.000Z",
      "organisation": "c3a7a5bf-276a-415e-bf99-53108c277561",
      "parent": "c3a7a5bf-276a-415e-bf99-53108c277561",
      "landing_page": "c3a7a5bf-276a-415e-bf99-53108c277561",
      "createdBy": "c3a7a5bf-276a-415e-bf99-53108c277561",
      "createdAt": "2020-08-21T00:20:57.074Z",
      "updatedAt": "2020-08-21T00:20:57.074Z"
    },
    ...
  ]
}
```

#### Successful Payload - Single

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "found"
  },
  "response": {
    "id": "a3266498-2fb2-4621-90cd-004083ab5f75",
    "name": "New event",
    "website": "events.tessian.com",
    "start_date": "2020-08-21T08:00:00.000Z",
    "end_date": "2020-08-22T17:00:00.000Z",
    "organisation": "c3a7a5bf-276a-415e-bf99-53108c277561",
    "parent": "c3a7a5bf-276a-415e-bf99-53108c277561",
    "landing_page": "c3a7a5bf-276a-415e-bf99-53108c277561",
    "createdBy": "c3a7a5bf-276a-415e-bf99-53108c277561",
    "createdAt": "2020-08-21T00:20:57.074Z",
    "updatedAt": "2020-08-21T00:20:57.074Z"
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 400,
  "meta": {
    "permitted": true,
    "message": "bad_request"
  },
  "response": {
    "errors": [ "string" ]
  }
}
```

### Itineraries

#### Send

`consumer_itinerary_get`

#### Payload

```JSON
{
  "event": "uuid|optional",
  "id": "uuid|optional"
}
```

#### Receive

`consumer_itinerary_get`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "found"
  },
  "response": {
    "id": "90fea305-ecf2-420b-b143-b8496180a963",
    "name": "event-name",
    "website": "www.example.com",
    "start_date": "2020-08-21T08:00:00.000Z",
    "end_date": "2020-08-21T17:00:00.000Z",
    "event": "a3266498-2fb2-4621-90cd-004083ab5f75",
    "landing_page": "a3266498-2fb2-4621-90cd-004083ab5f75",
    "createdBy": "a3266498-2fb2-4621-90cd-004083ab5f75",
    "createdAt": "2020-08-21T09:20:31.032Z",
    "updatedAt": "2020-08-21T09:20:31.032Z",
    "items": [
      {
        "messages": [],
        "addedAt": {
          "_seconds": 1598041039,
          "_nanoseconds": 699000000
        },
        "type": "chat",
        "configuration": {
          "moderation": "post-moderate",
          "moderators": [
            "091e8b52-8506-4512-b75e-149ee51c4f04"
          ],
          "private": true,
          "threads": true
        },
        "title": "Moderated Discussion",
        "addedBy": "091e8b52-8506-4512-b75e-149ee51c4f04",
        "end_date": "2020-08-21 09:00:00",
        "start_date": "2020-08-21 08:00:00",
        "itinerary": "90fea305-ecf2-420b-b143-b8496180a963"
      }
    ]
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 400,
  "meta": {
    "permitted": true,
    "message": "bad_request"
  },
  "response": {
    "errors": [ "string" ]
  }
}
```

#### Send

`consumer_{item_type}_get`

#### Payload

```JSON
{
  "id": "uuid|required"
}
```

#### Receive

`consumer_{item_type}_get`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "joined"
  },
  "response": {
    "id": "a3266498-2fb2-4621-90cd-004083ab5f75",
    "name": "New event",
    "start_date": "2020-08-21T08:00:00.000Z",
    "end_date": "2020-08-22T17:00:00.000Z",
    "attendees": 1002
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 400,
  "meta": {
    "permitted": true,
    "message": "bad_request"
  },
  "response": {
    "errors": [ "string" ]
  }
}
```

#### Send

`consumer_{item_type}_send`

#### Payload

```JSON
{
  "id": "uuid|required",
  "data": {
    
  }
}
```

#### Receive

`consumer_{item_type}_send`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "joined"
  },
  "response": {
    "id": "a3266498-2fb2-4621-90cd-004083ab5f75",
    "name": "New event",
    "start_date": "2020-08-21T08:00:00.000Z",
    "end_date": "2020-08-22T17:00:00.000Z",
    "attendees": 1002
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 400,
  "meta": {
    "permitted": true,
    "message": "bad_request"
  },
  "response": {
    "errors": [ "string" ]
  }
}
```
