const { Router } = require('express');
const User = require('../database/schemas/User');
const moment = require('moment-timezone');


const router = Router();

// middleware
router.use((req, res, next) => {
    // console.log('Inside Secret Auth Check Middleware');
    // console.log(req.user);
    if (req.user) next();
    // not authenticated
    else res.redirect('/auth/login');
});

router.use((req, res, next) => {
    if (req.user.friends_request.length > 0) {
        req.incomingfriendrequest = 1;
    } else {
        req.incomingfriendrequest = 0;
    }
    next();
});



router.get('/faq', (request, response) => {
    response.render('secret/faq', { 
        incomingfriendrequest: request.incomingfriendrequest,
        pageName: 'faq' 
    });
});





router.get('/', async (request, response) => {
    const myDB = request.user;
    var myFriends = [];

    // get user's own availability
    var selfObj = {};
    selfObj['email'] = 'Me';
    selfObj['availability'] = myDB.availability; 
    selfObj['timezone'] = myDB.timezone;
    myFriends.push(selfObj);


    // get friends and their availabilities
    for (friendEmail of myDB.friends_accepted) {
        const userDB = await User.findOne({ email: friendEmail });


        var myTimezone = moment().tz(request.user.timezone).utcOffset()
        var friendTimezone = moment().tz(userDB.timezone).utcOffset()
        var timezoneOffset = (myTimezone - friendTimezone)/60;

        var friendObj = {};
        friendObj['email'] = friendEmail;
        friendObj['availability'] = userDB.availability; 
        friendObj['timezoneOffset'] = timezoneOffset;
        friendObj['timezone'] = userDB.timezone;

        myFriends.push(friendObj);
    };


    response.render('secret', {
        incomingfriendrequest: request.incomingfriendrequest, 
        pageName: 'secret',
        myFriends: myFriends
    });
});






router.get('/myschedule', (request, response) => {
    response.render('secret/myschedule', { 
        incomingfriendrequest: request.incomingfriendrequest,
        pageName: 'myschedule',
        timezone: request.user.timezone,
        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        availability: request.user.availability,
        allTimezones: moment.tz.names() 
    });
});

router.post('/myschedule/updatetimezone', async (request, response) => {
    const newTimezone = request.body.timezoneOption;
    const myDB = request.user;
    myDB.timezone = newTimezone;

    await User.findOneAndUpdate({ email : myDB.email }, { timezone: myDB.timezone });

    // refresh page when done
    //response.redirect(request.get('referer'));
    response.end();
});

router.post('/myschedule/add', async (request, response) => {
    const eventID = "day-" + 
                    request.body['add-time-day'] + 
                    "-start-" + 
                    request.body['add-time-hour-start'] +
                    "-end-" + 
                    request.body['add-time-hour-end'];
    const newEvent = {
        id:       eventID,
        day:      request.body['add-time-day'],
        hourstart:request.body['add-time-hour-start'],
        hourend:  request.body['add-time-hour-end']
    };

    request.user.availability.push(newEvent);

    const myDB = request.user;
    await User.findOneAndUpdate({ email : myDB.email }, { availability: myDB.availability });

    // refresh page when done
    response.redirect(request.get('referer'));
});

router.post('/myschedule/remove', async (request, response) => {
    const eventID = request.body.eventid;

    for (var i = 0; i < request.user.availability.length; i++) {
        if (eventID === request.user.availability[i].id) {
            request.user.availability.splice(i, 1);
        }
    }

    const myDB = request.user;
    await User.findOneAndUpdate({ email : myDB.email }, { availability: myDB.availability });

    // refresh page when done
    response.redirect(request.get('referer'));

});







router.get('/friends', async (request, response) => {
    const friendsAccepted = request.user.friends_accepted;
    const friendsPending = request.user.friends_pending;
    const friendsRequest = request.user.friends_request;
    const customization = request.user.customization ? request.user.customization : {};

    response.render('secret/friends', { 
        incomingfriendrequest: request.incomingfriendrequest,
        pageName: 'friends',
        friendsAccepted: friendsAccepted,
        friendsPending: friendsPending,
        friendsRequest: friendsRequest,
        customization: customization
    });
});

