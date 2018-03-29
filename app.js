var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var config = require("./config");
var base58 = require("./base58");
var Url = require("./models/url");

// create connection to MongoDB
mongoose.connect("mongodb://" + config.db.host + "/" + config.db.name);

// handle JSON bodies
app.use(bodyParser.json());
// handle URL encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// get the file path
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, "views/index.html"));
});

app.post("/api/shorten", function(req, res) {
	//receive this request => try to shorten the url
	var longUrl = req.body.url;
	var shortUrl = "";

	Url.findOne({ long_url: longUrl }, function(err, doc) {
		// if the longUrl is already in the database
		if (doc) {
			shortUrl = config.webhost + base58.encode(doc._id);
			// send back the shortUrl
			res.send({ shortUrl: shortUrl });
		} else {
			var newUrl = Url({
				long_url: longUrl
			});

			//save the new link
			newUrl.save(function(err) {
				if (err) {
					console.log(err);
				}

				shortUrl = config.webhost + base58.encode(newUrl._id);
				res.send({ shortUrl: shortUrl });
			});
		}
	});
});

app.get("/:encoded_id", function(req, res) {
	var base58Id = req.params.encoded_id;
	var id = base58.decode(base58Id);

	Url.findOne({ _id: id }, function(err, doc) {
		if (doc) {
			// if we found the long url, redirect to that
			res.redirect(doc.long_url);
		} else {
			// found nothing, take home
			res.redirect(config.webhost);
		}
	});
});

var server = app.listen(5000, function() {
	console.log("Server listening");
});
