const rmq_config = require('./configs/rmq.json')
const exec = require('child_process').exec;
let rmq = require('amqplib')

rmq.connect(rmq_config.broker_uri).then(async (conn) => {
	console.log("listening...")
	let ch = await conn.createChannel();
	let q = await ch.assertQueue("gunungapi", { exclusive: false, durable: false })
	ch.consume(q.queue, async (msg) => {
		console.log("getting message.. ");
		console.log(msg.content.toString());
		
		//{"timestamp":1534408271927,"longitude":116.02551637520645,"latitude":-11.67711076225713,"_id":"5b75364f0dfa8131b47fee5c"}
		try{
			let data = JSON.parse(msg.content.toString())
			let message = {id : data._id, status: true, message: "permintaan sedang diproses"}
			message = JSON.stringify(message);
			result = await startTask();
			if(result){
				console.log(result);
			}
			let response = ch.sendToQueue('respon', new Buffer(message));
			if(response){
				console.log("response published")
			}
		}catch(error){
			console.log(error)
		}
	},  { noAck: true })
	.catch( (err) => {console.log("Connected to broker failed ", "retry... "+error) })
})

function startTask(){
	return new Promise(async(resolve, reject)=>{
		try {
			 exec('ping google.com',
				(error, stdout, stderr) => {
					
					if (stdout !== null) {
						console.log("stdout: "+stdout);
						resolve(stdout);
					}
					
					if(stderr !== null) {
						console.log("stderr: "+stderr);
						resolve(stderr)
					}
					
					if (error !== null) {
						console.log("error: "+error);
						resolve(error);
						
					}
										
				});
		} catch (error) {
			reject(error)
		}
	})
}

