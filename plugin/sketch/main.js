const BrowserWindow = require('sketch-module-web-view')
const _ = require('./library/utils')

module.exports = function(context) {
  let browser = new BrowserWindow({
    identifier: _.config.browserIdentifier,
    width: 600,
    height: 350,
    movable: true,
    resizable: false,
    alwaysOnTop: false,
    backgroundColor: '#f4f4f4',
    title: 'Share to Dribbble',
    // titleBarStyle: 'hidden',
    frame: false,
  })

  _.pluginActions.closeBrowser = function() {
    browser.close()
  }

  _.pluginActions.setBrowserSize = function({ width, height, animated=false }={}) {
    const current = browser.getSize()
    browser.setSize(width || current[0], height || current[1], animated)
  }

  _.pluginActions.requestContext = function() {
    const selectionSize = context.selection.count()
    let selectedComponent

    if (selectionSize > 0) {
      selectedComponent = _.sketch.fromNative(context.selection[0])
    }

    _.sendMessage('receiveContext', {
      authToken: _.Settings.settingForKey('auth-token'),
      selectionSize: selectionSize,
      selection: selectedComponent != null
        ? selectedComponent.toJSON()
        : undefined
    })
  }

  browser.on('closed', () => { browser = null })
  browser.webContents.on('pluginMessage', _.receiveMessage)

  const view = require('../web/main.html')
  browser.loadURL(view)
}
