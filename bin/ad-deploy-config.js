#!/usr/bin/env node
'use strict'

const Blessed = require('blessed')
const program = require('commander')
const fs = require('fs')

program
  .version('0.0.1')
  .option('-a, --abaqis', 'Set up for the abaqis application')
  .option('-e, --ese', 'Set up for the ese application')
  .option('-r, --rqi', 'Set up for the rqi application')
  .parse(process.argv)

class RoleList {
  constructor (appScreen) {
    this._appScreen = appScreen
    this._roleList = this._window(appScreen.getScreen())
    this._roleList.on('blur', () => this._adjustBorder('bg'))
    this._roleList.on('focus', () => this._adjustBorder('line'))
    this._roleList.key(['right', 'tab'], () => this._appScreen.focusOnFirstFormField())
    this._roleList.key(['up', 'down'], () => this._appScreen.updateForm())
  }

  _window (screen) {
    return Blessed.list({
      parent: screen,
      width: 15,
      height: 7,
      top: 1,
      items: this._appScreen.getRoles(),
      keys: [ 'up', 'down' ],
      border: {
        type: 'line'
      },
      style: {
        selected: {
          inverse: true
        }
      }
    })
  }

  _adjustBorder (borderType) {
    this._roleList.border.type = borderType
    this._appScreen.render()
  }

  getSelectedIndex () {
    return this._roleList.selected
  }

  focus () {
    this._roleList.focus()
  }
}

class CheckBox {
  constructor (form, name, label, left, top) {
    this._form = form
    this._checkbox = this._window(form.getForm(), name, label, left, top)
  }

  _window (form, name, label, left, top) {
    return Blessed.checkbox({
      parent: form,
      name: name,
      label: label,
      top: top,
      left: left
    })
  }

  check (checked) {
    checked ? this._checkbox.check() : this._checkbox.uncheck()
  }
}

class FormButton {
  constructor (form, label, left, top, pressHandler) {
    this._form = form
    this._button = this._window(form.getForm(), label, left, top)
    this._button.on('focus', () => this._setBorderType('line'))
    this._button.on('blur', () => this._setBorderType('bg'))
    this._button.on('press', pressHandler)
  }

  _window (form, label, left, top) {
    return Blessed.button({
      parent: form,
      left: left,
      top: top,
      height: 3,
      width: label.length + 2,
      content: label,
      border: {
      },
      style: {
        focus: {
          underline: true
        }
      }
    })
  }

  _setBorderType (borderType) {
    this._button.border.type = borderType
    this._form.getAppScreen().render()
  }
}

class InputTextField {
  constructor (form, name, label, top) {
    this._form = form
    this._name = name
    this._label = this._label(form.getForm(), label, top)
    this._textBox = this._textBox(form.getForm(), name, label.length + 1, top)
  }

  _label (form, label, top) {
    return Blessed.text({
      parent: form,
      top: top,
      content: label
    })
  }

  _textBox (form, name, left, top) {
    return Blessed.textbox({
      parent: form,
      name: name,
      inputOnFocus: true,
      left: left,
      top: top
    })
  }

  focus () {
    this._textBox.focus()
  }

  setContent (data) {
    this._textBox.setValue(data)
  }
}

