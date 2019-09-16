// Update with your config settings.

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',
      database: 'itinary',
      user: 'postgres',
      password: 'password'
    },
    migrations: {
      tableName: 'create_itineraries'
    }
  }
};
