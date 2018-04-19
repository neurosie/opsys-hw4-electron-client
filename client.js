const net = require('net')
const dgram = require('dgram')

class Client {
	constructor() {
		this.sock, this.protocol, this.ip_address, this.port
		this.handlers = []
	}
	
	setup(protocol) {
		this.protocol = protocol
		if (protocol == 'TCP') {
			this.sock = new net.Socket()
			this.sock.setEncoding('utf8')
		} else if (protocol == 'UDP') {
			this.sock = dgram.createSocket('udp4')
		}
	}
	
	connect(port, ip_address, callback) {
		if (this.protocol == 'TCP') {
			this.sock.connect(port, ip_address, callback)
		} else if (this.protocol == 'UDP') {
			this.port = port
			this.ip_address = ip_address
			callback()
		}
	}
	
	destroy() {
		if (this.sock == null) return
		if (this.protocol == 'TCP') {
			this.sock.destroy()
		} else if (this.protocol == 'UDP') {
			this.sock.close()
		}
		this.sock = null
	}
	
	passListenerToFn(event, handler, fn) {
		let newHandler
		if (this.protocol == 'UDP' && event == 'data') {
			event = 'message'
			if (!(handler.hasOwnProperty('clientHandlerIndex'))) {
				this.handlers.push((buffer, ...args) => {
					handler(buffer.toString(), ...args)
				})
				handler.clientHandlerIndex = this.handlers.length - 1
			}
			newHandler = this.handlers[handler.clientHandlerIndex]
		} else {
			newHandler = handler
		}
		this.sock[fn](event, newHandler)
	}
	
	on(event, handler) {
		this.passListenerToFn(event, handler, 'on')
	}
	
	prependOnceListener(event, handler) {
		this.passListenerToFn(event, handler, 'prependOnceListener')
	}
	
	removeListener(event, handler) {
		this.passListenerToFn(event, handler, 'removeListener')
	}
	
	write(message) {
		if (this.protocol == 'TCP') {
			this.sock.write(message)
		} else if (this.protocol == 'UDP') {
			this.sock.send(message, this.port, this.address)
		}
	}
}

module.exports = Client