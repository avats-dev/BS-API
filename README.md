# BiteSpeed Assignment Task: Identity Reconciliation 

> Task Reference: https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-53392ab01fe149fab989422300423199

## Implementation 

I've created the mentioned `/identify` API using NestJS as framework and PostgreSQL as db. The NestJS framework uses depepndency injection (like Spring from Java) for decoupled and scalable implementation based on MVC architecture. I've created a `contacts` module which is wired to main app module. `contacts` module consists of contacts controller which has the `identify` POST API as is required in the task. The whole implementation is done using Typescript language.

**Apart from the scenarios mentioned in the task, I've assumed following scenarios as invalid:**

- Scenario-1 : Both email and phoneNumber is not provided in the request
```
{
	"email": null,
	"phoneNumber": null
}
```
With this request, you'll get a `BAD_REQUEST` response with an error message of invalid request.

- Scenario-2 : Either email or phoneNumber is provided but there exists no contact containing them
```
{
	"email": "dummyEmail",
	"phoneNumber": null
}
```
or
```
{
	"email": null,
	"phoneNumber": "dummyNumber"
}
```
With these requests, you'll get a `NOT_FOUND` response with an appropriate error message.

> For all the other cases where code errors out, application returns an `INTERNAL_SERVER_ERROR` response with the catched error message.

## Sample Response
With a valid request, you'll get a response like below:
```
{
    "contact": {
        "primaryContactId": 12,
        "emails": [
            "mcfly@hillvalley.edu",
            "lorraine@hillvalley.edu",
            "abc.xyz",
            "huhaaa@gmail.com"
        ],
        "phoneNumbers": [
            "123456",
            "123123",
            "252525"
        ],
        "secondaryContactIds": [
            13,
            14,
            17,
            18,
            19
        ]
    }
}
```

## Deployment

- I have deployed the PostgreSQL db on [render](https://render.com/).
- I have deployed the NestJS application on [cyclic](https://www.cyclic.sh/) as there is not out of the box support for deploying NestJS apps on render.

> Application link: https://shiny-jade-bream.cyclic.app

> API link: https://shiny-jade-bream.cyclic.app/contacts/identify

---

## Author Details
![resume-image]("https://i.ibb.co/YhY9K7V/resume-image.jpg")