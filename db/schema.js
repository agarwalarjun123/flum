const mongoose = require("mongoose")
module.exports.taskModel = mongoose.model("task",new mongoose.Schema({

	taskName:String,
	taskOwner:String,
	task:String,
	taskDescription:String,
	taskStartingTime:{
		type:Date,
		default:Date.now()
	},
	status:{
		type:Number,
		default:0
	},
	worker:Number
}))