var http = require("http"),
   url=require("url"),
   path=require("path"),
   fs=require("fs"),
   events=require("events"),
   sqlite = require('sqlite'),
   db = new sqlite.Database(),
   emitter = new events.EventEmitter(),
   dbName = 'beersoftheworld.db';
 
/**
 * Create an HTTP server listening on port 8081
 *
 * @param {Object} request
 * @param {Object} response
 */
http.createServer(function (request, response) {

	// Parse the entire URI to get just the pathname
	var uri = url.parse(request.url).pathname;
	
	if(uri === '/beers'){
		response.writeHead(200, { "Content-Type" : "text/html" });
		response.write("<html><body>");

		open_the_bar(response);
		show_all_beers(response);
		

		emitter.on('noMenuAtTheTable', function() {
			create_beer_table(response);
		});
		

		emitter.on('noBeersToDrink', function() {
			create_sample_beers(response);
		});
		

		emitter.on('beerTableCreated', function() {
			show_all_beers(response);
		});
		

		emitter.on('sampleBeerCreated', function() {
			show_all_beers(response);
		});
		

		emitter.on('doneListingBeers', function() {
			db.close(function(error) { });
			response.write("</body></html>");
			response.end();
		});
		

		emitter.on('doneWithDB', function() {
			db.close(function(error) { });
		});

	} else {

		load_static_web_file(uri, response);
	}
	
}).listen(8081);



/**
 * Open the BEERSOFTHEWORLD database. db.open() will the create the file
 * if it doesn't already exist.
 *
 * @param {Object} response
 */
function open_the_bar(response) {
	db.open(dbName, function(error) {
		if (error) {
			response.write("<div>Hey! Where's the bar???</div>");
			console.log('open_the_bar:');
			console.log(error);
			emitter.emit('doneListingBeers');
		}
	});
}



/**
 * Create the BEERS table
 *
 * @param {Object} response
 */
function create_beer_table(response) {
	db.execute('CREATE TABLE IF NOT EXISTS beers (beerid INTEGER PRIMARY KEY ASC, name TEXT, country TEXT, rank INTEGER)', 
	    function(error, rows){
		if (error) {
			response.write("<div>Now we're really screwed, we don't have any menus.</div>");
			console.log('create_beer_table:');
			console.log(error);
			emitter.emit('doneListingBeers');
		} else {
			response.write("<div>Here's your beer menu, hon.</div>");
			emitter.emit('beerTableCreated');			
		}
	});
}



/**
 * Insert three sample beers into the BEER table
 *
 * @param {Object} response
 */
function create_sample_beers(response) {
	db.executeScript('INSERT INTO beers (name,country,rank) VALUES ("Lazy Magnolia Southern Pecan","USA",9);'
				   + 'INSERT INTO beers (name,country,rank) VALUES ("Red Clover Honey Ale","CAN",5);'
				   + 'INSERT INTO beers (name,country,rank) VALUES ("Negra Modelo","MEX",7);', 
		function(error, rows){
		
			if (error) {
				console.log('Error inserting beers data!');
				console.log(error);
				emitter.emit('doneListingBeers');
			} else {
				response.write('<div>New beer was just delivered.</div>');
				emitter.emit('sampleBeerCreated');
			}
	});
}


/**
 * Query the BEERS table and display all beer stats
 *
 * @param {Object} response
 */
function show_all_beers(response) {
	response.write("<div style='margin:20px 0 0 0;'>Time to check out what's on the menu.</div>");
	
	db.execute('SELECT COUNT(name) numberofbeers FROM beers', function(error, record){

		/**
		 * This means we probably don't have the beers table set up.
		 */
		if (error) {
			response.write("<div>I can't find the beer menu.</div>");
			console.log('show_all_beers:');
			console.log(error);
			emitter.emit('noMenuAtTheTable');
		} else {
		
			/**
			 * We successfully queried for number of beers
			 */
			if (record[0].numberofbeers === 0) {
				response.write("<div>There's no beer!!</div>");
				emitter.emit('noBeersToDrink');
			} else {
				response.write("<div>There's now " + record[0].numberofbeers + " beers to choose from.</div>");
				
				db.query('select name, country, rank from beers order by name asc', function(error, record){
					if (record) {
						response.write("<div style='padding:0 0 0 50px;'>" + record.name + " from " + record.country + " with a rank of " + record.rank +".</div>");
					} else {
						emitter.emit('doneListingBeers');
					}
				});				
			}
		}			
	});
}

/**
 * Handle the serving of files with static content
 *
 * @param {Object} uri
 * @param {Object} response
 */
function load_static_web_file(uri, response) {
   var filename = path.join(process.cwd(), uri);
 
   // If path.exists function takes a string parameter - which is a path to
   // the document being requested - and a function which gets passed a boolean
   // argument which is true if a file at the path exists, and false if it doesn't
   path.exists(filename, function(exists) {
 
      // File not found. Return a 404 error.
        if (!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("Four Oh Four! Wherefour art thou?");
            response.end();
            return;
        }
 
      // File does exist. Execute the FileSystem.readFile() method
      // with a closure that returns a 500 error if the file could not
      // be read properly.
        fs.readFile(filename, "binary", function(err, file) {
 
         // File could not be read, return a 500 error.
            if (err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err+"\n");
                response.end();
                return;
            }
 
         // File was found, and successfully read from the file system.
         // Return a 200 header and the file as binary data.
            response.writeHead(200);
            response.write(file, "binary");
 
         // End the response.
            response.end();
        });
    });
}
