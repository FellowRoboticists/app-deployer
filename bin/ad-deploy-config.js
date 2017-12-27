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

const indexFields = [
  'out-of-range',
  'rpm1name',
  'rpm2name',
  'preMigrationScript1',
  'preMigrationScript2',
  'preMigrationScript3',
  'preMigrationScript4',
  'preMigrationScript5',
  'seedDataLoad',
  'schemaMigration',
  'postMigrationScript1',
  'postMigrationScript2',
  'postMigrationScript3',
  'postMigrationScript4',
  'postMigrationScript5'
]

class InvokeForm {
  constructor (appScreen) {
    this._appScreen = appScreen
    this._form = this._window(appScreen.getScreen())
    this._duration = new DurationRadios(this, 'script', 1, 2)
    this._submitButton = new FormButton(this, 'Submit', 1, 5, () => { this._submitHandler() })
    this._cancelButton = new FormButton(this, 'Cancel', 20, 5, () => { this._cancelHandler() })
    this._form.on('submit', (data) => this._submitForm(data))
  }

  _window (screen) {
    let form = Blessed.form({
      parent: screen,
      left: 'center',
      top: 'center',
      width: 60,
      height: 19,
      keys: true,
      hidden: true,
      border: {
        type: 'line'
      }
    })

    this._checkBox = Blessed.checkbox({
      parent: form,
      label: '] Invoke'
    })

    return form
  }

  getForm () {
    return this._form
  }

  setEditData (editData) {
    this._editData = editData
    if (editData.value.invoke) {
      this._checkBox.check()
    } else {
      this._checkBox.uncheck()
    }
    this._duration.setDuration(editData.value.duration)
  }

  focus () {
    this._checkBox.focus()
  }

  _submitHandler () {
    this._form.submit()
  }

  _submitForm (formData) {
    this._editData.value.invoke = this._checkBox.checked
    this._editData.value.duration = this._duration.getDuration()
    this._appScreen.submitForm(this._editData)
    this.toggle()
    this._appScreen.focusOnRoleAttrList()
    this._appScreen.render()
  }

  _cancelHandler () {
    this.toggle()
    this._appScreen.focusOnRoleAttrList()
    this._appScreen.render()
  }

  toggle () {
    this._form.toggle()
  }

  hide () {
    this._form.hide()
  }

  show () {
    this._form.show()
  }

  getAppScreen () {
    return this._appScreen
  }
}

class ScriptForm {
  constructor (appScreen) {
    this._appScreen = appScreen
    this._form = this._window(appScreen.getScreen())
    this._duration = new DurationRadios(this, 'script', 1, 2)
    this._submitButton = new FormButton(this, 'Submit', 1, 5, () => { this._submitHandler() })
    this._cancelButton = new FormButton(this, 'Cancel', 20, 5, () => { this._cancelHandler() })
    this._form.on('submit', (data) => this._submitForm(data))
  }

  _window (screen) {
    let form = Blessed.form({
      parent: screen,
      left: 'center',
      top: 'center',
      width: 60,
      height: 19,
      keys: true,
      hidden: true,
      border: {
        type: 'line'
      }
    })

    Blessed.text({
      parent: form,
      content: 'Script Path: '
    })

    this._textBox = Blessed.textbox({
      parent: form,
      inputOnFocus: true,
      left: 13 + 1
    })

    return form
  }

  getForm () {
    return this._form
  }

  setEditData (editData) {
    logMessage(`Edit Data: ${JSON.stringify(editData)}\n`)
    logMessage(`Edit Data: ${JSON.stringify(editData)}\n`)
    this._editData = editData
    this._textBox.setValue(editData.value.path)
    this._duration.setDuration(editData.value.duration)
  }

  focus () {
    this._textBox.focus()
  }

  _submitHandler () {
    this._form.submit()
  }

  _submitForm (formData) {
    this._editData.value.path = this._textBox.getValue()
    this._editData.value.duration = this._duration.getDuration()
    this._appScreen.submitForm(this._editData)
    this.toggle()
    this._appScreen.focusOnRoleAttrList()
    this._appScreen.render()
  }

  _cancelHandler () {
    this.toggle()
    this._appScreen.focusOnRoleAttrList()
    this._appScreen.render()
  }

  toggle () {
    this._form.toggle()
  }

  hide () {
    this._form.hide()
  }

  show () {
    this._form.show()
  }

  getAppScreen () {
    return this._appScreen
  }
}

class RPMNameForm {
  constructor (appScreen) {
    this._appScreen = appScreen
    this._form = this._window(appScreen.getScreen())
    this._submitButton = new FormButton(this, 'Submit', 1, 5, () => { this._submitHandler() })
    this._cancelButton = new FormButton(this, 'Cancel', 20, 5, () => { this._cancelHandler() })
    this._form.on('submit', (data) => this._submitForm(data))
  }

