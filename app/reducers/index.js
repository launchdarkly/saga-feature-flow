/*
 * The reducer takes care of state changes in our app through actions
 */

import {
  CHANGE_FORM,
  SET_AUTH,
  SENDING_REQUEST,
  REQUEST_ERROR,
  CLEAR_ERROR,
  LD_INIT,
  LD_REFRESH_HEADER
} from '../actions/constants'
import auth from '../auth'


// The initial application state
let initialState = {
  formState: {
    username: '',
    password: ''
  },
  error: '',
  currentlySending: false
}

// Takes care of changing the application state
function reducer (state = initialState, action) {
  switch (action.type) {
    case LD_REFRESH_HEADER:
      return {...state, flag: action.flag, headerColor: action.headerColor}
    case LD_INIT:
      return {...state, ld: action.ld, flag: action.flag, headerColor: action.headerColor}
    case CHANGE_FORM:
      return {...state, formState: action.newFormState}
    case SET_AUTH:
      return {...state, loggedIn: action.newAuthState}
    case SENDING_REQUEST:
      return {...state, currentlySending: action.sending, flag: action.flag, headerColor: action.headerColor}
    case REQUEST_ERROR:
      return {...state, error: action.error}
    case CLEAR_ERROR:
      return {...state, error: ''}
    default:
      return state
  }
}

export default reducer
