var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// counters collection with and _id field and seq, this only has one entry
var CounterSchema = Schema({
	_id: { type: String, required: true },
	seq: { type: Number, default: 0 }
});

// create a model from the schema
var counter = mongoose.model("counter", CounterSchema);

//create a schema for links
var urlSchema = new Schema({
	_id: { type: Number, index: true },
	long_url: String,
	created_at: Date
});

//before an entry is saved to the urls collection
urlSchema.pre("save", function(next) {
	var doc = this;
	counter.findByIdAndUpdate(
		{ _id: "url_count" },
		{ $inc: { seq: 1 } },
		function(error, counter) {
			if (error) {
				return next(error);
			}
			//set the _id of the urls collection to the incremented value of the counter
			doc._id = counter.seq;
			doc.created_at = new Date();
			next();
		}
	);
});

var Url = mongoose.model("Url", urlSchema);

module.exports = Url;
