const {receiveQueue} = require("./queue_function")

const setupQueue = ()=>{
	console.log(`starting worker ${process.argv[2]} `)
	receiveQueue(process.argv[2])        
}

setupQueue()