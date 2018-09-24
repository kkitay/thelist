const path = require('path');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const users = require(path.join(__dirname, '../models/users.js'));
const items = require(path.join(__dirname, '../models/items.js'));
const authSecret = require(path.join(__dirname, '../config.js')).authSecret;
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');

async function login(res, user, pass) {
  // find the correct user document
  let userDoc = await users.findOne({ username: user });

  if(userDoc && userDoc.validPassword(pass)) {
    // create payload and encode token
    let payload = { id: userDoc.id };
    let token = jwt.sign(payload, authSecret);
    
    // respond with token
    return res.status(200).json({
      status: "signed in",
      token: token
    });
  } else {
    return res.status(400).json({ status: "bad user/pass" });
  }
}

router.post('/api/users/recent',
passport.authenticate('jwt', { session: false }),
async function(req, res) {
    // grab last create and last delete
    try {
      let twelveHrsAgo = new Date(new Date().getTime()-60*60*12*1000).toISOString();
      console.log(twelveHrsAgo);
      let recentDocs = await items.find({
        $or: [
          // created by recently
          {
            created_by: req.user.id,
            created_at: {
              $gte: twelveHrsAgo
            }
          },
          // deleted by recently
          {
            deleted_by: req.user.id,
            deleted_at: {
              $gte: twelveHrsAgo
            }
          }
        ]
      }).countDocuments();
      res.status(200).json({docs: recentDocs});
    }catch(e) {
      console.log(e);
      res.status(500).json({error: e});
    }
    
});

router.post('/api/users/login', function(req, res) {
  let name = req.body.name;
  let password = req.body.password;

  login(res, name, password);
});

router.post('/api/users/create',
  [
    check('name', 'Name must be 3-12 chars.').trim().isLength({min: 3, max:12}),
    check('name', 'Name must be alphanumeric.').trim().isAlphanumeric(),
    check('password', 'Password must be 6-160 chars.').isLength({min: 6, max:160})
  ],
  async function(req, res) {
    // errors generated from express-validator, if any; throws if not null
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
      let errMsg = errors.array().reduce((acc, val) => {
        return acc + val.msg + ' '; 
      }, '');
      return res.status(400).json({ status: errMsg });
    }

    let name = req.body.name;
    let password = req.body.password;
  
    // check if username exists already
    let checkUsername = await users.findOne({ username: name });
    if(checkUsername) {
      return res.status(400).json({ status: "user already exists" });
    }

    // create new user document
    let newUser = new users({
      username: name,
      password: password
    });
  
    newUser.save(err => {
      if(err) return res.status(500).json({ status: "Saving error", error: err });
      login(res, name, password);
    });
  }
);

module.exports = router;