import React, {Component} from 'react'
import {connect} from 'react-redux'
import auth from '../auth/index'
import Admin from './Admin'
import Anonymous from './Anonymous'
import User from './User'

class Home extends Component {
  render () {
    switch(this.props.data.flag) {
      case 2: 
        return(<Admin />)
      case 1: 
        return(<User />)
      case 0:
      default: 
        return(<Anonymous />)
    }
  }
}

function select (state) {
  return {
    data: state
  }
}

export default connect(select)(Home)