  _window (screen) {
    let form = Blessed.form({
      parent: screen,
      left: 'center',
      top: 'center',
      width: 60,
      height: 19,
      keys: true,
      hidden: true,
      border: {
        type: 'line'
      }
    })

    Blessed.text({
      parent: form,
      content: 'RPM Name: '
    })

    this._textBox = Blessed.textbox({
      parent: form,
      inputOnFocus: true,
      left: 10 + 1
    })

    return form
  }

  setEditData (editData) {
    this._editData = editData
    this._textBox.setValue(editData.value)
  }

  focus () {
    this._textBox.focus()
  }

  _submitHandler () {
    this._form.submit()
  }

  _submitForm (formData) {
    this._editData.value = this._textBox.getValue()
    this._appScreen.submitForm(this._editData)
    this.toggle()
    this._appScreen.focusOnRoleAttrList()
    this._appScreen.render()
  }

  _cancelHandler () {
    this.toggle()
    this._appScreen.focusOnRoleAttrList()
    this._appScreen.render()
  }

  getForm () {
    return this._form
  }

  toggle () {
    this._form.toggle()
  }

  hide () {
    this._form.hide()
  }

  show () {
    this._form.show()
  }

  getAppScreen () {
    return this._appScreen
  }
}

class RoleAttrTable {
  constructor (appScreen, roleData) {
    this._appScreen = appScreen
    this._roleAttrList = this._window(appScreen.getScreen())
    this.updateTable(roleData)
    this._roleAttrList.key(['left'], () => this._appScreen.focusToRoleList())
    this._roleAttrList.on('blur', () => this._adjustBorder('bg'))
    this._roleAttrList.on('focus', () => this._adjustBorder('line'))
    this._roleAttrList.key('enter', () => { this._editRow() })
  }

  _window (screen) {
    return Blessed.listtable({
      parent: screen,
      left: 18,
      top: 1,
      height: 20,
      width: 30,
      align: 'left',
      noCellBorders: true,
      interactive: true,
      keys: [ 'up', 'down' ],
      style: {
        cell: {
          selected: {
            inverse: true
          }
        }
      },
      border: {
      }
    })
  }

  _editRow () {
    let selectedIndex = this._roleAttrList.selected
    let selectedRole = this._appScreen.getSelectedRole()
    let selectedField = indexFields[selectedIndex]
    let roleData = this._appScreen.getConfigDataForRole(selectedRole)
    let editData = {
      index: selectedIndex,
      selectedRole: selectedRole,
      selectedField: selectedField,
      value: roleData[selectedField]
    }
    if (selectedIndex >= 1 && selectedIndex <= 2) {
      this._appScreen.showRPMNameForm(editData)
    } else if ((selectedIndex >= 3 && selectedIndex <= 7) || (selectedIndex >= 10 && selectedIndex <= 14)) {
      this._appScreen.showScriptForm(editData)
    } else if ((selectedIndex >= 8 && selectedIndex <= 9)) {
      this._appScreen.showInvokeForm(editData)
    }
  }

  _adjustBorder (borderType) {
    this._roleAttrList.border.type = borderType
    this._appScreen.render()
  }

  focus () {
    this._roleAttrList.focus()
    this._appScreen.render()
  }

  updateTable (roleData) {
    let data = [
      [ 'Field', 'Value', 'Duration' ]
    ]

    data.push([ 'RPM 1', roleData.rpm1name, '' ])
    data.push([ 'RPM 2', roleData.rpm2name, '' ])
    data.push([ 'PreMigration', roleData.preMigrationScript1.path, roleData.preMigrationScript1.duration ])
    data.push([ 'PreMigration', roleData.preMigrationScript2.path, roleData.preMigrationScript2.duration ])
    data.push([ 'PreMigration', roleData.preMigrationScript3.path, roleData.preMigrationScript3.duration ])
    data.push([ 'PreMigration', roleData.preMigrationScript4.path, roleData.preMigrationScript4.duration ])
    data.push([ 'PreMigration', roleData.preMigrationScript5.path, roleData.preMigrationScript5.duration ])
    data.push([ 'Seed Data', roleData.seedDataLoad.invoke + '', roleData.seedDataLoad.duration ])
    data.push([ 'Schema Migration', roleData.schemaMigration.invoke + '', roleData.schemaMigration.duration ])
    data.push([ 'PostMigration', roleData.postMigrationScript1.path, roleData.postMigrationScript1.duration ])
    data.push([ 'PostMigration', roleData.postMigrationScript2.path, roleData.postMigrationScript2.duration ])
    data.push([ 'PostMigration', roleData.postMigrationScript3.path, roleData.postMigrationScript3.duration ])
    data.push([ 'PostMigration', roleData.postMigrationScript4.path, roleData.postMigrationScript4.duration ])
    data.push([ 'PostMigration', roleData.postMigrationScript5.path, roleData.postMigrationScript5.duration ])

    this._roleAttrList.setRows(data)
  }
}

