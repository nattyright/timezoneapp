const mongoose = require('mongoose');

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

mongoose
    .connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`)
    .then(() => console.log('Connected to DB'))
    .catch((err) => console.log(err));
