'use strict'

module.exports = (function () {
  const bcrypt = require('bcrypt')
  const sqlSVC = require('../sql/sql-service')
  const {promisify} = require('util')

  const bcryptHash = promisify(bcrypt.hash)
  const bcryptCompare = promisify(bcrypt.compare)

  const getUsers = async () => {
    return sqlSVC.selectUsers()
  }

  const _cryptPassword = async (clearPassword) => {
    return bcryptHash(clearPassword, 10)
  }

  const createUser = async (userParams) => {
    let user = await sqlSVC.selectUserByEmail(userParams.email)

    if (user) throw new Error(`User with email '${userParams.email}' already exists.`)

    let encryptedPassword = await _cryptPassword(userParams.password)
    await sqlSVC.insertUser(userParams, encryptedPassword)

    return sqlSVC.selectLatestUser()
  }

  const updateUser = async (user, userParams) => {
    await sqlSVC.updateUser(user.id, userParams)

    return sqlSVC.selectUserById(user.id)
  }

  const deleteUser = async (user) => {
    await sqlSVC.deleteUser(user.id)

    return user
  }

  const _verifyPassword = async (password, encryptedPassword) => {
    let valid = await bcryptCompare(password, encryptedPassword)

    if (!valid) throw new Error('Invalid credentials')
  }

  const changeUserPassword = async (user, password, newPassword) => {
    await _verifyPassword(password, user.password)
    let encryptedPassword = await _cryptPassword(newPassword)
    await sqlSVC.changeUserPassword(user.id, encryptedPassword)

    return user
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