class RoleList {
  constructor (appScreen) {
    this._appScreen = appScreen
    this._roleList = this._window(appScreen.getScreen())
    this._roleList.on('blur', () => this._adjustBorder('bg'))
    this._roleList.on('focus', () => this._adjustBorder('line'))
    this._roleList.key(['right', 'tab'], () => this._appScreen.focusOnRoleAttrList())
    this._roleList.key(['up', 'down'], () => this._appScreen.updateTable())
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

class DurationRadios {
  constructor (form, name, left, top) {
    this._form = form
    this._radioset = this._window(form.getForm(), name, left, top)
  }

  _window (form, name, left, top) {
    let radioSet = Blessed.radioset({
      parent: form,
      label: 'Duration',
      name: name,
      top: top,
      left: left,
      height: 3,
      border: {
        type: 'line'
      }
    })

    this._short = Blessed.radiobutton({
      parent: radioSet,
      name: 'short',
      label: ') Short',
      // top: top,
      left: 0
    })

    this._medium = Blessed.radiobutton({
      parent: radioSet,
      name: 'medium',
      label: ') Medium',
      // top: top,
      left: 10
    })

    this._long = Blessed.radiobutton({
      parent: radioSet,
      name: 'long',
      label: ') Long',
      // top: top,
      left: 20
    })

    return radioSet
  }

  setDuration (duration) {
    if (duration === 'short') {
      this._short.check()
    } else if (duration === 'medium') {
      this._medium.check()
    } else if (duration === 'long') {
      this._long.check()
    }
  }

  getDuration () {
    let duration = null
    if (this._short.checked) {
      duration = 'short'
    } else if (this._medium.checked) {
      duration = 'medium'
    } else if (this._long.checked) {
      duration = 'long'
    }

    return duration
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

const ADRoleData = {
  rpm1name: null,
  rpm2name: null,
  preMigrationScript1: { path: null, duration: 'short' },
  preMigrationScript2: { path: null, duration: 'short' },
  preMigrationScript3: { path: null, duration: 'short' },
  preMigrationScript4: { path: null, duration: 'short' },
  preMigrationScript5: { path: null, duration: 'short' },
  seedDataLoad: { invoke: false, duration: 'short' },
  schemaMigration: { invoke: false, duration: 'short' },
  postMigrationScript1: { path: null, duration: 'short' },
  postMigrationScript2: { path: null, duration: 'short' },
  postMigrationScript3: { path: null, duration: 'short' },
  postMigrationScript4: { path: null, duration: 'short' },
  postMigrationScript5: { path: null, duration: 'short' }
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
    this._roleAttrList = new RoleAttrTable(this, this._adConfigData.getConfigDataForRole('uat'))
    // this._roleForm = new RoleForm(this)
    this._text = this._appLabel(this._screen, applicationName)
    this._rpmNameForm = new RPMNameForm(this)
    this._scriptForm = new ScriptForm(this)
    this._invokeForm = new InvokeForm(this)
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

  doRPMNameForm () {
    this._rpmNameForm.toggle()
    this.render()
  }

  showRPMNameForm (editData) {
    this._rpmNameForm.setEditData(editData)
    this._rpmNameForm.toggle()
    this._rpmNameForm.focus()
    this.render()
  }

  showScriptForm (editData) {
    this._scriptForm.setEditData(editData)
    this._scriptForm.toggle()
    this._scriptForm.focus()
    this.render()
  }

  showInvokeForm (editData) {
    this._invokeForm.setEditData(editData)
    this._invokeForm.toggle()
    this._invokeForm.focus()
    this.render()
  }

  submitForm (editData) {
    let selectedRole = this.getSelectedRole()
    this._adConfigData.setConfigData(selectedRole, editData.selectedField, editData.value)
    let roleData = this._adConfigData.getConfigDataForRole(selectedRole)
    this._roleAttrList.updateTable(roleData)
    this._adConfigData.saveConfigData()
      .then(() => logMessage('Saved configuration data.\n'))
      .catch((err) => logMessage(err.stack || err + '\n'))
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

  focusOnRoleAttrList () {
    this._roleAttrList.focus()
  }

  focusToRoleList () {
    this._roleList.focus()
  }

  append (node) {
    this._screen.append(node)
  }

  getScreen () {
    return this._screen
  }

  hideAllForms () {
    this._rpmNameForm.hide()
  }

  updateTable () {
    let selectedRole = this.getSelectedRole()
    let roleData = this._adConfigData.getConfigDataForRole(selectedRole)
    this._roleAttrList.updateTable(roleData)
    this.render()
  }

  updateForm () {
  }

  getConfigDataForRole (selectedRole) {
    return this._adConfigData.getConfigDataForRole(selectedRole)
  }

  updateConfigDataForSelectedRole (data) {
    let selectedRole = this.getSelectedRole()
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
    let screen = new ADDeployConfigScreen(roles, adConfigData, applicationName)
    // screen.updateForm()
    // screen.hideAllForms()
    screen.render()
  })
