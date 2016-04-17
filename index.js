var express = require('express');

var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
	db.collection('landmarks').createIndex({'geometry':"2dsphere"});
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
					response.send(500);
				}
				else {
					var responseJSON = {
						"landmarks":[],
						"people":[]
					};

					coll.find().toArray(function(err, cursor) {
						responseJSON.people = cursor;
						db.collection('landmarks').find({
							geometry:{
								$near:{
									$geometry:{
										type:"Point",
										coordinates:[checkinToInsert.lng,checkinToInsert.lat]
									},
									$maxDistance: 1609,
									$minDistance: 0
								}
							}
						}).toArray(function(err, c) {
							responseJSON = c;
							response.send(JSON.stringify(responseJSON) + '\n');
						});
					});
				}
			});
		});
	}
});

app.get('/checkins.json', function(request, response) {
	var login = request.query.login;
	db.collection('checkins', function(error, coll) {
		coll.find({"login":login}).toArray(function(error, cursor) {
			response.send(JSON.stringify(cursor) + "\n");
		});
	});
});

app.get('/', function(request, response) {
	response.set('Content-Type', 'text/html');
	var indexPage = '';
	db.collection('checkins', function(error, coll) {
		coll.find().toArray(function(err, cursor) {
			if (!err) {
				indexPage += "<!DOCTYPE HTML><html><head><title>Recent Check Ins</title></head><body><h1>Recent Check Ins</h1>";
				for (var count = 0; count < cursor.length; count++) {
					indexPage += "USER: " + cursor[count].login + " checked in at (" + cursor[count].lat;
					indexPage += ", " + cursor[count].lng + ") on " + cursor[count].created_at + "</br>";
				}
				indexPage += "</body></html>";
				response.send(indexPage);
			}
			else {
				response.send('<!DOCTYPE HTML><html><head><title>Error Page</title></head><body><h1>An Error Occurred</h1></body></html>');
			}
		});
	});
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
