module.exports = (db, mongoose) => {
	const settingsSchema = new mongoose.Schema({
		id: {
			type: String,
			unique: true
		},

		songCount: {
			type: Number,
			default: 0
		}
	});
	settingsSchema.index({
		id: 1
	});
	db.model("settings", settingsSchema);
};
