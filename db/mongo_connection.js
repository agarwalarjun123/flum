const mongoose = require("mongoose")

const connect = () =>{

	return new Promise((resolve,reject)=>{

		mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/flum",{useNewUrlParser:true, useFindAndModify: false})
		//mongoose connection event handler
		mongoose.connection.once("connected",()=>{
			console.log("connected to db")
			resolve()
		})
		//mongoose connection  error handler
		mongoose.connection.on("error",()=>{
			console.log("error connecting to the db")
			reject()
		})

	})
	

}
module.exports = connect
