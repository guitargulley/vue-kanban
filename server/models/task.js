var  models = require('../config/constants').models
let mongoose = require('mongoose')
let ObjectId = mongoose.Schema.ObjectId

var schema = new mongoose.Schema({
	name: { type: String, required: true },
	created: { type: Number, default: Date.now() },
	// Relations
	listId: { type: ObjectId, ref: models.list, required: true },
	oldId: { type: ObjectId, ref: models.list},
	boardId: { type: ObjectId, ref: models.board, required: true },
});

module.exports = mongoose.model(models.task.name, schema);