import React, {Component} from 'react'
import {connect} from 'react-redux'

class Admin extends Component {
  render() {
    return (
      <div>
        <section className='text-section'>
          <h1>Welcome, Admin</h1>
          <p>You've logged in as an admin and the admin page is enabled.</p>
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

export default connect(select)(Admin)