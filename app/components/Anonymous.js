import React, {Component} from 'react'
import {connect} from 'react-redux'

class Anonymous extends Component {
  render() {
    return (
      <div>
        <section className='text-section'>
          <h1>Welcome to Feature Flow!</h1>
          <p>This application demonstrates what a React-based register/login workflow might look like with <a href='https://launchdarkly.com'>feature flags</a>.</p>

          <p>It's based on Juan Soto's <a href='https://github.com/sotojuan/saga-login-flow'>saga-login-flow</a>.</p>

          <p>Try logging in with username <code>admin</code> and password <code>password</code>, then try to register new users. They'll be saved in local storage so they'll persist across page reloads.</p>
        </section>

        <section className='text-section'>
          <h2>Feature Flags</h2>
          <p>Feature flags are served using LaunchDarkly. The homepage will display content depending on the value returned by our feature flag.</p>
        </section>

        <section className='text-section'>
          <h2>Authentication</h2>
          <p>Authentication happens in <code>app/auth/index.js</code>, using <code>fakeRequest.js</code> and <code>fakeServer.js</code>. <code>fakeRequest</code> is a fake <code>XMLHttpRequest</code> wrapper. <code>fakeServer</code> responds to the fake HTTP requests and pretends to be a real server, storing the current users in local storage with the passwords encrypted using <code>bcrypt</code>.</p>
        </section>
      </div>
    )
  }
}

function select (state) {
  return {
    data: state
  }
}

export default connect(select)(Anonymous)