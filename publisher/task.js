
const {taskModel} = require("../db/schema")

function Task(taskName,taskOwner,taskDescription,task){
	
	if(!new.target)
		return new Task(taskName,taskOwner,taskDescription,task)
	else{
		
		this.taskName = taskName
		this.taskOwner = taskOwner
		this.task = task
		this.taskDescription = taskDescription
		this.taskStartingTime = Date.now()	
		
	}

}

Task.prototype.onHold = function(){
	return new Promise((resolve,reject)=>{
		this.status = 0
		new taskModel(this)
			.save()
			.then(r =>resolve(r._id))
			.catch(err => reject(err))
	})

}

Task.prototype.start = function(id){

	return new Promise((resolve,reject)=>{
		taskModel.findByIdAndUpdate(id,{
			$set:{
				status:1
			}
		})
			.then(resolve)
			.catch(reject)
	})
}


Task.prototype.finish = function(id){
	return new Promise((resolve,reject)=>{
		taskModel.findByIdAndUpdate(id,{
			$set:{
				status:2
			}
		})
			.then(resolve)
			.catch(reject)
	})
}

module.exports = Task