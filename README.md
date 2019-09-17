# Next Redux Itinerary

_An itinerary app with dragging inputs reorder & optimize itinerary features._

This project is built with :

* Next.js (see [here](https://github.com/zeit/next.js/) for the relative documentation).
* Koa
* React
* React-google-maps
* Redux
* Redux-form
* React-motion
* Redux-saga
* Reselect
* Seamless-immutable
* Rebass
* Eslint & prettier
* Enzyme & Jest
* Husky

## Demo

You can see the live demo of the itinerary app on [Heroku](https://next-redux-itinerary.herokuapp.com/).

You can customize the itinerary by filling the form, or by adding Google place ids to the url with the following format:

```
?addresses=ChIJN7ithv1x5kcRBEKOU44bvMk,ChIJ3e-
uwuFv5kcRamCUXhoPOhI,ChIJd8y5Qzlu5kcRijTUmkvheew,ChIJ270fenJu5kcRV2qNT7_VbF0
```

**Warning :** the results in the form are limited to France (but not in the query string).

## Installation

* Clone this repo
* Run `npm install`
* The project uses dotenv for handling environment variables. Rename `.env.sample` to `.env` and replace the GOOGLE_API_KEY with your own.
* Once dependencies installed, run `npm start` (production) or `npm run dev` (development)
* Open your browser at `http://localhost:3000`

## Run tests

Just run : `npm run test`

## Launch with docker-compose

```sh
docker-compose up --build -d
```
### Troubleshoot
- permission denied: `sudo chown $USER:$USER -R postgres-db`

## Connect to postgres (psql):

```
docker run -it --rm  --network next-itinerary_default --name pg postgres psql -h postgres-db -p 5432 -U postgres postgres
```
### Troubleshoot
- default network naming may vary with different docker-compose versions, use `docker network list` to find the right network

### Create your database `itinerary`

```
CREATE DATABASE itinerary;
```

### Connect to it

```
\connect itinerary
```

The postgres instance should be accessible inside the itinerary app with its container address:

```
# PostgresSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_URL=postgres-db
POSTGRES_DB=itinerary
```

## Ways to improve

* End unit testing
* Add end to end testing
* Improve responsive
* Improve UX on draggable inputs

## Troubleshooting

* The postgres db being in the root folder of the app being build, you may have to chmod the `postgres-db` folder to prevent the docker build from failing

  `sudo chown 999:$USER -R postgres-db`
