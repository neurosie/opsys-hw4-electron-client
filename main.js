const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const net = require('net')
const Client = require('./client')

let mainWindow, loginWindow
global.sock = new Client()
global.username = ''


function loginPrompt() {
	loginWindow = new BrowserWindow({width: 400, height: 300})
	loginWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'login.html'),
		protocol: 'file:',
		slashes: true
	}))
	
	loginWindow.on('closed', () => {loginWindow = null})
}

function createMainWindow(e, username) {
	global.username = username
	mainWindow = new BrowserWindow({width: 800, height: 600});
	
	loginWindow.close()
	
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}))
	
	mainWindow.on('closed', () => {
		mainWindow = null
	})
	
	
}

app.on('ready', loginPrompt)

ipcMain.on('login', createMainWindow)


app.on('quit', () => {
	sock.destroy()
})