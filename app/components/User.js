import React, {Component} from 'react'
import {connect} from 'react-redux'

class User extends Component {
  render() {
    return (
      <div>
        <section className='text-section'>
          <h1>Welcome, User</h1>
          <p>The feature flag indicated that you've logged in as a user.</p>
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

export default connect(select)(User)