class RoleForm {
  constructor (appScreen) {
    this._appScreen = appScreen
    this._roleForm = this._window(appScreen.getScreen())
    // Create all the fields we need
    let top = 0
    this._rpm1Field = new InputTextField(this, 'rpm1name', 'RPM 1 Name:', top++)
    this._rpm2Field = new InputTextField(this, 'rpm2name', 'RPM 2 Name:', top++)
    this._preMigrationScript1Field = new InputTextField(this, 'preMigrationScript1', 'PreMigration Script 1:', top++)
    this._preMigrationScript2Field = new InputTextField(this, 'preMigrationScript2', 'PreMigration Script 2:', top++)
    this._preMigrationScript3Field = new InputTextField(this, 'preMigrationScript3', 'PreMigration Script 3:', top++)
    this._preMigrationScript4Field = new InputTextField(this, 'preMigrationScript4', 'PreMigration Script 4:', top++)
    this._preMigrationScript5Field = new InputTextField(this, 'preMigrationScript5', 'PreMigration Script 5:', top++)
    this._seedDataLoad = new CheckBox(this, 'seedDataLoad', '] Seed Data Load', 0, top++)
    this._schemaMigration = new CheckBox(this, 'schemaMigration', '] Schema Migration:', 0, top++)
    this._postMigrationScript1Field = new InputTextField(this, 'postMigrationScript1', 'PostMigration Script 1:', top++)
    this._postMigrationScript2Field = new InputTextField(this, 'postMigrationScript2', 'PostMigration Script 2:', top++)
    this._postMigrationScript3Field = new InputTextField(this, 'postMigrationScript3', 'PostMigration Script 3:', top++)
    this._postMigrationScript4Field = new InputTextField(this, 'postMigrationScript4', 'PostMigration Script 4:', top++)
    this._postMigrationScript5Field = new InputTextField(this, 'postMigrationScript5', 'PostMigration Script 5:', top++)
    this._submitButton = new FormButton(this, 'Submit', 42, top, () => { this._submitHandler() })
    this._cancelButton = new FormButton(this, 'Cancel', 50, top, () => { this._cancelHandler() })
    this._roleForm.on('submit', (data) => this._submit(data))
  }

  _window (screen) {
    return Blessed.form({
      parent: screen,
      left: 18,
      top: 1,
      width: 60,
      height: 19,
      keys: true,
      border: {
        type: 'line'
      }
    })
  }

  _submitHandler () {
    this._roleForm.submit()
  }

  _cancelHandler () {
    logMessage('cancelling form')
    this._appScreen.updateForm()
    this._appScreen.focusToRoleList()
    this._appScreen.render()
  }

  _submit (data) {
    logMessage('submitting form')
    this._appScreen.updateConfigDataForSelectedRole(data)
    this._appScreen.focusToRoleList()
  }

  getForm () {
    return this._roleForm
  }

  updateForm (roleData) {
    this._rpm1Field.setContent(roleData.rpm1name || '')
    this._rpm2Field.setContent(roleData.rpm2name || '')
    this._preMigrationScript1Field.setContent(roleData.preMigrationScript1 || '')
    this._preMigrationScript2Field.setContent(roleData.preMigrationScript2 || '')
    this._preMigrationScript3Field.setContent(roleData.preMigrationScript3 || '')
    this._preMigrationScript4Field.setContent(roleData.preMigrationScript4 || '')
    this._preMigrationScript5Field.setContent(roleData.preMigrationScript5 || '')
    this._seedDataLoad.check(roleData.seedDataLoad)
    this._schemaMigration.check(roleData.schemaMigration)
    this._postMigrationScript1Field.setContent(roleData.postMigrationScript1 || '')
    this._postMigrationScript2Field.setContent(roleData.postMigrationScript2 || '')
    this._postMigrationScript3Field.setContent(roleData.postMigrationScript3 || '')
    this._postMigrationScript4Field.setContent(roleData.postMigrationScript4 || '')
    this._postMigrationScript5Field.setContent(roleData.postMigrationScript5 || '')
    this._appScreen.render()
  }

  focusOnFirstField () {
    this._rpm1Field.focus()
  }

  getAppScreen () {
    return this._appScreen
  }
}

const ADRoleData = {
  rpm1name: null,
  rpm2name: null,
  preMigrationScript1: null,
  preMigrationScript2: null,
  preMigrationScript3: null,
  preMigrationScript4: null,
  preMigrationScript5: null,
  seedDataLoad: false,
  schemaMigration: false,
  postMigrationScript1: null,
  postMigrationScript2: null,
  postMigrationScript3: null,
  postMigrationScript4: null,
  postMigrationScript5: null
}

