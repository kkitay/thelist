const path = require('path')
const passportJWT = require('passport-jwt');
const users = require(path.join(__dirname, 'models/users.js'));

// passport auth strategy
const authSecret = require(path.join(__dirname, 'config.js')).authSecret;
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

let options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: authSecret
};

// this is the authenticity checking middleware
// simply checks for the user by encrypted id in the token payload
// that token is created in login route
let strategy = new JwtStrategy(options, async function(payload, next) {
  try {
    let user = await users.findById(payload.id);
    //console.log('authenticated: ' + util.inspect(user));
    next(null, user);
  }catch(e) {
    //console.log('error authenticating' + e);
    next(null, false);
  }
});

module.exports = strategy;