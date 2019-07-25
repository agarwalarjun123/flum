const Task = require("./task")
const open = require("./amqp_connection")
const connect = require("../db/mongo_connection")

const EventEmitter = require("events").EventEmitter

const newTask = new EventEmitter()





const allocateTask = (taskName,taskOwner,taskDescription,task)=>{

	return new Promise((resolve,reject)=>{

		if(!taskName && !taskDescription && !taskOwner)
			return reject(new Error("task not specified"))
		task = new Task(taskName,taskOwner,taskDescription,task)
		task.onHold()
			.then(id =>{
				setupMQ("task")
					.then((mq)=>{
						const {ch,conn} = mq
						ch.sendToQueue("task",Buffer.from(id.toString()))
						setTimeout(()=>{
							ch.close()
							conn.close()
							newTask.emit("finish",id)
							resolve(id)
						},5000)
					})
					.catch((err)=>reject(err))
			})
			.catch(err => reject(err))

	})
	
}

const setupPublisher = () =>{
	return new Promise((resolve,reject)=>{
		connect()
			.then(()=>{
				setupMQ("job")
					.then(mq =>{
						const {ch} = mq
						ch.consume("job",(msg)=>{

							if(msg){
								allocateTask(JSON.parse(msg.content.toString()))
									.then(resolve)
									.catch(reject)
							}	

						},{
							noAck:true
						})

					})
					.catch((err)=>reject(err))
				

			})
		
	})			
}
const setupMQ = (queue) =>{
	return new Promise((resolve,reject)=>{
		open
			.then((conn)=>{
				conn.createChannel()
					.then((ch)=>{
						ch.assertQueue(queue)
						resolve({ch,conn})
					})
					.catch((err)=>reject(err))
			})
			.catch((err)=>reject(err))
	})
}




module.exports = {
	allocateTask,
	setupPublisher
}