import test from 'ava'
import auth from '../../app/auth'

import {hashSync} from 'bcryptjs'
import genSalt from '../../app/auth/salt'

test('returns true on correct login', t => {
  let salt = genSalt('admin')
  let hash = hashSync('password', salt)

  auth.login('admin', hash)
    .then(response => {
      t.true(response)
    })
})

test('returns error on wrong password', t => {
  t.throws(auth.login('admin', 'wrong'), 'Wrong password')
})

test('returns error on inexistent user', t => {
  t.throws(auth.login('banana', 'wrong'), 'User doesn\'t exist')
})

test('stays logged in until log out', t => {
  let salt = genSalt('admin')
  let hash = hashSync('password', salt)

  auth.login('admin', hash)
    .then(() => {
      t.true(auth.loggedIn())
      auth.logout(() => {
        t.false(auth.loggedIn())
      })
    })
})
