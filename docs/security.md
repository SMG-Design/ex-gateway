# Security

### Meta response payload

If a request requires authorization and it is not provided, the response will simply contain a meta object that outlines the requirements for accessing the requested item.

Reasons for being denied access include:

* unauthorized
* locked
* unmet_criteria

```JSON
{
  "status": 401,
  "meta": {
    "permitted": false,
    "reason": "unauthorized"
  }
}
```