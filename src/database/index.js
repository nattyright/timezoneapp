const mongoose = require('mongoose');

mongoose
    .connect('mongodb://localhost:27017/timezone_buddies')
    .then(() => console.log('Connected to DB'))
    .catch((err) => console.log(err));
