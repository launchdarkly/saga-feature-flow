// This file contains the sagas used for async actions in our app. It's divided into
// "effects" that the sagas call (`authorize` and `logout`) and the actual sagas themselves,
// which listen for actions.

// Sagas help us gather all our side effects (network requests in this case) in one place

import {hashSync} from 'bcryptjs'
import genSalt from '../auth/salt'
import {browserHistory} from 'react-router'
import {takeEvery, take, call, put, fork, race} from 'redux-saga/effects'
import auth from '../auth'
import client from '../auth'
import Promise from 'bluebird'
import ldClient from 'ldclient-js'

import {
  SENDING_REQUEST,
  LOGIN_REQUEST,
  REGISTER_REQUEST,
  SET_AUTH,
  LOGOUT,
  CHANGE_FORM,
  REQUEST_ERROR,
  LD_INIT_REQUEST,
  LD_INIT,
  LD_FLAG_REQUEST,
  LD_REFRESH_HEADER
} from '../actions/constants'

var ld

export function * watchFlagUpdate () {
  while (true) {
    yield take(LD_FLAG_REQUEST)
    let flags = ld.allFlags()  
    yield put({type:LD_REFRESH_HEADER, flag: flags['user-type'], headerColor: flags['header-bar-color']})
  }
}

function idLD (user) {
  var ldPromise = Promise.promisify(ld.identify)
  return ldPromise(user, null).then(function () {
    return ld.allFlags()
  })
}

function getLD () {
  var ldPromise = Promise.promisify(ld.on)
  return ldPromise('ready').then(function () {
    return ld.allFlags()
  })
}

/**
 * Effect to handle LaunchDarkly client initialization
 */
export function * initLD () {
  let user = {key:Math.random().toString(36).substring(7), anonymous:true}
  ld = ldClient.initialize('YOUR-ENVIRONMENT-ID', user)
  let flags = yield call(getLD, user)
  yield put({type: LD_INIT, ld: ld, flag: flags['user-type'], headerColor: flags['header-bar-color']})
}

/**
 * LaunchDarkly client initialization saga
 */
export function * watchInitLD () {
  yield takeEvery(LD_INIT_REQUEST, initLD)
}

/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 * @param  {object} options                Options
 * @param  {boolean} options.isRegistering Is this a register request?
 */
export function * authorize ({username, password, isRegistering}) {
  // We send an action that tells Redux we're sending a request
  yield put({type: SENDING_REQUEST, sending: true})
  let flag
  // We then try to register or log in the user, depending on the request
  try {
    let salt = genSalt(username)
    let hash = hashSync(password, salt)
    let response
    // For either log in or registering, we call the proper function in the `auth`
    // module, which is asynchronous. Because we're using generators, we can work
    // as if it's synchronous because we pause execution until the call is done
    // with `yield`!
    if (isRegistering) {
      response = yield call(auth.register, username, hash)
    } else {
      response = yield call(auth.login, username, hash)
    }

    return response
  } catch (error) {
    // If we get an error we send Redux the appropiate action and return
    yield put({type: REQUEST_ERROR, error: error.message})
    return false
  } finally {
    // When done, we tell Redux we're not in the middle of a request any more and
    // update the feature flag
    let user = {key: auth.getToken(), custom: {groups:auth.getGroup()}, anonymous:false}
    let flags = yield call(idLD, user)
    console.log(flags['header-bar-color'])
    yield put({type: SENDING_REQUEST, sending: false, flag: flags['user-type'], headerColor: flags['header-bar-color']})
  }
}

/**
 * Effect to handle logging out
 */
export function * logout () {
  // We tell Redux we're in the middle of a request
  yield put({type: SENDING_REQUEST, sending: true})

  // Similar to above, we try to log out by calling the `logout` function in the
  // `auth` module. If we get an error, we send an appropiate action. If we don't,
  // we return the response.
  try {
    let response = yield call(auth.logout)
    let user = {key:Math.random().toString(36).substring(7), anonymous:true}
    let flags = yield call(idLD, user)
    yield put({type: SENDING_REQUEST, sending: false, flag: flags['user-type'], headerColor: flags['header-bar-color']})

    return response
  } catch (error) {
    yield put({type: REQUEST_ERROR, error: error.message})
  }
}

/**
 * Log in saga
 */
export function * loginFlow () {
  // Because sagas are generators, doing `while (true)` doesn't block our program
  // Basically here we say "this saga is always listening for actions"
  while (true) {
    // And we're listening for `LOGIN_REQUEST` actions and destructuring its payload
    let request = yield take(LOGIN_REQUEST)
    let {username, password} = request.data

    // A `LOGOUT` action may happen while the `authorize` effect is going on, which may
    // lead to a race condition. This is unlikely, but just in case, we call `race` which
    // returns the "winner", i.e. the one that finished first
    let winner = yield race({
      auth: call(authorize, {username, password, isRegistering: false}),
      logout: take(LOGOUT)
    })

    // If `authorize` was the winner...
    if (winner.auth) {
      // ...we send Redux appropiate actions
      yield put({type: SET_AUTH, newAuthState: true}) // User is logged in (authorized)
      yield put({type: CHANGE_FORM, newFormState: {username: '', password: ''}}) // Clear form
      forwardTo('/') // Go to home page
      // If `logout` won...
    } else if (winner.logout) {
      // ...we send Redux appropiate action
      yield put({type: SET_AUTH, newAuthState: false}) // User is not logged in (not authorized)
      yield call(logout) // Call `logout` effect
      forwardTo('/') // Go to home page
    }
  }
}

/**
 * Log out saga
 * This is basically the same as the `if (winner.logout)` of above, just written
 * as a saga that is always listening to `LOGOUT` actions
 */
export function * logoutFlow () {
  while (true) {
    yield take(LOGOUT)
    yield put({type: SET_AUTH, newAuthState: false})

    yield call(logout)
    forwardTo('/')
  }
}

/**
 * Register saga
 * Very similar to log in saga!
 */
export function * registerFlow () {
  while (true) {
    // We always listen to `REGISTER_REQUEST` actions
    let request = yield take(REGISTER_REQUEST)
    let {username, password} = request.data

    // We call the `authorize` task with the data, telling it that we are registering a user
    // This returns `true` if the registering was successful, `false` if not
    let wasSuccessful = yield call(authorize, {username, password, isRegistering: true})

    // If we could register a user, we send the appropiate actions
    if (wasSuccessful) {
      yield put({type: SET_AUTH, newAuthState: true}) // User is logged in (authorized) after being registered
      yield put({type: CHANGE_FORM, newFormState: {username: '', password: ''}}) // Clear form
      forwardTo('/') // Go to home page
    }
  }
}

// The root saga is what we actually send to Redux's middleware. In here we fork
// each saga so that they are all "active" and listening.
// Sagas are fired once at the start of an app and can be thought of as processes running
// in the background, watching actions dispatched to the store.
export default function * root () {
  yield fork(watchInitLD)
  yield fork(watchFlagUpdate)
  yield fork(loginFlow)
  yield fork(logoutFlow)
  yield fork(registerFlow)
}

// Little helper function to abstract going to different pages
function forwardTo (location) {
  browserHistory.push(location)
}