class ADConfigData {
  constructor (configPath, roles) {
    this._configPath = configPath
    this._roles = roles
  }

  _initializeRoleData () {
    let configData = {
    }

    this._roles.forEach((role) => {
      configData[role] = JSON.parse(JSON.stringify(ADRoleData))
    })

    return configData
  }

  loadConfigData () {
    return new Promise((resolve, reject) => {
      fs.readFile(this._configPath, (err, data) => {
        if (err) {
          this._configData = this._initializeRoleData()
        } else {
          this._configData = JSON.parse(data)
        }
        resolve(this._configData)
      })
    })
  }

  saveConfigData () {
    return new Promise((resolve, reject) => {
      fs.writeFile(this._configPath, JSON.stringify(this._configData), (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  getConfigData () {
    return this._configData
  }

  setConfigData (role, field, data) {
    this._configData[role][field] = data
  }

  getConfigDataForRole (role) {
    return this._configData[role]
  }
}

class ADDeployConfigScreen {
  constructor (roles, adConfigData, applicationName) {
    this._roles = roles
    this._adConfigData = adConfigData
    this._screen = this._window()
    this._roleList = new RoleList(this)
    this._roleForm = new RoleForm(this)
    this._text = this._appLabel(this._screen, applicationName)
    this._screen.key(['escape', 'C-c'], () => this._exitScreen())
  }

  _window () {
    return Blessed.screen({
      title: 'ad-deploy-config',
      autoPadding: true,
      smartCSR: true
    })
  }

  _appLabel (screen, applicationName) {
    return Blessed.text({
      parent: screen,
      content: `Roles for ${applicationName}`
    })
  }

  _exitScreen () {
    this._screen.leave()
    process.exit(0)
  }

  render () {
    this._screen.render()
  }

  getSelectedRole () {
    let selectedRoleIndex = this._roleList.getSelectedIndex()
    return this._roles[selectedRoleIndex]
  }

  getRoles () {
    return this._roles
  }

  focusOnFirstFormField () {
    this._roleForm.focusOnFirstField()
  }

  focusToRoleList () {
    this._roleList.focus()
  }

  getScreen () {
    return this._screen
  }

  updateForm () {
    let selectedRole = this.getSelectedRole()
    let roleData = this._adConfigData.getConfigDataForRole(selectedRole)
    this._roleForm.updateForm(roleData)
  }

  updateConfigDataForSelectedRole (data) {
    let selectedRole = this.getSelectedRole()
    logMessage(`Selected role: ${selectedRole}\n`)
    Object.keys(data).forEach((field) => {
      this._adConfigData.setConfigData(selectedRole, field, data[field])
    })
    this._adConfigData.saveConfigData()
      .then(() => logMessage('Saved configuration data.\n'))
      .catch((err) => logMessage(err.stack || err + '\n'))
  }
}

const abaqisRoles = [
  'uat',
  'test',
  'demo',
  'training',
  'production'
]

const eseRoles = [
  'uat',
  'test',
  'demo',
  'production'
]

const rqiRoles = [
  'uat',
  'production'
]

const logMessage = (message) => {
  fs.appendFile('ad-deploy-config.log', message, (err) => {
    if (err) {
      console.error(err.stack || err)
      process.exit(1)
    }
  })
}

if (!(program.abaqis || program.ese || program.rqi)) {
  console.error("Must specify the application you're configurating")
  process.exit(1)
}

let roles = program.abaqis ? abaqisRoles : program.ese ? eseRoles : program.rqi ? rqiRoles : []

let applicationName = program.abaqis ? 'abaqis' : program.ese ? 'ESE' : program.rqi ? 'RQI' : []

let adConfigData = new ADConfigData('deploy-config.json', roles)

adConfigData.loadConfigData()
  .then((configData) => {
    logMessage(JSON.stringify(configData))
    let screen = new ADDeployConfigScreen(roles, adConfigData, applicationName)
    screen.updateForm()
    screen.render()
  })
