'use strict'

module.exports = (function () {
  const dbConn = require('../utility/db').conn()

  const changeUserPasswordSQL = `
    UPDATE users SET
      password = ?
    WHERE
      rowid = ?`

  const changeUserPassword = (userId, encryptedPassword) => {
    return new Promise((resolve, reject) => {
      dbConn.run(changeUserPasswordSQL, encryptedPassword, userId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const createApplicationsTableSQL = `
    CREATE TABLE IF NOT EXISTS applications (
      rowid INTEGER NOT NULL,
      name TEXT NOT NULL UNIQUE,
      PRIMARY KEY (rowid))`

  const createApplicationsTable = () => {
    return new Promise((resolve, reject) => {
      dbConn.run(createApplicationsTableSQL, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
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

  const createDeploymentsTable = () => {
    return new Promise((resolve, reject) => {
      dbConn.run(createDeploymentsTableSQL, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const createReleasesTableSQL = `
    CREATE TABLE IF NOT EXISTS releases (
      rowid INTEGER NOT NULL,
      application_id INTEGER NOT NULL, 
      version TEXT NOT NULL, 
      tarball TEXT NOT NULL, 
      seedfile TEXT, 
      user_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL, 
      PRIMARY KEY (rowid),
      CONSTRAINT uniq_version UNIQUE (application_id, version), 
      FOREIGN KEY(application_id) REFERENCES applications(rowid) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(rowid) ON DELETE CASCADE)`

  const createReleasesTable = () => {
    return new Promise((resolve, reject) => {
      dbConn.run(createReleasesTableSQL, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const createRolesTableSQL = `
    CREATE TABLE IF NOT EXISTS roles (
      rowid INTEGER NOT NULL,
      application_id INTEGER NOT NULL, 
      role TEXT NOT NULL, 
      active_server TEXT NOT NULL, 
      time_window TEXT, 
      PRIMARY KEY (rowid),
      CONSTRAINT uniq_role UNIQUE (application_id, role), 
      FOREIGN KEY (application_id) REFERENCES applications(rowid) ON DELETE CASCADE)`

  const createRolesTable = () => {
    return new Promise((resolve, reject) => {
      dbConn.run(createRolesTableSQL, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
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

  const createUsersTable = () => {
    return new Promise((resolve, reject) => {
      dbConn.run(createUsersTableSQL, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
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

  const createWorkflowsTable = () => {
    return new Promise((resolve, reject) => {
      dbConn.run(createWorkflowsTableSQL, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const deleteApplicationsSQL = `
    DELETE FROM applications
    WHERE
      rowid = ?`

  const deleteApplications = (applicationId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(deleteApplicationsSQL, applicationId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const deleteApplicationDeploymentsSQL = `
    DELETE FROM deployments
    WHERE
      role_id IN (SELECT rowid FROM roles WHERE application_id = ?)`

  const deleteApplicationDeployments = (applicationId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(deleteApplicationDeploymentsSQL, applicationId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const deleteApplicationReleaseSQL = `
    DELETE FROM releases
    WHERE
      rowid = ?`

  const deleteApplicationRelease = (releaseId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(deleteApplicationReleaseSQL, releaseId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const deleteApplicationReleasesSQL = `
    DELETE FROM releases
    WHERE
      application_id = ?`

  const deleteApplicationReleases = (applicationId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(deleteApplicationReleasesSQL, applicationId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const deleteApplicationRoleSQL = `
    DELETE FROM roles 
    WHERE 
      rowid = ?`

  const deleteApplicationRole = (roleId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(deleteApplicationRoleSQL, roleId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const deleteApplicationRolesSQL = `
    DELETE FROM roles
    WHERE
      application_id = ?`

  const deleteApplicationRoles = (applicationId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(deleteApplicationRolesSQL, applicationId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const deleteReleaseDeploymentsSQL = `
    DELETE FROM deployments
    WHERE 
      release_id = ?`

  const deleteReleaseDeployments = (releaseId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(deleteReleaseDeploymentsSQL, releaseId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const deleteRoleDeploymentsSQL = `
    DELETE FROM deployments
    WHERE
      rowid = ?`

  const deleteRoleDeployments = (roleId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(deleteRoleDeploymentsSQL, roleId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const deleteRoleWorkflowsSQL = `
    DELETE FROM workflows
    WHERE
      role_id = ?`

  const deleteRoleWorkflows = (roleId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(deleteRoleWorkflowsSQL, roleId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const deleteUserSQL = `
    DELETE FROM users
    WHERE
      rowid = ?`

  const deleteUser = (userId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(deleteUserSQL, userId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const deleteWorkflowSQL = `
    DELETE FROM workflows
    WHERE
      rowid = ?`

  const deleteWorkflow = (id) => {
    return new Promise((resolve, reject) => {
      dbConn.run(deleteWorkflowSQL, id, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const insertApplicationRoleSQL = `
    INSERT INTO roles (
      application_id, 
      role, 
      active_server,
      time_window
    ) VALUES (
      ?, ?, ?, ?
    )`

  const insertApplicationRole = (appId, roleParams) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertApplicationRoleSQL, appId, roleParams.role, roleParams.active_server, roleParams.time_window, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const insertApplicationSQL = `
    INSERT INTO applications (
      name
    ) VALUES (
      ?
    )`

  const insertApplication = (name) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertApplicationSQL, name, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
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

  const insertDeployment = (releaseId, roleId, userId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertDeploymentSQL, releaseId, roleId, userId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const insertReleaseSQL = `
    INSERT INTO releases (
      application_id, 
      version, 
      tarball, 
      seedfile,
      user_id,
      created_at
    ) VALUES (
      ?, ?, ?, ?, ?, DATETIME('now')
    )`

  const insertRelease = (appId, version, tarball, seedfile, userId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertReleaseSQL, appId, version, tarball, seedfile, userId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
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

  const insertUser = (userParams, encryptedPassword) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertUserSQL, userParams.email, userParams.name, userParams.user_role, userParams.enabled, encryptedPassword, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
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

  const insertWorkflow = (roleId, playbook, sequence, enforceTW, pause, finalStep) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertWorkflowSQL, roleId, playbook, sequence, enforceTW, pause, finalStep, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const prepDB = () => {
    return createUsersTable()
      .then(() => createApplicationsTable())
      .then(() => createRolesTable())
      .then(() => createReleasesTable())
      .then(() => createDeploymentsTable())
      .then(() => createWorkflowsTable())
      .then(() => foreignKeysOn())
  }

  const selectAllApplicationsSQL = `
    SELECT 
      rowid as id, 
      name 
    FROM 
      applications`

  const selectAllApplications = () => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectAllApplicationsSQL, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
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
      rels.version,
      apps.name
    FROM
      deployments deps INNER JOIN releases rels ON deps.release_id = rels.rowid
      INNER JOIN roles rols ON deps.role_id = rols.rowid
      INNER JOIN applications apps ON rels.application_id = apps.rowid
    WHERE
      deps.release_id = ?
      OR deps.role_id = ?`

  const selectDeployments = (releaseId, roleId) => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectDeploymentsSQL, releaseId, roleId, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
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

  const selectDeploymentByRoleRelease = (releaseId, roleId) => {
    return new Promise((resolve, reject) => {
      dbConn.get(selectDeploymentByRoleReleaseSQL, releaseId, roleId, (err, row) => {
        if (err) return reject(err)
        resolve(row)
      })
    })
  }

  const selectApplicationByIdSQL = `
    SELECT 
      rowid AS id, 
      name 
    FROM 
      applications 
    WHERE 
      rowid = ?`

  const selectApplicationById = (id) => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectApplicationByIdSQL, id, (err, rows) => {
        if (err) return reject(err)
        resolve(rows[0])
      })
    })
  }

  const selectApplicationReleaseIdsSQL = `
    SELECT
      rowid AS id
    FROM
      releases
    WHERE
      application_id = ?`

  const selectApplicationReleaseIds = (applicationId) => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectApplicationReleaseIdsSQL, applicationId, (err, rows) => {
        if (err) return reject(err)
        resolve(rows.map((rel) => rel.id))
      })
    })
  }

  const selectApplicationReleaseByIdSQL = `
    SELECT
      rowid AS id,
      application_id,
      version,
      tarball,
      seedfile,
      user_id,
      created_at
    FROM
      releases
    WHERE
      rowid = ?`

  const selectApplicationReleaseById = (id) => {
    return new Promise((resolve, reject) => {
      dbConn.get(selectApplicationReleaseByIdSQL, id, (err, row) => {
        if (err) return reject(err)
        resolve(row)
      })
    })
  }

  const selectApplicationReleasesSQL = `
    SELECT
      rowid AS id,
      application_id,
      version,
      tarball,
      seedfile,
      user_id,
      created_at
    FROM
      releases
    WHERE
      application_id = ?`

  const selectApplicationReleases = (appId) => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectApplicationReleasesSQL, appId, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
  }

  const selectApplicationReleaseByNameVersionSQL = `
    SELECT
      apps.rowid AS application_id,
      rels.rowid AS release_id
    FROM
      applications apps INNER JOIN releases rels ON rels.application_id = apps.rowid
    WHERE
      apps.name = ?
      AND rels.version = ?`

  const selectApplicationReleaseByNameVersion = (application, appVersion) => {
    return new Promise((resolve, reject) => {
      dbConn.get(selectApplicationReleaseByNameVersionSQL, application, appVersion, (err, row) => {
        if (err) return reject(err)
        resolve(row)
      })
    })
  }

  const selectApplicationRoleByAppRoleSQL = `
    SELECT
      apps.rowid AS application_id,
      rols.rowid AS role_id,
      rols.time_window
    FROM
      applications apps INNER JOIN roles rols ON rols.application_id = apps.rowid
    WHERE
      apps.name = ?
      AND rols.role = ?`

  const selectApplicationRoleByAppRole = (application, role) => {
    return new Promise((resolve, reject) => {
      dbConn.get(selectApplicationRoleByAppRoleSQL, application, role, (err, row) => {
        if (err) return reject(err)
        resolve(row)
      })
    })
  }

  const selectApplicationRoleByIdSQL = `
    SELECT 
      rowid AS id, 
      application_id, 
      role, 
      active_server,
      time_window
    FROM 
      roles 
    WHERE 
      rowid = ?`

  const selectApplicationRoleById = (id) => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectApplicationRoleByIdSQL, id, (err, rows) => {
        if (err) return reject(err)
        resolve(rows[0])
      })
    })
  }

  const selectApplicationRolesSQL = `
    SELECT 
      rowid AS id, 
      application_id, 
      role, 
      active_server,
      time_window
    FROM 
      roles 
    WHERE 
      application_id = ?`

  const selectApplicationRoles = (appId) => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectApplicationRolesSQL, appId, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
  }

  const selectLatestApplicationReleaseSQL = `
    SELECT 
      rowid AS id, 
      application_id, 
      version, 
      tarball, 
      seedfile,
      user_id,
      created_at 
    FROM 
      releases 
    WHERE 
      application_id = ? 
    ORDER BY 
      rowid DESC 
    LIMIT 1`

  const selectLatestApplicationRelease = (appId) => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectLatestApplicationReleaseSQL, appId, (err, rows) => {
        if (err) return reject(err)
        resolve(rows[0])
      })
    })
  }

  const selectLatestApplicationRoleSQL = `
    SELECT 
      rowid AS id, 
      application_id, 
      role, 
      active_server,
      time_window
    FROM 
      roles 
    WHERE 
      application_id = ? 
    ORDER BY 
      rowid DESC 
    LIMIT 1`

  const selectLatestApplicationRole = (appId) => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectLatestApplicationRoleSQL, appId, (err, rows) => {
        if (err) return reject(err)
        resolve(rows[0])
      })
    })
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

  const selectLatestApplication = () => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectLatestApplicationSQL, (err, rows) => {
        if (err) return reject(err)
        resolve(rows[0])
      })
    })
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

  const selectLatestDeployment = () => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectLatestDeploymentSQL, (err, rows) => {
        if (err) return reject(err)
        resolve(rows[0])
      })
    })
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

  const selectLatestUser = () => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectLatestUserSQL, (err, rows) => {
        if (err) return reject(err)
        resolve(rows[0])
      })
    })
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

  const selectLatestWorkflow = () => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectLatestWorkflowSQL, (err, rows) => {
        if (err) return reject(err)
        resolve(rows[0])
      })
    })
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

  const selectUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
      dbConn.get(selectUserByEmailSQL, email, (err, row) => {
        if (err) return reject(err)
        resolve(row)
      })
    })
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

  const selectUserById = (id) => {
    return new Promise((resolve, reject) => {
      dbConn.get(selectUserByIdSQL, id, (err, row) => {
        if (err) return reject(err)
        resolve(row)
      })
    })
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

  const selectUsers = () => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectUsersSQL, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
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

  const selectWorkflowById = (id) => {
    return new Promise((resolve, reject) => {
      dbConn.get(selectWorkflowByIdSQL, id, (err, row) => {
        if (err) return reject(err)
        resolve(row)
      })
    })
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

  const selectWorkflowByRoleSequence = (roleId, sequence) => {
    return new Promise((resolve, reject) => {
      dbConn.get(selectWorkflowByRoleSequenceSQL, roleId, sequence, (err, row) => {
        if (err) return reject(err)
        resolve(row)
      })
    })
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

  const selectWorkflows = () => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectWorkflowsSQL, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
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

  const selectRoleWorkflows = (roleId) => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectRoleWorkflowsSQL, roleId, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
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

  const selectNextRoleWorkflow = (roleId, sequence) => {
    return new Promise((resolve, reject) => {
      dbConn.all(selectNextRoleWorkflowSQL, roleId, sequence, (err, rows) => {
        if (err) return reject(err)
        resolve(rows[0])
      })
    })
  }

  const updateApplicationSQL = `
    UPDATE applications SET 
      name = ? 
    WHERE 
      rowid = ?`

  const updateApplication = (id, appParams) => {
    return new Promise((resolve, reject) => {
      dbConn.run(updateApplicationSQL, appParams.name, id, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const updateApplicationReleaseSQL = `
    UPDATE releases SET
      application_id = ?,
      version = ?,
      user_id = ?
    WHERE
      rowid = ?`

  const updateApplicationRelease = (appId, releaseId, releaseParams, userId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(updateApplicationReleaseSQL, appId, releaseParams.version, userId, releaseId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const updateApplicationRoleSQL = `
    UPDATE roles SET 
      application_id = ?, 
      role = ?, 
      active_server = ?,
      time_window = ?
    WHERE 
      rowid = ?`

  const updateApplicationRole = (appId, roleId, roleParams) => {
    return new Promise((resolve, reject) => {
      dbConn.run(updateApplicationRoleSQL, appId, roleParams.role, roleParams.active_server, roleParams.time_window, roleId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const updateDeploymentIncrementStepSQL = `
    UPDATE deployments SET
      user_id = ?,
      step = step + 1,
      status = 0,
      message = NULL
    WHERE
      rowid = ?`

  const updateDeploymentIncrementStep = (id, userId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(updateDeploymentIncrementStepSQL, userId, id, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const updateDeploymentStatusSQL = `
    UPDATE deployments SET
      status = ?,
      message = ?
    WHERE
      rowid = ?`

  const updateDeploymentStatus = (id, status, message) => {
    return new Promise((resolve, reject) => {
      dbConn.run(updateDeploymentStatusSQL, status, message, id, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const updateDeploymentOverrideTokenSQL = `
    UPDATE deployments SET
      override_token = ?
    WHERE
      rowid = ?`

  const updateDeploymentOverrideToken = (id, token) => {
    return new Promise((resolve, reject) => {
      dbConn.run(updateDeploymentOverrideTokenSQL, token, id, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const updateUserSQL = `
    UPDATE users SET
      name = ?,
      user_role = ?,
      enabled = ?
    WHERE
      rowid = ?`

  const updateUser = (userId, userParams, enabled) => {
    return new Promise((resolve, reject) => {
      dbConn.run(updateUserSQL, userParams.name, userParams.user_role, enabled, userId, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
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

  const updateWorkflow = (id, roleId, playbook, sequence, enforceTW, pause, finalStep) => {
    return new Promise((resolve, reject) => {
      dbConn.run(updateWorkflowSQL, roleId, playbook, sequence, enforceTW, pause, finalStep, id, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  const foreignKeysOnSQL = `
    PRAGMA foreign_keys = ON`

  const foreignKeysOn = () => {
    return new Promise((resolve, reject) => {
      dbConn.run(foreignKeysOnSQL, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
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
    selectLatestApplication: selectLatestApplication,
    selectLatestApplicationRelease: selectLatestApplicationRelease,
    selectLatestApplicationRole: selectLatestApplicationRole,
    selectLatestDeployment: selectLatestDeployment,
    selectLatestUser: selectLatestUser,
    selectLatestWorkflow: selectLatestWorkflow,
    selectNextRoleWorkflow: selectNextRoleWorkflow,
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
