const { remote, ipcRenderer } = require('electron')

const sock = remote.getGlobal('sock')

function scrollChat() {
	$('#chat-list').scrollTop($('#chat-list').scrollHeight)
}

function handleData(data) {
	console.log(data)
	switch (data.split(" ")[0]) {
		case "ERROR":
			alert(data)
			break
		case "FROM":
			let from = data.split(" ")[1]
			let message = data.split(" ").slice(3).join(" ")
			$('#list-' + from).append(`
				<div class="message-bubble message-bubble-left">${message}</div>
			`)
			scrollChat()
			if (!$('#label-' + from).hasClass('active')) {
				let badge = $('#label-' + from + ' .badge')
				badge.html(parseInt(badge.html()) + 1)
				badge.prop('hidden', false)
			}
			break
		default:
			break
	}
}


function refreshUsers() {
	sock.prependOnceListener('data', (data) => {
		console.log(data)
		users = data.split('\n').slice(1, -1)
		
		existingUsers = [remote.getGlobal('username')]
		$('#user-list').children().filter((ind, el) => {
			let username = $(el).attr('id').substr(6)
			if (!users.includes(username)) {
				$('#list-'+username).remove()
				return true
			}
			existingUsers.append(username)
			return false
		}).remove()
		console.log(remote.getGlobal('username'))
		for (i = 0; i < users.length; ++i) {
			if (!existingUsers.includes(users[i])) {
				$('#user-list').append(`
					<a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" id="label-${users[i]}" data-toggle="list" href="#list-${users[i]}" role="tab">
					${users[i]}
					<span class="badge badge-primary badge-pill" hidden>0</span>
					</a>
				`)
				
				$('#chat-list').append(`
					<div class="tab-pane" id="list-${users[i]}" role="tabpanel"></div>
				`)
			}
		}
	})
	sock.write('WHO\n')
	
}

function sendMessage(event) {
	event.preventDefault()
	let message = $('.message-compose').val()
	$('.message-compose').val('')
	
	$('#chat-list .active').append(`
		<div class="message-bubble message-bubble-right">${message}</div>
	`)
	scrollChat()
	message += '\n'
	sock.write(`SEND ${$('#chat-list .active').attr('id').substr(5)} ${message.length} ${message}`)
}

function broadcastMessage(event) {
	event.preventDefault()
	let message = $('.message-compose').val()
	$('.message-compose').val('')
	
	$('#chat-list .tab-pane').append(`
		<div class="message-bubble message-bubble-right">${message}</div>
	`)
	scrollChat()
	message += '\n'
	sock.write(`BROADCAST ${message.length} ${message}`)
}

function switchTab() {
	console.log('tab')
	$('.list-group-item-action.active .badge').prop('hidden', true).html('0')
	scrollChat()
}

$(() => {
	// Setup handlers
	sock.on('data', handleData)
	$('.message-form').submit(sendMessage)
	$('#user-list').on('shown.bs.tab', switchTab)
	$('#user-refresh').click(refreshUsers)
	$('.broadcast').click(broadcastMessage)
	refreshUsers()
	
})