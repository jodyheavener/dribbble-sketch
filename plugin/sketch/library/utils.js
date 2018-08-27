const _global = require('../../library/utils')
const { isWebviewPresent, sendToWebview } = require('sketch-module-web-view/remote')

/**
 * Send message to Web View
 */
const sendMessage = function(action, values={}) {
  const id = _global.config.browserIdentifier
  const obj = { action: action, values: values }

  if (isWebviewPresent(id)) {
    sendToWebview(id, `receiveMessage('${JSON.stringify(obj)}')`)
  }
}

/**
 * Receive message from Web View
 */
let pluginActions = {}
const receiveMessage = function(obj) {
  const action = obj.action
  const values = obj.values

  if (action != null && pluginActions[action] != null) {
    pluginActions[action](values)
  }
}

module.exports = Object.assign(_global, {
  sendMessage,
  pluginActions,
  receiveMessage,
})