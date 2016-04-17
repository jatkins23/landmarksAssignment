var express = require('express');

var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/blueberry-cupcake-39701';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

app.use(function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.post('/sendLocation', function(request, response) {
	var login = request.body.login;
	var lat = request.body.lat;
	var lng = request.body.lng;

	var checkinToInsert = {
		login: login,
		lat: parseFloat(lat),
		lng: parseFloat(lng),
		created_at: new Date()
	};

	if (checkinToInsert.login == undefined ||
			checkinToInsert.lat == undefined ||
			checkinToInsert.lng == undefined ||
			typeof checkinToInsert.login !== "string" ||
			checkinToInsert.lat == "" ||
			checkinToInsert.lng == "" ||
			isNaN(checkinToInsert.lat) ||
			isNaN(checkinToInsert.lng))
	{
		response.send('{"error":"Whoops, something is wrong with your data!"}\n');
	}
	else {
		db.collection('checkins', function(error, coll) {
			var id = coll.insert(checkinToInsert, function(error, saved) {
				if (error) {
					response.send("fadsfaf");
				}
				else {
					reponse.send("aaaaaaaa");
				}
			});
		});
	}
	// if (login == "ALTA_ROSS" &&
	// 		lat == 23 &&
	// 		lng == 12) {
	// 	response.send('{"error":"It worked!"}\n');
	// }
	// db.collection('locations', function(error, col) {
	// 	var id = col.insert(toInsert, function(error, saved) {
	// 		if (error) {
	// 			response.send(500);
	// 		}
	// 		else {
	// 			response.send(200);
	// 		}
	// 	});
	// });
});

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

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
