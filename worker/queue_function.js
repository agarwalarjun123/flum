const Task = require("../publisher/task")
const open = require("./amqp_connection")
const {taskModel} = require("../db/schema")
const {spawn} = require("child_process")
const connect = require("../db/mongo_connection")



const receiveQueue = (worker)=>{
	return new Promise((resolve,reject)=>{
		
		connect()
			.then(() =>{
				setupMQ("task")
					.then((mq)=>{
						const {ch} = mq
						console.log("listening for tasks")
						ch.consume("task",(msg)=>{
							console.log(msg)
							if(msg)
								receiveTask(msg.content.toString(),worker)
									.then(e => console.log(e))
									.catch((err)=>console.log(err))
		
						},{
							noAck:true
						})
					})
					.catch((err)=>reject(err))
			
				

			})
			.catch((err)=>{
				reject(err)
			})

	})
	
}

const executeTask = (task,path)=>{
	console.log(path)
	return new Promise((resolve)=>{

		task = task.split(" ")
    
		const child = spawn(task[0],task.slice(1)
			,{
				cwd:path
			})
		//child stdout 
		child.stdout.pipe(process.stdout)
		child.on("exit",()=>{
			console.log("process exited")
			resolve()
		})
		child.stderr.pipe(process.stdout)
    
	})

}



const receiveTask = (id,worker) =>{
	return new Promise((resolve,reject)=>{
		taskModel.findOne({_id:id})
			.then(e =>{
				const task = new Task(e.taskName,e.taskOwner,e.taskDescription,e.task,e.path)
				task.start(id,worker)
					.then(()=>{
						executeTask(task.task,task.path)
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
	receiveQueue
}