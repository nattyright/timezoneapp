const { Router } = require('express');
const passport = require('passport');
const User = require('../database/schemas/User');
const { hashPassword, comparePassword } = require('../utils/helpers');

const router = Router();


// login
router.get('/login', (request, response) => {
    if (request.user) response.render('secret', { pageName: 'secret' });
    else response.render('login');
});

router.post(
    '/login', 
    passport.authenticate('local', {
        successRedirect: '/secret',
        failureRedirect: '/auth/login'
    }), 
    (request, response) => {
        console.log('Logged In');
        response.sendStatus(200);
    }
);


// logout
router.get('/logout', (request, response) => {
    request.logout((err) => {
        if (err) return next(err);
        response.redirect('/');
    });
});



// register
router.get('/register', (request, response) => {
    response.render('register');
});

router.post('/register', async (request, response) => {
    const { email } = request.body;
    try {
        const userDB = await User.findOne({ email });
        if (userDB) {
            //response.status(400).send({ msg: 'User already exists!' });
            return response.render('register');
        } else {
            const password = hashPassword(request.body.password);
            console.log(password);
            const newUser = await User.create({ email, password });
            //response.sendStatus(201);
            response.redirect('/auth/login');
        }
    } catch (err) {
        response.redirect('/auth/register');
    }

});


module.exports = router;