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
  "id": "uuid|required"
}
```

#### Receive

`consumer_event_get`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "found"
  },
  "response": {
    "id": "uuid",
    "slug": "string"
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
