'use strict'

module.exports = (function () {
  const dbConn = require('../utility/db').conn()
  const {promisify} = require('util')

  const dbConnRun = promisify(dbConn.run).bind(dbConn)
  const dbConnAll = promisify(dbConn.all).bind(dbConn)
  const dbConnGet = promisify(dbConn.get).bind(dbConn)

  const changeUserPasswordSQL = `
    UPDATE users SET
      password = ?
    WHERE
      rowid = ?`

  const changeUserPassword = async (userId, encryptedPassword) => {
    return dbConnRun(changeUserPasswordSQL, encryptedPassword)
  }

  const createApplicationsTableSQL = `
    CREATE TABLE IF NOT EXISTS applications (
      rowid INTEGER NOT NULL,
      name TEXT NOT NULL UNIQUE,
      PRIMARY KEY (rowid))`

  const createApplicationsTable = async () => {
    return dbConnRun(createApplicationsTableSQL)
  }

  const createDeploymentsTableSQL = `
    CREATE TABLE IF NOT EXISTS deployments (
      rowid INTEGER NOT NULL,
      release_id INTEGER NOT NULL, 
      role_id INTEGER NOT NULL, 
      override_token TEXT, 
      step INTEGER, 
      status INTEGER NOT NULL CHECK (status IN (0,1,2)), 
      message TEXT,
      user_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL, 
      PRIMARY KEY (rowid),
      CONSTRAINT uniq_deployment UNIQUE (release_id, role_id),
      FOREIGN KEY(release_id) REFERENCES releases(rowid) ON DELETE CASCADE, 
      FOREIGN KEY(role_id) REFERENCES roles(rowid) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(rowid) ON DELETE CASCADE)`

  const createDeploymentsTable = async () => {
    return dbConnRun(createDeploymentsTableSQL)
  }

  const createReleasesTableSQL = `
    CREATE TABLE IF NOT EXISTS releases (
      rowid INTEGER NOT NULL,
      application_id INTEGER NOT NULL, 
      version TEXT NOT NULL, 
      tarball TEXT NOT NULL, 
      seedfile TEXT, 
      user_id INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      created_at INTEGER NOT NULL, 
      PRIMARY KEY (rowid),
      CONSTRAINT uniq_version UNIQUE (application_id, version), 
      FOREIGN KEY(application_id) REFERENCES applications(rowid) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(rowid) ON DELETE CASCADE)`

  const createReleasesTable = async () => {
    return dbConnRun(createReleasesTableSQL)
  }

  const createRolesTableSQL = `
    CREATE TABLE IF NOT EXISTS roles (
      rowid INTEGER NOT NULL,
      application_id INTEGER NOT NULL, 
      role TEXT NOT NULL, 
      active_server TEXT NOT NULL, 
      time_window TEXT, 
      appdir TEXT NOT NULL,
      ruby_name TEXT NOT NULL,
      PRIMARY KEY (rowid),
      CONSTRAINT uniq_role UNIQUE (application_id, role), 
      FOREIGN KEY (application_id) REFERENCES applications(rowid) ON DELETE CASCADE)`

  const createRolesTable = async () => {
    return dbConnRun(createRolesTableSQL)
  }

  const createUsersTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      rowid INTEGER NOT NULL,
      email TEXT NOT NULL UNIQUE, 
      password TEXT NOT NULL, 
      user_role TEXT NOT NULL CHECK (user_role IN ('admin', 'deployer', 'reporter')), 
      name TEXT NOT NULL,
      enabled INTEGER NOT NULL CHECK (enabled IN (0,1)),
      PRIMARY KEY (rowid))`

  const createUsersTable = async () => {
    return dbConnRun(createUsersTableSQL)
  }

  const createWorkflowsTableSQL = `
    CREATE TABLE IF NOT EXISTS workflows (
      rowid INTEGER NOT NULL,
      role_id INTEGER NOT NULL, 
      playbook TEXT NOT NULL, 
      sequence INTEGER NOT NULL, 
      enforce_tw INTEGER NOT NULL CHECK (enforce_tw IN (0,1)), 
      pause_after INTEGER NOT NULL CHECK (pause_after IN (0,1)), 
      final INTEGER NOT NULL CHECK (final IN (0,1)), 
      PRIMARY KEY (rowid),
      FOREIGN KEY(role_id) REFERENCES roles(rowid) ON DELETE CASCADE)`

  const createWorkflowsTable = async () => {
    return dbConnRun(createWorkflowsTableSQL)
  }

  const deleteApplicationsSQL = `
    DELETE FROM applications
    WHERE
      rowid = ?`

  const deleteApplications = async (applicationId) => {
    return dbConnRun(deleteApplicationsSQL, applicationId)
  }

  const deleteApplicationDeploymentsSQL = `
    DELETE FROM deployments
    WHERE
      role_id IN (SELECT rowid FROM roles WHERE application_id = ?)`

  const deleteApplicationDeployments = async (applicationId) => {
    return dbConnRun(deleteApplicationDeploymentsSQL, applicationId)
  }

  const deleteApplicationReleaseSQL = `
    DELETE FROM releases
    WHERE
      rowid = ?`

  const deleteApplicationRelease = async (releaseId) => {
    return dbConnRun(deleteApplicationReleaseSQL, releaseId)
  }

  const deleteApplicationReleasesSQL = `
    DELETE FROM releases
    WHERE
      application_id = ?`

  const deleteApplicationReleases = async (applicationId) => {
    return dbConnRun(deleteApplicationReleasesSQL, applicationId)
  }

  const deleteApplicationRoleSQL = `
    DELETE FROM roles 
    WHERE 
      rowid = ?`

  const deleteApplicationRole = async (roleId) => {
    return dbConnRun(deleteApplicationRoleSQL, roleId)
  }

  const deleteApplicationRolesSQL = `
    DELETE FROM roles
    WHERE
      application_id = ?`

  const deleteApplicationRoles = async (applicationId) => {
    return dbConnRun(deleteApplicationRolesSQL, applicationId)
  }

  const deleteReleaseDeploymentsSQL = `
    DELETE FROM deployments
    WHERE 
      release_id = ?`

  const deleteReleaseDeployments = async (releaseId) => {
    return dbConnRun(deleteReleaseDeploymentsSQL, releaseId)
  }

  const deleteRoleDeploymentsSQL = `
    DELETE FROM deployments
    WHERE
      rowid = ?`

  const deleteRoleDeployments = async (roleId) => {
    return dbConnRun(deleteRoleDeploymentsSQL, roleId)
  }

  const deleteRoleWorkflowsSQL = `
    DELETE FROM workflows
    WHERE
      role_id = ?`

  const deleteRoleWorkflows = async (roleId) => {
    return dbConnRun(deleteRoleWorkflowsSQL, roleId)
  }

  const deleteUserSQL = `
    DELETE FROM users
    WHERE
      rowid = ?`

  const deleteUser = async (userId) => {
    return dbConnRun(deleteUserSQL, userId)
  }

  const deleteWorkflowSQL = `
    DELETE FROM workflows
    WHERE
      rowid = ?`

  const deleteWorkflow = async (id) => {
    return dbConnRun(deleteWorkflowSQL, id)
  }

  const insertApplicationRoleSQL = `
    INSERT INTO roles (
      application_id, 
      role, 
      active_server,
      time_window,
      appdir,
      ruby_name
    ) VALUES (
      ?, ?, ?, ?, ?, ?
    )`

  const insertApplicationRole = async (appId, roleParams) => {
    return dbConnRun(insertApplicationRoleSQL, appId, roleParams.role, roleParams.active_server, roleParams.time_window, roleParams.appdir, roleParams.ruby_name)
  }

  const insertApplicationSQL = `
    INSERT INTO applications (
      name
    ) VALUES (
      ?
    )`

  const insertApplication = async (name) => {
    return dbConnRun(insertApplicationSQL, name)
  }

  const insertDeploymentSQL = `
    INSERT INTO deployments (
      release_id, 
      role_id, 
      step,
      status, 
      user_id,
      created_at
    ) VALUES (
      ?,?,0,0,?,DATETIME('now')
    )`

  const insertDeployment = async (releaseId, roleId, userId) => {
    return dbConnRun(insertDeploymentSQL, releaseId, roleId, userId)
  }

  const insertReleaseSQL = `
    INSERT INTO releases (
      application_id, 
      version, 
      tarball, 
      seedfile,
      user_id,
      timestamp,
      created_at
    ) VALUES (
      ?, ?, ?, ?, ?, STRFTIME('%Y%m%d%H%M%S', 'now'), DATETIME('now')
    )`

  const insertRelease = async (appId, version, tarball, seedfile, userId) => {
    return dbConnRun(insertReleaseSQL, appId, version, tarball, seedfile, userId)
  }

  const insertUserSQL = `
    INSERT INTO users (
      email,
      name,
      user_role,
      enabled,
      password
    ) VALUES (
      ?, ?, ?, ?, ?
    )`

  const insertUser = async (userParams, encryptedPassword) => {
    return dbConnRun(insertUserSQL, userParams.email, userParams.name, userParams.user_role, userParams.enabled, encryptedPassword)
  }

  const insertWorkflowSQL = `
    INSERT INTO workflows (
      role_id,
      playbook,
      sequence,
      enforce_tw,
      pause_after,
      final
    ) VALUES (
      ?,?,?,?,?,?
    )`

  const insertWorkflow = async (roleId, playbook, sequence, enforceTW, pause, finalStep) => {
    return dbConnRun(insertWorkflowSQL, roleId, playbook, sequence, enforceTW, pause, finalStep)
  }

  const prepDB = async () => {
    await createUsersTable()
    await createApplicationsTable()
    await createRolesTable()
    await createReleasesTable()
    await createDeploymentsTable()
    await createWorkflowsTable()
    return foreignKeysOn()
  }

  const selectAllApplicationsSQL = `
    SELECT 
      rowid as id, 
      name 
    FROM 
      applications`

  const selectAllApplications = async () => {
    return dbConnAll(selectAllApplicationsSQL)
  }

  const selectDeploymentsSQL = `
    SELECT
      deps.rowid AS id,
      deps.step,
      deps.status,
      deps.message,
      deps.created_at,
      rols.role,
      rols.active_server,
      rols.time_window,
      rols.appdir,
      rols.ruby_name,
      rels.version,
      rels.created_at,
      apps.name
    FROM
      deployments deps INNER JOIN releases rels ON deps.release_id = rels.rowid
      INNER JOIN roles rols ON deps.role_id = rols.rowid
      INNER JOIN applications apps ON rels.application_id = apps.rowid
    WHERE
      deps.release_id = ?
      OR deps.role_id = ?`

  const selectDeployments = async (releaseId, roleId) => {
    return dbConnAll(selectDeploymentsSQL, releaseId, roleId)
  }

  const selectDeploymentByRoleReleaseSQL = `
    SELECT
      rowid AS id,
      release_id,
      role_id,
      override_token,
      step,
      status,
      created_at
    FROM
      deployments
    WHERE
      release_id = ?
      AND role_id = ?`

  const selectDeploymentByRoleRelease = async (releaseId, roleId) => {
    return dbConnGet(selectDeploymentByRoleReleaseSQL, releaseId, roleId)
  }

  const selectApplicationByIdSQL = `
    SELECT 
      rowid AS id, 
      name 
    FROM 
      applications 
    WHERE 
      rowid = ?`

  const selectApplicationById = async (id) => {
    return dbConnGet(selectApplicationByIdSQL, id)
  }

  const selectApplicationReleaseIdsSQL = `
    SELECT
      rowid AS id
    FROM
      releases
    WHERE
      application_id = ?`

  const selectApplicationReleaseIds = async (applicationId) => {
    return dbConnAll(selectApplicationReleaseIdsSQL, applicationId)
  }

  const selectApplicationReleaseByIdSQL = `
    SELECT
      rowid AS id,
      application_id,
      version,
      tarball,
      seedfile,
      user_id,
      timestamp,
      created_at
    FROM
      releases
    WHERE
      rowid = ?`

  const selectApplicationReleaseById = async (id) => {
    return dbConnGet(selectApplicationReleaseByIdSQL, id)
  }

  const selectApplicationReleasesSQL = `
    SELECT
      rowid AS id,
      application_id,
      version,
      tarball,
      seedfile,
      user_id,
      timestamp,
      created_at
    FROM
      releases
    WHERE
      application_id = ?`

  const selectApplicationReleases = async (appId) => {
    return dbConnAll(selectApplicationReleasesSQL, appId)
  }

  const selectReleaseInfoSQL = `
    SELECT
      apps.rowid AS application_id,
      apps.name AS application_name,
      rols.rowid AS role_id,
      rols.role,
      rols.active_server,
      rols.time_window,
      rols.appdir,
      rols.ruby_name,
      rels.rowid AS release_id,
      rels.version,
      rels.tarball,
      rels.seedfile,
      rels.timestamp
    FROM
      applications apps INNER JOIN roles rols ON rols.application_id = apps.rowid
      INNER JOIN releases rels ON rels.application_id = apps.rowid
    WHERE
      apps.name = ?
      AND rels.version = ?
      AND rols.role = ?`

  const selectReleaseInfo = async (appName, version, role) => {
    return dbConnGet(selectReleaseInfoSQL, appName, version, role)
  }

  const selectDeploymentInfoSQL = `
    SELECT
      apps.rowid AS application_id,
      apps.name AS application_name,
      rols.rowid AS role_id,
      rols.role,
      rols.active_server,
      rols.time_window,
      rols.appdir,
      rols.ruby_name,
      rels.version,
      rels.tarball,
      rels.seedfile,
      rels.timestamp,
      deps.rowid AS deployment_id,
      deps.override_token,
      deps.step,
      deps.status,
      deps.message
    FROM
      applications apps INNER JOIN roles rols ON rols.application_id = apps.rowid
      INNER JOIN releases rels ON rels.application_id = apps.rowid
      INNER JOIN deployments deps ON deps.role_id = rols.rowid AND deps.release_id = rels.rowid
    WHERE
      apps.name = ?
      AND rels.version = ?
      AND rols.role = ?`

  const selectDeploymentInfo = async (appName, version, role) => {
    return dbConnGet(selectDeploymentInfoSQL, appName, version, role)
  }

  const selectApplicationReleaseByNameVersionSQL = `
    SELECT
      apps.rowid AS application_id,
      rels.rowid AS release_id,
      rels.created_at
    FROM
      applications apps INNER JOIN releases rels ON rels.application_id = apps.rowid
    WHERE
      apps.name = ?
      AND rels.version = ?`

  const selectApplicationReleaseByNameVersion = async (application, appVersion) => {
    return dbConnGet(selectApplicationReleaseByNameVersionSQL, application, appVersion)
  }

  const selectApplicationRoleByAppRoleSQL = `
    SELECT
      apps.rowid AS application_id,
      rols.rowid AS role_id,
      rols.time_window,
      rols.appdir,
      rols.ruby_name
    FROM
      applications apps INNER JOIN roles rols ON rols.application_id = apps.rowid
    WHERE
      apps.name = ?
      AND rols.role = ?`

  const selectApplicationRoleByAppRole = async (application, role) => {
    return dbConnGet(selectApplicationRoleByAppRoleSQL, application, role)
  }

  const selectApplicationRoleByIdSQL = `
    SELECT 
      rowid AS id, 
      application_id, 
      role, 
      active_server,
      time_window,
      appdir,
      ruby_name
    FROM 
      roles 
    WHERE 
      rowid = ?`

  const selectApplicationRoleById = async (id) => {
    return dbConnGet(selectApplicationRoleByIdSQL, id)
  }

  const selectApplicationRolesSQL = `
    SELECT 
      rowid AS id, 
      application_id, 
      role, 
      active_server,
      time_window,
      appdir,
      ruby_name
    FROM 
      roles 
    WHERE 
      application_id = ?`

  const selectApplicationRoles = async (appId) => {
    return dbConnAll(selectApplicationRolesSQL, appId)
  }

  const selectLatestApplicationReleaseSQL = `
    SELECT 
      rowid AS id, 
      application_id, 
      version, 
      tarball, 
      seedfile,
      user_id,
      timestamp,
      created_at 
    FROM 
      releases 
    WHERE 
      application_id = ? 
    ORDER BY 
      rowid DESC 
    LIMIT 1`

  const selectLatestApplicationRelease = async (appId) => {
    return dbConnAll(selectLatestApplicationReleaseSQL, appId)
  }

  const selectLatestApplicationRoleSQL = `
    SELECT 
      rowid AS id, 
      application_id, 
      role, 
      active_server,
      time_window,
      appdir,
      ruby_name
    FROM 
      roles 
    WHERE 
      application_id = ? 
    ORDER BY 
      rowid DESC 
    LIMIT 1`

  const selectLatestApplicationRole = async (appId) => {
    return dbConnGet(selectLatestApplicationRoleSQL, appId)
  }

  const selectLatestApplicationSQL = `
    SELECT 
      rowid AS id, 
      name 
    FROM 
      applications 
    ORDER BY 
      rowid DESC 
    LIMIT 1`

  const selectLatestApplication = async () => {
    return dbConnGet(selectLatestApplicationSQL)
  }

  const selectLatestDeploymentSQL = `
    SELECT
      rowid AS id,
      release_id,
      role_id,
      override_token,
      step,
      status,
      created_at
    FROM
      deployments
    ORDER BY
      rowid DESC
    LIMIT 1`

  const selectLatestDeployment = async () => {
    return dbConnAll(selectLatestDeploymentSQL)
  }

  const selectLatestUserSQL = `
    SELECT
      rowid AS id,
      email,
      name,
      user_role,
      enabled
    FROM
      users
    ORDER BY
      rowid DESC
    LIMIT 1`

  const selectLatestUser = async () => {
    return dbConnAll(selectLatestUserSQL)
  }

  const selectLatestWorkflowSQL = `
    SELECT
      rowid as id,
      role_id,
      playbook,
      sequence,
      enforce_tw,
      pause_after,
      final
    FROM
      workflows
    ORDER BY
      rowid DESC
    LIMIT 1`

  const selectLatestWorkflow = async () => {
    return dbConnAll(selectLatestWorkflowSQL)
  }

  const selectUserByEmailSQL = `
    SELECT
      rowid AS id,
      email,
      name,
      user_role,
      enabled,
      password
    FROM
      users
    WHERE
      email = ?`

  const selectUserByEmail = async (email) => {
    return dbConnGet(selectUserByEmailSQL, email)
  }

  const selectUserByIdSQL = `
    SELECT
      rowid AS id,
      email,
      password,
      name,
      user_role,
      enabled
    FROM
      users
    WHERE
      rowid = ?`

  const selectUserById = async (id) => {
    return dbConnGet(selectUserByIdSQL, id)
  }

  const selectUsersSQL = `
    SELECT
      rowid AS id,
      email,
      name,
      user_role,
      enabled
    FROM
      users`

  const selectUsers = async () => {
    return dbConnAll(selectUsersSQL)
  }

  const selectWorkflowByIdSQL = `
    SELECT
      rowid as id,
      role_id,
      playbook,
      sequence,
      enforce_tw,
      pause_after,
      final
    FROM
      workflows
    WHERE
      rowid = ?`

  const selectWorkflowById = async (id) => {
    return dbConnGet(selectWorkflowByIdSQL, id)
  }

  const selectWorkflowByRoleSequenceSQL = `
    SELECT
      rowid as id,
      role_id,
      playbook,
      sequence,
      enforce_tw,
      pause_after,
      final
    FROM
      workflows
    WHERE
      role_id = ?
      AND sequence = ?`

  const selectWorkflowByRoleSequence = async (roleId, sequence) => {
    return dbConnGet(selectWorkflowByRoleSequenceSQL, roleId, sequence)
  }

  const selectWorkflowsSQL = `
    SELECT
      rowid as id,
      role_id,
      playbook,
      sequence,
      enforce_tw,
      pause_after,
      final
    FROM
      workflows`

  const selectWorkflows = async () => {
    return dbConnAll(selectWorkflowsSQL)
  }

  const selectRoleWorkflowsSQL = `
    SELECT
      rowid as id,
      role_id,
      playbook,
      sequence,
      enforce_tw,
      pause_after,
      final
    FROM
      workflows
    WHERE
      role_id = ?
    ORDER BY
      sequence ASC`

  const selectRoleWorkflows = async (roleId) => {
    return dbConnAll(selectRoleWorkflowsSQL, roleId)
  }

  const selectNextRoleWorkflowSQL = `
    SELECT
      rowid as id,
      role_id,
      playbook,
      sequence,
      enforce_tw,
      pause_after,
      final
    FROM
      workflows
    WHERE
      role_id = ?
      AND sequence > ?
    ORDER BY
      sequence ASC`

  const selectNextRoleWorkflow = async (roleId, sequence) => {
    return dbConnAll(selectNextRoleWorkflowSQL, roleId, sequence)
  }

  const updateApplicationSQL = `
    UPDATE applications SET 
      name = ? 
    WHERE 
      rowid = ?`

  const updateApplication = async (id, appParams) => {
    return dbConnRun(updateApplicationSQL, appParams.name, id)
  }

  const updateApplicationReleaseSQL = `
    UPDATE releases SET
      application_id = ?,
      version = ?,
      user_id = ?
    WHERE
      rowid = ?`

  const updateApplicationRelease = async (appId, releaseId, releaseParams, userId) => {
    return dbConnRun(updateApplicationReleaseSQL, appId, releaseParams.version, userId, releaseId)
  }

  const updateApplicationRoleSQL = `
    UPDATE roles SET 
      application_id = ?, 
      role = ?, 
      active_server = ?,
      time_window = ?,
      appdir = ?,
      ruby_name = ?
    WHERE 
      rowid = ?`

  const updateApplicationRole = async (appId, roleId, roleParams) => {
    return dbConnRun(updateApplicationRoleSQL, appId, roleParams.role, roleParams.active_server, roleParams.time_window, roleParams.appdir, roleParams.ruby_name, roleId)
  }

  const updateDeploymentIncrementStepSQL = `
    UPDATE deployments SET
      user_id = ?,
      step = step + 1,
      status = 0,
      message = NULL
    WHERE
      rowid = ?`

  const updateDeploymentIncrementStep = async (id, userId) => {
    return dbConnRun(updateDeploymentIncrementStepSQL, userId, id)
  }

  const updateDeploymentStatusSQL = `
    UPDATE deployments SET
      status = ?,
      message = ?
    WHERE
      rowid = ?`

  const updateDeploymentStatus = async (id, status, message) => {
    return dbConnRun(updateDeploymentStatusSQL, status, message, id)
  }

  const updateDeploymentOverrideTokenSQL = `
    UPDATE deployments SET
      override_token = ?
    WHERE
      rowid = ?`

  const updateDeploymentOverrideToken = async (id, token) => {
    return dbConnRun(updateDeploymentOverrideTokenSQL, token, id)
  }

  const updateUserSQL = `
    UPDATE users SET
      name = ?,
      user_role = ?,
      enabled = ?
    WHERE
      rowid = ?`

  const updateUser = async (userId, userParams, enabled) => {
    return dbConnRun(updateUserSQL, userParams.name, userParams.user_role, enabled, userId)
  }

  const updateWorkflowSQL = `
    UPDATE workflows SET
      role_id = ?,
      playbook = ?,
      sequence = ?,
      enforce_tw = ?,
      pause_after = ?,
      final = ?
    WHERE
      rowid = ?`

  const updateWorkflow = async (id, roleId, playbook, sequence, enforceTW, pause, finalStep) => {
    return dbConnRun(updateWorkflowSQL, roleId, playbook, sequence, enforceTW, pause, finalStep, id)
  }

  const foreignKeysOnSQL = `
    PRAGMA foreign_keys = ON`

  const foreignKeysOn = async () => {
    return dbConnRun(foreignKeysOnSQL)
  }

  var mod = {
    changeUserPassword: changeUserPassword,
    createApplicationsTable: createApplicationsTable,
    createDeploymentsTable: createDeploymentsTable,
    createReleasesTable: createRolesTable,
    createRolesTable: createReleasesTable,
    createUsersTable: createUsersTable,
    createWorkflowsTable: createWorkflowsTable,
    deleteApplications: deleteApplications,
    deleteApplicationDeployments: deleteApplicationDeployments,
    deleteApplicationRelease: deleteApplicationRelease,
    deleteApplicationReleases: deleteApplicationReleases,
    deleteApplicationRole: deleteApplicationRole,
    deleteApplicationRoles: deleteApplicationRoles,
    deleteReleaseDeployments: deleteReleaseDeployments,
    deleteRoleDeployments: deleteRoleDeployments,
    deleteRoleWorkflows: deleteRoleWorkflows,
    deleteUser: deleteUser,
    deleteWorkflow: deleteWorkflow,
    foreignKeysOn: foreignKeysOn,
    insertApplication: insertApplication,
    insertApplicationRole: insertApplicationRole,
    insertDeployment: insertDeployment,
    insertRelease: insertRelease,
    insertUser: insertUser,
    insertWorkflow: insertWorkflow,
    prepDB: prepDB,
    selectAllApplications: selectAllApplications,
    selectApplicationById: selectApplicationById,
    selectApplicationReleaseById: selectApplicationReleaseById,
    selectApplicationReleaseIds: selectApplicationReleaseIds,
    selectApplicationReleases: selectApplicationReleases,
    selectApplicationReleaseByNameVersion: selectApplicationReleaseByNameVersion,
    selectApplicationRoleByAppRole: selectApplicationRoleByAppRole,
    selectApplicationRoleById: selectApplicationRoleById,
    selectApplicationRoles: selectApplicationRoles,
    selectDeployments: selectDeployments,
    selectDeploymentByRoleRelease: selectDeploymentByRoleRelease,
    selectDeploymentInfo: selectDeploymentInfo,
    selectLatestApplication: selectLatestApplication,
    selectLatestApplicationRelease: selectLatestApplicationRelease,
    selectLatestApplicationRole: selectLatestApplicationRole,
    selectLatestDeployment: selectLatestDeployment,
    selectLatestUser: selectLatestUser,
    selectLatestWorkflow: selectLatestWorkflow,
    selectNextRoleWorkflow: selectNextRoleWorkflow,
    selectReleaseInfo: selectReleaseInfo,
    selectRoleWorkflows: selectRoleWorkflows,
    selectUserByEmail: selectUserByEmail,
    selectUserById: selectUserById,
    selectUsers: selectUsers,
    selectWorkflowById: selectWorkflowById,
    selectWorkflowByRoleSequence: selectWorkflowByRoleSequence,
    selectWorkflows: selectWorkflows,
    updateApplication: updateApplication,
    updateApplicationRelease: updateApplicationRelease,
    updateApplicationRole: updateApplicationRole,
    updateDeploymentIncrementStep: updateDeploymentIncrementStep,
    updateDeploymentOverrideToken: updateDeploymentOverrideToken,
    updateDeploymentStatus: updateDeploymentStatus,
    updateUser: updateUser,
    updateWorkflow: updateWorkflow
  }

  return mod
}())
