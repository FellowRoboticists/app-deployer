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
      created_at
    ) VALUES (
      ?,?,0,0,DATETIME('now')
    )`

  const insertDeployment = (releaseId, roleId) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertDeploymentSQL, releaseId, roleId, (err) => {
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
      created_at
    ) VALUES (
      ?, ?, ?, ?, DATETIME('now')
    )`

  const insertRelease = (appId, version, tarball, seedfile) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertReleaseSQL, appId, version, tarball, seedfile, (err) => {
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
      password
    ) VALUES (
      ?, ?, ?, ?
    )`

  const insertUser = (userParams, encryptedPassword) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertUserSQL, userParams.email, userParams.name, userParams.user_role, encryptedPassword, (err) => {
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
      user_role
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
      user_role
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
      user_role
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
      version = ?
    WHERE
      rowid = ?`

  const updateApplicationRelease = (appId, releaseId, releaseParams) => {
    return new Promise((resolve, reject) => {
      dbConn.run(updateApplicationReleaseSQL, appId, releaseParams.version, releaseId, (err) => {
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

  const updateUserSQL = `
    UPDATE users SET
      name = ?,
      user_role = ?
    WHERE
      rowid = ?`

  const updateUser = (userId, userParams) => {
    return new Promise((resolve, reject) => {
      dbConn.run(updateUserSQL, userParams.name, userParams.user_role, userId, (err) => {
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

  var mod = {
    changeUserPassword: changeUserPassword,
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
    insertApplication: insertApplication,
    insertApplicationRole: insertApplicationRole,
    insertDeployment: insertDeployment,
    insertRelease: insertRelease,
    insertUser: insertUser,
    insertWorkflow: insertWorkflow,
    selectAllApplications: selectAllApplications,
    selectApplicationById: selectApplicationById,
    selectApplicationReleaseById: selectApplicationReleaseById,
    selectApplicationReleaseIds: selectApplicationReleaseIds,
    selectApplicationReleases: selectApplicationReleases,
    selectApplicationRoleById: selectApplicationRoleById,
    selectApplicationRoles: selectApplicationRoles,
    selectDeployments: selectDeployments,
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
    selectWorkflows: selectWorkflows,
    updateApplication: updateApplication,
    updateApplicationRelease: updateApplicationRelease,
    updateApplicationRole: updateApplicationRole,
    updateUser: updateUser,
    updateWorkflow: updateWorkflow
  }

  return mod
}())
