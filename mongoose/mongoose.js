/**
 * Mongoose.js is a simple Node application that allows a web user to browse
 * beers from a simple menu, increase or decrease their rating, and view details
 * of each individual beer.
 */
var mongoose  = require('mongoose'),
    db        = mongoose.connect('mongodb://localhost/test'),
    express   = require('express'),
    app       = express.createServer(),
    Schema    = mongoose.Schema,
    
    Type = new Schema({
		  name	        : String,
		  main_ingredient : String
    }),
	
    Beer = new Schema({
	    brand       : String,
  		type        : [Type],
  		brewery_age : Number,
  		rating      : Number
    }).method('increaseRating', function(){
      this.rating += 1;
      return this.rating;
    }).method('decreaseRating', function(){
      this.rating -= 1;
      return this.rating;
    }),
	
    BeerModel = mongoose.model('Beer', Beer);

/**
 * Validate the rating field to be between 10 and 50
 */
Beer.path('rating').validate(function(val){
  return val>10 && val<=50;
}, 'Rating for beer is not between 10 and 50');


function sendResponse(res, output) {
  var navOutput = '<a href="/beers">List All</a> | <a href="/orderbeers">Place Order</a><br/><br/>' + output;
  res.send(navOutput);
}

/**
 * Root route, just display sample URLs
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Object} next
 */
app.get('/', function(req, res, next){
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write('<p>Try /beers to view all beers</p>');
  res.write('<p>Try /beer/id/{id} to view a specific beer by its ID</p>');
  res.write('<p>Try /orderbeers to add sample beers to database</p>');
  res.end();
});


/**
 * Populate the database with four sample beers
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Object} next
 */
app.get('/orderbeers', function(req, res, next){
  
  var Yuengling = new BeerModel({ brand:'Yuengling', brewery_age:105, rating: 40 });
  Yuengling.type.push({ name:'Lager', main_ingredient:'Malted Barley' });
  Yuengling.save(function(err){
    if (err) { console.log(err); } 
  });
  
  var Pecan = new BeerModel({ brand:'Southern Pecan', brewery_age:105, rating: 50 });
  Pecan.type.push({ name:'Ale', main_ingredient:'Malted Barley' });
  Pecan.save(function(err){ 
    if (err) { console.log(err); }
  });

  var BerryWeiss = new BeerModel({ brand:'Leinenkugle Berry Weiss', brewery_age:105, rating: 30 });
  BerryWeiss.type.push({ name:'Weiss', main_ingredient:'Wheat' });
  BerryWeiss.save(function(err){ 
    if (err) { console.log(err); }
  });

  var Cheriton = new BeerModel({ brand:'Cheriton Pots', brewery_age:105, rating: 40 });
  Cheriton.type.push({ name:'Stout', main_ingredient:'Hops' });
  Cheriton.save(function(err){ 
    if (err) { console.log(err); }
  });

  sendResponse(res, 'Four beers ordered!');
});


/**
 * List all beers
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Object} next
 */
app.get('/beers', function(req, res, next){
  var list='';
  
	BeerModel.find({}, function(err, beers) {
		beers.forEach(function(beer){
		  list += '<div style="border: 1px solid black; margin-top:5px; padding: 5px;">';
		  list += '<h3>' + beer.brand + ' (' + beer.type[0].name + ') - ';
		  list += beer.rating + ' star rating</h3> <a href="/beer/improve/'+beer._id+'">+</a> / <a href="/beer/reduce/'+beer._id+'">-</a>';
		  list += '<p style="font-size:0.6em;">id:<a href="/beer/id/'+beer._id+'">' + beer._id + '</a></p></div>';
		  list += '[<a href="/beer/remove/'+beer._id+'">Remove</a>]';
		});
		
		sendResponse(res, list);
	});
});



/**
 * Find a beer by its unique identifier
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Object} next
 */
app.get('/beer/id/:id', function(req, res, next){
  var id = req.params.id,
      text='';

  BeerModel.findById(id, function(err, beer) {
    // Ensure item exists
    if (beer) {
       sendResponse(res, beer.brand + '(' + beer.type[0].name + ') - ' + beer.rating + ' star rating');
    } else {
      next(new Error('Beer named ' + id + ' does not exist'));
    }
  });
});


/**
 * Remove a beer
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Object} next
 */
app.get('/beer/remove/:id', function (req, res, next) {
  var id = req.params.id;

  BeerModel.findById(id, function(err, beer) {
    // If the beer exists, remove it
    if (beer) {
       beer.remove(function(err){});
       
       sendResponse(res, '<h3>Beer removed</h3>');
    } else {
      next(new Error('Beer named ' + id + ' does not exist'));
    }
  });
});


/**
 * Increase the rating of a beer
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Object} next
 */
app.get('/beer/improve/:id', function (req, res, next) {
  var id = req.params.id,
      rating;

  BeerModel.findById(id, function(err, beer) {
    // Ensure item exists
    if (beer) {
      beer.increaseRating();
      beer.save();
      sendResponse(res, beer.brand + '(' + beer.type[0].name + ') - ' + beer.rating + ' star rating');
    } else {
      next(new Error('Beer named ' + id + ' does not exist'));
    }
  });
});


/**
 * Reduce the rating of a beer
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Object} next
 */
app.get('/beer/reduce/:id', function (req, res, next) {
  var id = req.params.id,
      rating;

  BeerModel.findById(id, function(err, beer) {
    // Ensure item exists
    if (beer) {
      beer.decreaseRating();
      beer.save();
      sendResponse(res, beer.brand + '(' + beer.type[0].name + ') - ' + beer.rating + ' star rating');
    } else {
      next(new Error('Beer named ' + id + ' does not exist'));
    }
  });
});


// Middleware
app.use(express.errorHandler({ showStack: true }));

app.listen(8081);