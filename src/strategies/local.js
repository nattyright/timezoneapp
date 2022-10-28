const passport = require('passport');
const { Strategy } = require('passport-local');
const User = require('../database/schemas/User');
const { comparePassword } = require('../utils/helpers');


passport.serializeUser((user, done) => {
    console.log('Serializing User...');
    console.log(user);
    done(null, user.id)
});

// the first param is the 2nd of the serialize function
passport.deserializeUser(async (id, done) => {
    //console.log('deserializing User...');
    // console.log(id);
    try {
        const user = await User.findById(id);
        if (!user) throw new Error('User not found');
        // console.log(user);
        done(null, user);
    } catch (err) {
        console.log(err);
        done(err, null);
    }
});

passport.use(
    new Strategy(
        {
            usernameField: 'email', // this is important, otherwise it will default to getting username from the 'username' field
        }, 
        async (email, password, done) => {
            console.log(email);
            console.log(password);

            
            try {
                // missing credentials
                if (!email || !password) {
                    throw new Error('Missing credentials.');
                }

                // user not found
                const userDB = await User.findOne({ email });
                if (!userDB) throw new Error('User not found.');

                // user found, check pw
                const isValid = comparePassword(password, userDB.password);
                if (isValid) {
                    console.log('Authenticated Successfully!');
                    // use done() to indicate we're done with the authentication functions
                    // and go to the next middleware
                    // done(ERROR, USER)
                    done(null, userDB);
                } else {
                    console.log('Invalid Authentication.');
                    done(null, null);
                }
            } catch (err) {
                console.log(err);
                done(err, null);
            }
            
        })
);