const { default: mongoose } = require('mongoose');
const { MONGODB_URI } = require('./config');

module.exports = async () => mongoose.connect(MONGODB_URI);
