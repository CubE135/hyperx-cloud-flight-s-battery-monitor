const { app, BrowserWindow, Menu, Tray } = require('electron')
const path = require('path')
const Store = require('electron-store');
const HyperX = require('./assets/js/classes/HyperX.js')

const store = new Store();

if (require('electron-squirrel-startup')) {
  app.quit()
}

let tray = null
let icons = []
const createTray = () => {
  icons['no_connection'] = path.join(__dirname, 'assets/img/no_connection.ico')
  icons['full'] = path.join(__dirname, 'assets/img/full.ico')
  icons['half'] = path.join(__dirname, 'assets/img/half.ico')
  icons['low'] = path.join(__dirname, 'assets/img/low.ico')
  icons['high'] = path.join(__dirname, 'assets/img/high.ico')
  icons['empty'] = path.join(__dirname, 'assets/img/empty.ico')
  tray = new Tray(icons['no_connection'])
  tray.setToolTip('Device not connected...')

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quit', type: 'normal', click: () => {
      hyperX.stop()
      app.quit()
    }}
  ])
  tray.setContextMenu(contextMenu)

  initConfig()
  run()
}

let hyperX = null
function run() {
  let updateDelay = store.get('updateDelay')
  hyperX = new HyperX(tray, icons, updateDelay)
  hyperX.runStatusUpdaterInterval()
  hyperX.runListener()
}

function initConfig() {
  if (store.get('updateDelay') === undefined) {
    store.set('updateDelay', 15);
  }
}

app.on('ready', createTray)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    hyperX.stop()
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
