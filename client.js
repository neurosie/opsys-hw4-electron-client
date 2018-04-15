let net = require('net');

class Client {
	Client () {
		this.sock = new net.Socket()
	}
	setup(ip_address, port, callback) {
		this.sock.connect(port, ip_address, callback)
	}
}


client.connect(parseInt(process.argv[2]), 'localhost', () => {
	console.log('Connected');
});