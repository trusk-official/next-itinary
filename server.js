const next = require('next');
const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const { parse } = require('url');
const request = require('request');
const cors = require('@koa/cors');

const knex = require('knex')({
  client: 'pg',
  version: '7.2',
  connection: {
    host: 'postgres-db',
    user: 'postgres',
    database: 'itinerary'
  }
});

const dev = process.env.NODE_ENV !== 'production';
const n = next({ dev });
const handle = n.getRequestHandler();
const API_ROUTES = ['/itinerary/optimize', '/itineraries'];

n.prepare().then(async () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error(
      'Project setup: you must create a .env file containing a valid GOOGLE_API_KEY parameter.'
    );
  }

  const app = new Koa();
  const router = new Router();

  router.get('*', async (ctx, next) => {
    const parsedUrl = parse(ctx.req.url, true);
    const { pathname } = parsedUrl;

    if (!API_ROUTES.includes(pathname)) {
      await handle(ctx.req, ctx.res);
      ctx.respond = false;
    } else {
      return next();
    }
  });

  router.get('/itinerary/optimize/', optimizeItinerary);
  router.get('/itineraries', getItineraries);
  router.get('/itineraries/:id', getItinerary);
  router.post('/itinerary', createItinerary);
  router.del('/itinerary/:id', removeItinerary);
  router.put('/itinerary/:id', updateItinerary);

  app.use(async (ctx, next) => {
    ctx.res.statusCode = 200;
    await next();
  });

  app.use(koaBody());
  app.use(cors());
  app.use(router.routes());

  app.listen(process.env.PORT || 3000);
});

// Optimize itinerary route :

const buildOptimizeUrl = (start, end, waypoints) =>
  `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${start}&destination=place_id:${end}&waypoints=optimize:true|place_id:${waypoints.join(
    '|place_id:'
  )}&key=${process.env.GOOGLE_API_KEY}`;

const fetchOptimizedItinerary = (start, end, placesIds) =>
  new Promise((resolve, reject) => {
    const googleUrl = buildOptimizeUrl(start, end, placesIds);

    request.get(googleUrl, (error, response, body) => {
      try {
        let json = JSON.parse(body);
        resolve(json.routes[0].waypoint_order);
      } catch (e) {
        reject(e);
      }
    });
  });

async function optimizeItinerary(ctx) {
  if (
    ctx.query.placesIds &&
    ctx.query.placesIds.length &&
    ctx.query.placesIds.length > 2
  ) {
    const placesIds = ctx.query.placesIds.split(',');
    const start = placesIds.shift();
    const end = placesIds.shift();

    try {
      const optimizedOrder = await fetchOptimizedItinerary(start, end, placesIds);
      const optimizedPlacesIds = [];

      optimizedOrder.forEach(o => {
        optimizedPlacesIds.push(placesIds[o]);
      });

      optimizedPlacesIds.unshift(start, end);

      ctx.body = {
        optimizedPlacesIds
      };
    } catch (e) {
      /* eslint-disable no-console */
      console.error('=> Error optimizing itinerary', e);
      /* eslint-enable */

      ctx.body = e;
    }
  } else {
    ctx.body = { error: true, message: 'No place ids provided' };
  }
}

async function getItineraries(ctx) {
  try {
    const itineraries = await knex.select().table('itineraries');
    ctx.body = {
      itineraries
    };
  } catch (e) {
    ctx.body = e;
  }
}

async function createItinerary(ctx) {
  try {
    const result = await knex('itineraries')
      .insert({
        label: ctx.request.body.label,
        place_ids: ctx.request.body.place_ids
      })
      .returning('*');
    ctx.body = result;
  } catch (e) {
    ctx.body = e;
  }
}

async function removeItinerary(ctx) {
  try {
    const result = await knex('itineraries')
      .where('id', ctx.params.id)
      .delete();
    ctx.body = result;
  } catch (e) {
    ctx.body = e;
  }
}

async function updateItinerary(ctx) {
  try {
    const result = await knex('itineraries')
      .where('id', ctx.params.id)
      .update({
        label: ctx.request.body.label,
        place_ids: ctx.request.body.place_ids
      })
      .returning('*');
    ctx.body = result;
  } catch (e) {
    ctx.body = e;
  }
}

async function getItinerary(ctx) {
  try {
    const itineraries = await knex
      .select()
      .table('itineraries')
      .where('id', ctx.params.id)
      .returning('*');
    ctx.body = {
      itineraries
    };
  } catch (e) {
    ctx.body = e;
  }
}
