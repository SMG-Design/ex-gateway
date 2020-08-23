# Admin

* [Extream Gateway](index.html)
* [Admin](admin.html)
* [Security](security.html)
* [Client](client.html)
* [Consumer](consumer.html)

The admin section documents all commands available for CRUD tasks.

Authorization is required and permissions granted for the logged in user to carry out each action.

## Commands

### Organisations

This section is used for CRUD tasks relating to an organisation

#### Send

`admin_organisation_create` - Create a new organisation.

#### Payload

```JSON
{
  "name": "string|required|2-250",
  "website": "string|optional|4-250",
  "primary_contact": {
    "id": "uuid|optional",
    "first_name": "string|optional|2-20",
    "last_name": "string|optional|2-20",
    "email": "string|optional|4-120"
  },
  "parent": "uuid|optional",
  "landing_page": "uuid|optional"
}
```

#### Receive

`admin_organisation_create`

#### Successful Payload

```JSON
{
  "status": 201,
  "meta": {
    "permitted": true,
    "message": "created"
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

#### Send

`admin_organisation_read` - Retrieve 1 or many organisations.

#### Payload

```JSON
{
  "id": "uuid|optional",
  "parent": "uuid|optional"
}
```

#### Receive

`admin_organisation_read`

#### Successful Payload - Many

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "items": 2,
    "page": 1
  },
  "response": [
    {
      "id": "uuid",
      "slug": "string",
      "name": "string",
      "website": "string",
      "primary_contact": {
        "id": "uuid",
        "first_name": "string",
        "last_name": "string",
        "email": "string"
      },
      "parent": "uuid",
      "landing_page": "uuid"
    },
    ...
  ]
}
```

#### Successful Payload - Single

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "items": 1,
    "page": 1
  },
  "response": {
    "id": "uuid",
    "slug": "string",
    "name": "string",
    "website": "string",
    "primary_contact": {
      "id": "uuid",
      "first_name": "string",
      "last_name": "string",
      "email": "string"
    },
    "parent": "uuid",
    "landing_page": "uuid"
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 404,
  "meta": {
    "permitted": true,
    "message": "not_found"
  }
}
```

#### Send

`admin_organisation_update` - Update an existing organisation.

#### Payload

```JSON
{
  "id": "uuid|required",
  "name": "string|optional|2-250",
  "website": "string|optional|5-250",
  "primary_contact": {
    "id": "uuid|optional",
    "first_name": "string|optional|2-20",
    "last_name": "string|optional|2-20",
    "email": "string|optional|4-120"
  },
  "parent": "uuid|optional",
  "landing_page": "uuid|optional"
}
```

#### Receive

`admin_organisation_update`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "updated"
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

#### Send

`admin_organisation_delete` - Delete an organisation.

#### Payload

```JSON
{
  "id": "uuid|required"
}
```

#### Receive

`admin_organisation_delete`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "deleted"
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 404,
  "meta": {
    "permitted": true,
    "message": "not_found"
  }
}
```

### Events

This section is used for CRUD tasks relating to an event

#### Send

`admin_event_create` - Create a new event.

#### Payload

```JSON
{
  "name": "string|required|2-250",
  "website": "string|optional|5-250",
  "start_date": "datetime|required",
  "end_date": "datetime|required",
  "organisation": "uuid|required",
  "parent": "uuid|optional",
  "landing_page": "uuid|optional"
}
```

#### Receive

`admin_event_create`

#### Successful Payload

```JSON
{
  "status": 201,
  "meta": {
    "permitted": true,
    "message": "created"
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

#### Send

`admin_event_read` - Retrieve 1 or many events.

#### Payload

```JSON
{
  "id": "uuid|optional",
  "organisation": "uuid|optional",
  "start_date": "datetime|optional",
  "end_date": "datetime|optional"
}
```

#### Receive

`admin_event_read`

#### Successful Payload - Many

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "items": 2,
    "page": 1
  },
  "response": [
    {
      "id": "uuid",
      "slug": "string",
      "name": "string",
      "website": "string",
      "start_date": "datetime",
      "end_date": "datetime",
      "organisation": "uuid",
      "parent": "uuid",
      "landing_page": "uuid"
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
    "items": 1,
    "page": 1
  },
  "response": {
    "id": "uuid",
    "slug": "string",
    "name": "string",
    "website": "string",
    "start_date": "datetime",
    "end_date": "datetime",
    "organisation": "uuid",
    "parent": "uuid",
    "landing_page": "uuid"
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 404,
  "meta": {
    "permitted": true,
    "message": "not_found"
  }
}
```

#### Send

`admin_event_update` - Update an existing event.

#### Payload

```JSON
{
  "id": "uuid|required",
  "name": "string|optional|2-250",
  "website": "string|optional|5-250",
  "start_date": "datetime|optional",
  "end_date": "datetime|optional",
  "organisation": "uuid|optional",
  "parent": "uuid|optional",
  "landing_page": "uuid|optional"
}
```

#### Receive

`admin_event_update`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "updated"
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

#### Send

`admin_event_delete` - Delete an event.

#### Payload

```JSON
{
  "id": "uuid|required"
}
```

#### Receive

