const Task = require("./task")
const open = require("./amqp_connection")
const connect = require("../db/mongo_connection")
const fs = require("fs")
const yaml = require("js-yaml")

const allocateTask = (taskName,taskOwner,taskDescription,task)=>{

	return new Promise((resolve,reject)=>{

		if(!taskName && !taskDescription && !taskOwner)
			return reject(new Error("task not specified"))
		task = new Task(taskName,taskOwner,taskDescription,task)
		task.onHold()
			.then(id =>{
				setupMQ("task")
					.then((mq)=>{
						const {ch} = mq
						ch.sendToQueue("task",Buffer.from(id.toString()))
						setTimeout(()=>{
							ch.close()
							resolve(id)
						},5000)
					})
					.catch((err)=>reject(err))
			})
			.catch(err => reject(err))

	})
	
}

const submitJob = (task) =>{
	return new Promise((resolve,reject)=>{
		setupMQ("job")
			.then((mq)=>{
				const {ch,conn} = mq
				ch.sendToQueue("job",Buffer.from(JSON.stringify(task)))
				setTimeout(()=>{
					ch.close()
					conn.close()
					resolve()
				},5000)
			})
			.catch((err)=>reject(err))
	})
}


const submitTask = async () =>{

	let config ={}
	
	if(fs.existsSync("./.flum.json"))
		config = JSON.parse(fs.readFileSync("./.flum.json","utf8"))
	else if(fs.existsSync("./.flum.yaml"))
		config = yaml.safeLoad(fs.readFileSync("./.flum.yaml","utf8"))  
	if(config.tasks){
		for(let i=0;i<config.tasks.length;i++)
			await submitJob(config.tasks[i])
		return ("tasks Published")	
	}
	else 
		throw(new Error("Key tasks not provided"))
}

const setupPublisher = () =>{
	return new Promise((resolve,reject)=>{
		connect()
			.then(()=>{
				setupMQ("job")
					.then(mq =>{
						const {ch} = mq
						console.log("Waiting for jobs...")
						ch.consume("job",(msg)=>{

							if(msg){
								const {taskName,taskOwner,taskDescription,task} = JSON.parse(msg.content.toString())
								allocateTask(taskName,taskOwner,taskDescription,task)
									.then(console.log)
									.catch(console.log)
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
	setupPublisher,
	setupMQ,
	submitTask
}