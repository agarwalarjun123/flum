const Task = require("./task")
const open = require("./amqp_connection")
const connect = require("../db/mongo_connection")

const allocateTask = (taskName,taskOwner,taskDescription,task)=>{

	return new Promise((resolve,reject)=>{


		connect()
			.then(()=>{
				if(!taskName && !taskDescription && !taskOwner)
					return reject(new Error("task not specified"))
				task = new Task(taskName,taskOwner,taskDescription,task)
				task.onHold()
					.then(id =>{
						open
							.then((conn)=>{
								conn.createChannel()
									.then((ch)=>{
										ch.assertQueue("task")
										ch.sendToQueue("task",Buffer.from(id.toString()))
										setTimeout(()=>{
											ch.close()
											conn.close()
											resolve(id)
										},5000)
									})
									.catch((err)=>reject(err))
							})
							.catch((err)=>reject(err))

					})
					.catch(err => reject(err))

			})
			.catch(err => reject(err))
		
	})


}




module.exports = {
	allocateTask
}