`admin_event_delete`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "deleted"
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 404,
  "meta": {
    "permitted": true,
    "message": "not_found"
  }
}
```

### Itineraries

This section is used for CRUD tasks relating to an event itinerary

#### Send

`admin_itinerary_create` - Create a new itinerary.

#### Payload

```JSON
{
  "name": "string|required|2-250",
  "website": "string|optional|5-250",
  "start_date": "datetime|optional",
  "end_date": "datetime|optional",
  "event": "uuid|required",
  "landing_page": "uuid|optional"
}
```

#### Receive

`admin_itinerary_create`

#### Successful Payload

```JSON
{
  "status": 201,
  "meta": {
    "permitted": true,
    "message": "created"
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

#### Send

`admin_itinerary_read` - Retrieve 1 or many itineraries.

#### Payload

```JSON
{
  "id": "uuid|optional",
  "organisation": "uuid|optional",
  "event": "uuid|optional",
  "start_date": "datetime|optional",
  "end_date": "datetime|optional"
}
```

#### Receive

`admin_itinerary_read`

#### Successful Payload - Many

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "items": 2,
    "page": 1
  },
  "response": [
    {
      "id": "uuid",
      "slug": "string",
      "name": "string",
      "website": "string",
      "start_date": "datetime",
      "end_date": "datetime",
      "event": "uuid",
      "landing_page": "uuid"
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
    "items": 1,
    "page": 1
  },
  "response": {
    "id": "uuid",
    "slug": "string",
    "name": "string",
    "website": "string",
    "start_date": "datetime",
    "end_date": "datetime",
    "event": "uuid",
    "landing_page": "uuid"
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 404,
  "meta": {
    "permitted": true,
    "message": "not_found"
  }
}
```

#### Send

`admin_itinerary_update` - Update an existing itinerary.

#### Payload

```JSON
{
  "id": "uuid|required",
  "name": "string|optional|2-250",
  "website": "string|optional|5-250",
  "start_date": "datetime|optional",
  "end_date": "datetime|optional",
  "event": "uuid|optional",
  "landing_page": "uuid|optional"
}
```

#### Receive

`admin_itinerary_update`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "updated"
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

#### Send

`admin_itinerary_delete` - Delete an itinerary.

#### Payload

```JSON
{
  "id": "uuid|required"
}
```

#### Receive

`admin_itinerary_delete`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "deleted"
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 404,
  "meta": {
    "permitted": true,
    "message": "not_found"
  }
}
```

### Itinerary Items

This section is used for CRUD tasks relating to an event itinerary items

#### Send

`admin_item_create` - Create a new itinerary item.

#### Payload

```JSON
{
  "title": "string|required|2-250",
  "start_date": "datetime|optional",
  "end_date": "datetime|optional",
  "itinerary": "uuid|required",
  "landing_page": "uuid|optional",
  "type": "enum|item_types|required",
  "configuration": item_type_config
}
```

##### item_types

* rtmp
* zoom
* webrtc
* video
* forum
* chat
* html

##### item_type_config

* rtmp

```JSON
{
  "mode": "enum|rtmp_modes|required",
  "broadcast": boolean,
  "actor": "uuid|required"
}
```

* zoom

```JSON
{
  "meeting_id": "string|required"
}
```

* webrtc

```JSON
{
  "moderators": ["uuid|required"]
}
```

* video

```JSON
{
  "url": "string|required"
}
```

* forum

```JSON
{
  "moderators": ["uuid|required"]
}
```

* chat

```JSON
{
  "moderation": "string|required",
  "moderators": ["uuid|optional"],
  "max_rooms": integer,
  "max_members": integer,
  "threads": boolean,
  "private": boolean
}
```

* html

```JSON
{
  "source_code": "string|required"
}
```

##### rtmp_modes

* record
* live

#### Receive

`admin_itinerary_create`

#### Successful Payload

```JSON
{
  "status": 201,
  "meta": {
    "permitted": true,
    "message": "created"
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

#### Send

`admin_item_read` - Retrieve 1 or many itineraries.

#### Payload

```JSON
{
  "id": "uuid|optional",
  "organisation": "uuid|optional",
  "event": "uuid|optional",
  "start_date": "datetime|optional",
  "end_date": "datetime|optional",
  "type": "enum|item_types|required",
}
```

#### Receive

`admin_item_read`

#### Successful Payload - Many

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "items": 2,
    "page": 1
  },
  "response": [
    {
      "id": "uuid",
      "slug": "string",
      "name": "string",
      "website": "string",
      "start_date": "datetime",
      "end_date": "datetime",
      "event": "uuid",
      "landing_page": "uuid"
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
    "items": 1,
    "page": 1
  },
  "response": {
    "id": "uuid",
    "slug": "string",
    "name": "string",
    "website": "string",
    "start_date": "datetime",
    "end_date": "datetime",
    "event": "uuid",
    "landing_page": "uuid"
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 404,
  "meta": {
    "permitted": true,
    "message": "not_found"
  }
}
```

#### Send

`admin_itinerary_update` - Update an existing itinerary.

#### Payload

```JSON
{
  "id": "uuid|required",
  "name": "string|optional|2-250",
  "website": "string|optional|5-250",
  "start_date": "datetime|optional",
  "end_date": "datetime|optional",
  "event": "uuid|optional",
  "landing_page": "uuid|optional"
}
```

#### Receive

`admin_itinerary_update`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "updated"
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

#### Send

`admin_itinerary_delete` - Delete an itinerary.
#### Payload

```JSON
{
  "id": "uuid|required"
}
```

#### Receive

`admin_itinerary_delete`

#### Successful Payload

```JSON
{
  "status": 200,
  "meta": {
    "permitted": true,
    "message": "deleted"
  }
}
```

#### Unsuccessful Payload

```JSON
{
  "status": 404,
  "meta": {
    "permitted": true,
    "message": "not_found"
  }
}
```
