const express = require('express');
const { check, validationResult } = require('express-validator/check');
const path = require('path');
const items = require(path.join(__dirname, '../models/items'));
const router = express.Router();
const url = require('url');
const passport = require('passport');

// ITEMS API
router.route('/api/items')

  // GET all the items
  .get(async function(req, res) {
    console.log('Received a GET to /api/items.');
    // Currently we'll just order them by newest first.
    try {
      let foundItems = await items
        .find()
        .sort({ created_at: -1 });
      res.status(200).json(foundItems);
    } catch(e) {
      res.status(500).json({ status: "Error getting item(s)", error: e });
    }
  })

  // POST a new item
  .post([
    check('title', 'Title must be 3+ chars.').trim().isLength({min: 3}),
    check('url', 'Invalid URL.').optional({checkFalsy: true}).isURL()
  ],
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    console.log('Received a POST to /api/items.');
    // require authentication
    /*if(!req.isAuthenticated()) {
      return res.status(401).json({ status: 'Must authenticate' });
    }*/
    
    // errors generated from express-validator, if any; throws if not null
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
      let errMsg = errors.array().reduce((acc, val) => {
        return acc + val.msg + ' '; 
      }, '');
      return res.status(400).json({ status: errMsg });
    }

    // create a new item
    let item = new items();
    item.title = req.body.title;
    item.url = req.body.url;
    item.created_by = req.user._id;

    // attempt to save it
    item.save((err) => {
      if(err) return res.status(500).json({ status: "Saving error", error: err });

      // success; render the new list item
      req.app.render('partials/li', {
        layout: false,
        title: item.title,
        url: item.url,
        host: url.parse(item.url).host,
        date: 'now',
        created_by: req.user
      }, (err, html) => {
        // who knows why that would happen
        if(err) return res.status(500);

        // FINALLY return success
        console.log('Item saved.');
        res.status(200).json({
          status: 'Item saved.',
          html: html
        });
      });

    });
  })

  .delete([
    check('id', 'Invalid ID').trim().isMongoId()
  ],
  passport.authenticate('jwt', { session: false }),
  function (req, res) {

    // validate id
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ status: "Invalid id" });

    let item_id = req.body.id;
    items.findById(item_id, (err, item) => {
      if(err) return res.status(500).json({ status: "Couldn't find item", error: err });

      item.deleted_at = new Date();
      item.deleted_by = req.user.id;
      item.save(err => {
        if(err) return res.status(500).json({ status: "Couldn't delete", error: err });
        res.status(200).json({ status: 'Item deleted.' });
      });
    });
  })
  
;

module.exports = router;