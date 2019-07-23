const amqp = require("amqplib")    
const open = amqp.connect(process.env.AMQP_URL || "amqp://localhost:5672")

module.exports = open
