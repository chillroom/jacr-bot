module.exports = function (server, mongoose) {
	var imageSchema = new mongoose.Schema({
		url: {
			type: String,
			unique: true
		}
	});
	server.db.model("image", imageSchema);
};
