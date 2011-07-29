var express = require('express'),
    app = express.createServer();

app.get('/', function(request, response){
	response.send("<h3>I'm afraid I can't do that, Dave...</h3>");
});

app.listen(8081);
