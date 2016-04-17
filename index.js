var express = require('express');

var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/blueberry-cupcake-39701';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

app.set('port', (process.env.PORT || 5000));

//Serve static content
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/lab8', function(request, response) {
	response.sendFile(__dirname + '/public/index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('sendLocation', function(request, reponse) {
	response.sendFile('pages/index');
})

app.post('/sendLocation', function(request, response) {
	//response.send('{"error":"Whoops, something is wrong with your data!"}');
	db.collection('locations', function(error, col) {
		var id = col.insert(toInsert, function(error, saved) {
			if (error) {
				response.send(500);
			}
			else {
				response.send(200);
			}
		});
	});
});
// app.set('port', (process.enc.PORT || 5000));
// app.listen(app.get('port'), function() {
// 	console.log('Node app is running on port', app.get('port'));
// });
