# monitoring-service
A simple service that allows you to monitor remote endpoints and list results. 
Monitored endpoints are expected to return their **payloads as JSON.**

## requirements 
docker v 17.04.0+. to check version, run 
```
$ docker -v 
```
## how to run it

Clone this repo.

Go to .env.example file and create .env.development and 
.env.test file. 

Prepare containers as defined in docker-compose.yml, 
this might take a while.
```
$ docker-compose build
```
Run your containers with this command. Now you should 
be able to access monitoring-service on port 3000.

```
$ docker-compose up
```

You might want to run containers in detached mode (on background).
To accomplish this run:

```
$ docker-compose up -d 
```

To get an interactive prompt, you can run  

```
$ docker-compose exec monitoring-service sh
```

Voilá, npm commands are now accessible. 


To seed development database run:

```
$ npm run seed
```

To run tests: 
```
$ npm run test
```


## API

## authentication 
All routes require authentication provided x-access-token in header. Like this:

x-access-token:dcb20f8a-5657-4f1b-9f7f-ce65739b359e

## authorization 
Service recognizes user types. User type is used to decide your level of authorization.
Currently there is 

User type 1, which is a common user, that can access only records belonging to him. To try 
out, you can use:
```
x-access-token: dcb20f8a-5657-4f1b-9f7f-ce65739b359e
```
User type 10, which is an admin user, that can access any record. To try out, you can use 
```
x-access-token: 93f39e2f-80de-4033-99ee-249d92736a2 
```

### monitored-endpoint

| Route         | Method        | Result|
| ------------- |---------------| ------|
| v1/monitored-endpoints | GET | fetch all  |
| v1/monitored-endpoints/user | GET | fetch all belonging to requesting user|
| v1/monitored-endpoints/:id | GET | fetch one by id |
| v1/monitored-endpoints/:id/monitoring-results | GET | fetch last 10 monitoring results for endpoint selected by id |
| v1/monitored-endpoints | POST | create new |
| v1/monitored-endpoints/:id | PUT | update one selected by id |
| v1/monitored-endpoints/:id | DELETE | delete one selected by id |

### monitoring-result

| Route         | Method        | Result|
| ------------- |---------------| ------|
| v1/monitoring-results | GET | fetch all  |
| v1/monitoring-results/:id | GET | fetch one by id |
| v1/monitoring-results | POST | create new |
| v1/monitoring-results/:id | PUT | update one selected by id |
| v1/monitoring-results/:id | DELETE | delete one selected by id |
