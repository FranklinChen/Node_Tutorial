var http = require("http");
 
/**
 * Create an HTTP server listening on port 8081
 *
 * @param {Object} request
 * @param {Object} response
 */
http.createServer(function (request, response) {
   response.writeHead(200, { "Content-Type" : "text/html" });
   response.write("<html><body><h1>Open the pod bay doors, Hal.</h1></body></html>");
   response.end();
}).listen(8081);