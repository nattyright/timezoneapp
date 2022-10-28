const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    createdAt: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        default: new Date(),
    },
    lastLogin: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        default: new Date(),
    },
    timezone: {
        type: mongoose.SchemaTypes.String,
        required: true,
        default: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    friends_accepted: {
        type: mongoose.SchemaTypes.Array,
        required: false,
    },
    friends_pending: {
        type: mongoose.SchemaTypes.Array,
        required: false,
    },
    friends_request: {
        type: mongoose.SchemaTypes.Array,
        required: false,
    },
    availability: {
        type: mongoose.SchemaTypes.Array,
        required: false,
    },
    customization: {
        type: mongoose.SchemaTypes.Object,
        required: false,
    }

});

// export mongoose model named 'users'
module.exports = mongoose.model('users', UserSchema);