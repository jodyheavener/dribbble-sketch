const React = require('react')
const _ = require('../../library/utils')

module.exports = class Actions extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      status: 'login',
      sessionID: _.randomString()
    }
  }

  messages(status) {
    return ({
      login: 'To share your work from Sketch, please log in.',
      error: 'Something went wrong. Want to try again?',
      timeout: 'Sorry, that took too long to complete. Try again?',
      success: 'You’re all set! Re-open this dialog to start sharing.'
    })[status]
  }

  dismissDialog() {
    _.sendMessage('closeBrowser')
  }

  launchLogin() {
    const authUrl = `${_.config.siteUrl}/auth/plugin?state=${_.config.platformIdentifier}-${this.state.sessionId}`
    // uxp.shell.openExternal(authUrl)

    this.setState({ status: 'loading' })

    _.pollRequest({
      method: 'POST',
      url: `${_.config.siteUrl}/auth/plugin/check`,
      params: {
        code: this.state.sessionId,
        provider: _.config.platformIdentifier
      }
    }).then((request) => {
      if (request.status === 200) {
        var result = JSON.parse(request.responseText)

        _.settings.access().then((settings) => {
          settings.set('authToken', result.token)
        })

        this.setState({ status: 'success' })
      } else {
        console.log(`Error logging in: ${request.status}`)
        this.setState({ status: 'error' })
      }
    }).catch((response) => {
      let message = ''

      if (response.state === 'quit') {
        this.setState({ status: 'timeout' })
      } else if (response.state === 'error') {
        console.log(`Error logging in: ${response.error}`)
        this.setState({ status: 'loading' })
      }
    })
  }

  render() {
    if (this.state.status === 'loading') {
      return (
        <div id="login-footer">
          <div className="loading-outer" title="Please visit the page opened in your browser.">
            <div className="loading-inner">
              <img src="../web/images/processing.gif" />
              <span>Waiting...</span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div id="login-footer">
        <p className="message">{this.messages(this.state.status)}</p>

        <footer className="container">
          <div className="spacer"></div>
          { this.state.status === 'success' ? (
            <button onClick={this.dismissDialog.bind(this)} className="cta">Okay</button>
          ) : (
            <div className="button-group">
              <button onClick={this.dismissDialog.bind(this)} className="adtl">Cancel</button>
              <button onClick={this.launchLogin.bind(this)} className="cta">Log in to Dribbble</button>
            </div>
          ) }
          <div className="spacer"></div>
        </footer>
      </div>
    )
  }
}