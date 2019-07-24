const Task = require("./task")
const open = require("./amqp_connection")
const {taskModel} = require("../db/schema")
const {spawn} = require("child_process")
const connect = require("../db/mongo_connection")



const receiveQueue = ()=>{
	connect()
		.then(() =>{
			open
				.then((conn)=>{
					conn.createChannel()
						.then(ch =>{
							ch.assertQueue("task")
							ch.consume("task",(msg)=>{

								if(msg)
									receiveTask(msg.content.toString())
										.then(e => console.log(e))
										.catch((err)=>console.log(err))
					
							},{
								noAck:false
							})
						})
						.catch((err) => console.log(err))
				})
				.catch(err => console.log(err))
	

		})
		.catch((err)=>{
			console.log(err)
		})

}

const executeTask = (task)=>{
	return new Promise((resolve,reject)=>{

		task = task.split(" ")
    
		const child = spawn(task[0],task.slice(1))
		//child stdout 
		child.stdout.pipe(process.stdout)
		child.on("exit",()=>{
			console.log("process exited")
			resolve()
		})
		child.stderr.pipe(process.stdout)
    
	})

}



const receiveTask = (id) =>{
	return new Promise((resolve,reject)=>{
		taskModel.findOne({_id:id})
			.then(e =>{
				const task = new Task(e.taskName,e.taskOwner,e.taskDescription,e.task)
				task.start(id)
					.then(()=>{
						executeTask(task.task)
							.then(()=>{
								task.finish(id)
									.then(() => resolve(`task with id ${e._id} is completed`))
									.catch(err => reject(err))
							})  
							.catch(err => reject(err))
					})

			})
			.catch(err => reject(err))

	})
}

module.exports = {
	receiveQueue
}