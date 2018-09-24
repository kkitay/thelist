const express = require('express');
const router = express.Router();
const path = require('path');
const url = require('url');
const items = require(path.join(__dirname, '../models/items'));

router.get('/', async function(req, res, next) {
  try {
    // grab all the items sorted by date (to start)
    let foundItems = await items
        .find({
          deleted_at: null
        })
        .sort({ created_at: -1 })
        .limit(25)
        .lean()
        .populate('created_by');
        
    foundItems.map((item, index) => {
      // extract the host from the url if any
      if(item.url) {
        let hostname = url.parse(item.url).host;
        item.host = hostname;
      }
      // build readable date
      let date = new Date(item.created_at);
      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      item.date = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
      
      // create a quasi-index for the client
      item.index = index + 1;
      return item;
    });

    // descriptions
    res.render('index', {
      title: 'The List',
      description: 'Honor the list and the list will honor you.',
      items: foundItems
    });
  } catch(e) {
    console.error(e);
    res.status(200).json({ error: e.message });
  }
});

module.exports = router;