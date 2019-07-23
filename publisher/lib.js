const {taskModel} = require('./db/schema')
require('./db/mongo_connection')
const TaskList = () =>{
    return new Promise((resolve,reject)=>{
        taskModel.find({})
        .then(resolve)
        .catch(reject)
    })
    
}

module.exports ={
    TaskList
}