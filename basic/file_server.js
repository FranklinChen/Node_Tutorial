var http = require("http"),
   url=require("url"),
   path=require("path"),
   fs=require("fs");
 
/**
 * Create an HTTP server listening on port 8081
 *
 * @param {Object} request
 * @param {Object} response
 */
http.createServer(function (request, response) {

	// Parse the entire URI to get just the pathname
	var uri = url.parse(request.url).pathname, query;
	
	load_static_web_file(uri, response);

}).listen(8081);


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
