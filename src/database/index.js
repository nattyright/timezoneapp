const mongoose = require('mongoose');

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

mongoose
    .connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`)
    .then(() => console.log('Connected to DB'))
    .catch((err) => console.log(err));
