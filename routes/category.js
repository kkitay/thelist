const express = require('express');
const router = express.Router();
const path = require('path');
const categories = require(path.join(__dirname, '../models/categories.js'));

// CATEGORY API
router.route('/api/category')

  // POST a new category
  .post(function (req, res) {
    console.log('Received a POST to /api/category.');
    let cat = new categories();
    cat.name = req.body.name;
    console.log('attempting to save category');
    cat.save((err) => {
      if(err) {
        res.send(err);
      }
      console.log('there was no error saving');
      res.json({ message: 'Category saved.' });
    });
  })
  
;

// CATEGORY PAGE
router.get('/category', async function (req, res) {
    //res.json({ categories: cats });
    res.render('category');
  })

;

module.exports = router;