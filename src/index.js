const express = require('express');
const cookieParser = require('cookie-parser');
//const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('./strategies/local');
require("dotenv").config();


// routes
const groceriesRoute = require('./routes/groceries');
const marketsRoute = require('./routes/markets');
const authRoute = require('./routes/auth');
const secretRoute = require('./routes/secret');

const app = express();
const PORT = process.env.NODE_LOCAL_PORT || 3001;
const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

app.set('view engine', 'ejs');
require('./database');


// middleware
app.use(express.static(__dirname + '/../public')); // serve up static CSS & asset files in 'public' folder
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'ZPODIFAWJEKFDSFOXJ',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}',
    }),
}))


// (middleware) fired before every request is made
app.use((req, res, next) => {
    console.log(`${req.method}:${req.url}`);
    next();
});


app.use(passport.initialize());
app.use(passport.session());


// routers
app.use('/api/groceries', groceriesRoute);
app.use('/api/markets', marketsRoute);
app.use('/auth', authRoute);
app.use('/secret', secretRoute);


app.get('/', (request, response) => {
    if (request.user) response.redirect('secret');
    else response.render('home');
});



app.listen(PORT, () => {
    console.log(`Running Express Server on Port ${PORT}!`);
});

