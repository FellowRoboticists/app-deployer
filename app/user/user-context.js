'use strict'

module.exports = (function () {
  const bcrypt = require('bcrypt')
  const sqlSVC = require('../sql/sql-service')

  const getUsers = () => {
    return sqlSVC.selectUsers()
  }

  const _cryptPassword = (clearPassword) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(clearPassword, 10, (err, encryptedPassword) => {
        if (err) return reject(err)
        resolve(encryptedPassword)
      })
    })
  }

  const createUser = (userParams) => {
    return sqlSVC.selectUserByEmail(userParams.email)
      .then((user) => {
        if (user) throw new Error(`User with email '${userParams.email}' already exists.`)
        return _cryptPassword(userParams.password)
          .then((encryptedPassword) => sqlSVC.insertUser(userParams, encryptedPassword))
      })
      .then(() => sqlSVC.selectLatestUser())
  }

  const updateUser = (user, userParams) => {
    return sqlSVC.updateUser(user.id, userParams)
      .then(() => sqlSVC.selectUserById(user.id))
  }

  const deleteUser = (user) => {
    return sqlSVC.deleteUser(user.id)
      .then(() => user)
  }

  const _verifyPassword = (password, encryptedPassword) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, encryptedPassword, (err, valid) => {
        if (err) return reject(err)
        if (!valid) return reject(new Error('Invalid credentials'))
        resolve()
      })
    })
  }

  const changeUserPassword = (user, password, newPassword) => {
    return _verifyPassword(password, user.password)
      .then(() => _cryptPassword(newPassword))
      .then((encryptedPassword) => sqlSVC.changeUserPassword(user.id, encryptedPassword))
      .then(() => user)
  }

  var mod = {
    changeUserPassword: changeUserPassword,
    createUser: createUser,
    deleteUser: deleteUser,
    getUsers: getUsers,
    updateUser: updateUser
  }

  return mod
}())
