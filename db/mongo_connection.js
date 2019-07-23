const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/flum",{useNewUrlParser:true})


//mongoose connection event handler
mongoose.connection.once("connection",()=>{
	console.log("connected to db")
})
//mongoose connection  error handler
mongoose.connection.once("error",(err)=>{
	console.log("error connecting to the db")
})
