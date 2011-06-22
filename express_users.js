var express = require('express'),
    app = express.createServer();

var users = [
    { name: 'Bartholomew', age: 45 }
  , { name: 'Nigel',       age: 32 }
  , { name: 'Horace',      age: 27 }
];

// Routes
app.get('/', function(req, res, next){
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write('<p>Visit /user/2</p>');
  res.write('<p>Visit /user/2.json</p>');
  res.write('<p>Visit /user/2.xml</p>');
  res.end();
});

app.get('/users.:format?', function(req,res){
	var format = req.params.format,
		i = 0,
		itemLen = users.length,
		output = '';
	
	switch(format) {
		case 'json':
			res.send(users);
			break;
		case 'xml':
			break;
		case 'html':
		default:
			for (;i < itemLen; i+=1) {
				output += '<h1>' + users[i].name + '</h1>' + '<h3>' + users[i].age + '</h3>';
			}
			res.send(output);
	}
});

app.get('/user/:id.:format?', function(req, res, next){
  var id = req.params.id
    , format = req.params.format
    , user = users[id];
    
  // Ensure item exists
  if (user) {
  	
    // Serve the format
    switch (format) {
      case 'json':
        // Detects json
        res.send(user);
        break;
      case 'xml':
        // Set contentType as xml then sends
        // the string
        var xml = ''
          + '<users>'
          + '<user><name>' + user.name + '</name><age>' + user.age + '</age></user>'
          + '</users>';
        res.contentType('.xml');
        res.send(xml);
        break;
      case 'html':
      default:
        // By default send some hmtl
        res.send('<h1>' + user.name + '</h1>' + '<h3>' + user.age + '</h3>');
    }
  } else {
  	
    // We could simply pass route control and potentially 404
    // by calling next(), or pass an exception like below.
    next(new Error('Item ' + id + ' does not exist'));
  }
});

// Middleware
app.use(express.errorHandler({ showStack: true }));

app.listen(8081);