router.post('/friends/add', async (request, response) => {
    const { email } = request.body;
    try {
        const userDB = await User.findOne({ email });
        if (userDB) {
            // add myId to the other user's requests list
            if(userDB.friends_request.indexOf(request.user.email) === -1) {
                userDB.friends_request.push(request.user.email);
                await User.findOneAndUpdate({ email: email }, { friends_request: userDB.friends_request });
            }
            
            // add the other user's id to my pending list
            if (request.user.friends_pending.indexOf(email) === -1) {
                request.user.friends_pending.push(email);
                await  User.findOneAndUpdate({ email : request.user.email }, { friends_pending: request.user.friends_pending });
            }

            // refresh page when done
            response.redirect(request.get('referer'));
        }
    } catch (err) {
        console.log('User not found.');
    }
});

router.post('/friends/accept', async (request, response) => {
    const myDB = request.user;
    const { email } = request.body;
    try {
        const userDB = await User.findOne({ email });

        if (userDB) {

            // add my email to the other user's accepted friends list
            userDB.friends_accepted.push(myDB.email);
            await User.findOneAndUpdate({ email: email }, { friends_accepted: userDB.friends_accepted });

            // remove my email from the other user's pending friends list
            var index = userDB.friends_pending.indexOf(myDB.email);
            if (index > -1) { // only splice array when item is found
              userDB.friends_pending.splice(index, 1); // 2nd parameter means remove one item only
            }
            await User.findOneAndUpdate({ email: email }, { friends_pending: userDB.friends_pending });

            // add the other user's email to my accepted friends list
            myDB.friends_accepted.push(email);
            await  User.findOneAndUpdate({ email : myDB.email }, { friends_accepted: myDB.friends_accepted });

            // remove the other user's email from my requested friends list

            index = myDB.friends_request.indexOf(email);
            if (index > -1) { // only splice array when item is found
              myDB.friends_request.splice(index, 1); // 2nd parameter means remove one item only
            }
            await  User.findOneAndUpdate({ email : myDB.email }, { friends_request: myDB.friends_request });

            // refresh page when done
            response.redirect(request.get('referer'));
        }
    } catch (err) {
        console.log('User not found.', err);
    }

});

router.post('/friends/decline', async (request, response) => {
    const myDB = request.user;
    const { email } = request.body;
    try {
        const userDB = await User.findOne({ email });

        if (userDB) {

            // remove my email from the other user's pending friends list
            var index = userDB.friends_pending.indexOf(myDB.email);
            if (index > -1) { // only splice array when item is found
              userDB.friends_pending.splice(index, 1); // 2nd parameter means remove one item only
            }
            await User.findOneAndUpdate({ email: email }, { friends_pending: userDB.friends_pending });

            // remove the other user's email from my requested friends list

            index = myDB.friends_request.indexOf(email);
            if (index > -1) { // only splice array when item is found
              myDB.friends_request.splice(index, 1); // 2nd parameter means remove one item only
            }
            await  User.findOneAndUpdate({ email : myDB.email }, { friends_request: myDB.friends_request });

            // refresh page when done
            response.redirect(request.get('referer'));
        }
    } catch (err) {
        console.log('User not found.', err);
    }

});


router.post('/friends/manage', async (request, response) => {
    console.log(request.body);
    const email = request.body.email;
    const nickname = request.body.nickname;
    const group = request.body.group;
    const profile = request.body.profile;
    const myDB = request.user;

    var customObj = {};

    if (nickname.length > 0) {
        customObj['nickname'] = nickname;
    }

    if (group.length > 0) {
        customObj['group'] = group;
    }

    if (profile.length > 0) {
        customObj['profile'] = profile;
    }

    if (!myDB.customization) {
        myDB.customization = {}
    }

    myDB.customization[email] = customObj;

    try {
        await  User.findOneAndUpdate({ email : myDB.email }, { customization: myDB.customization });

        response.redirect(request.get('referer'));
    } catch {
        console.log('User not found.', err);
    }

});

module.exports = router;