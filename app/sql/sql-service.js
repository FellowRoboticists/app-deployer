'use strict'

module.exports = (function () {
  const dbConn = require('../utility/db').conn()

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

  const insertApplicationRoleSQL = `
    INSERT INTO roles (
      application_id, 
      role, 
      active_server,
      time_window,
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
      override_token, 
      status, 
      created_at
    ) VALUES (
      ?,?,?,0,DATETIME('now')
    )`

  const insertDeployment = (releaseId, roleId, deployAt) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertDeploymentSQL, releaseId, roleId, deployAt, (err) => {
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
      created_at
    ) VALUES (
      ?, ?, ?, DATETIME('now')
    )`

  const insertRelease = (appId, version, tarball) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertReleaseSQL, appId, version, tarball, (err) => {
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

  const selectUserByEmailSQL = `
    SELECT
      email,
      password,
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

  var mod = {
    deleteApplications: deleteApplications,
    deleteApplicationDeployments: deleteApplicationDeployments,
    deleteApplicationRelease: deleteApplicationRelease,
    deleteApplicationReleases: deleteApplicationReleases,
    deleteApplicationRole: deleteApplicationRole,
    deleteApplicationRoles: deleteApplicationRoles,
    deleteReleaseDeployments: deleteReleaseDeployments,
    deleteRoleDeployments: deleteRoleDeployments,
    insertApplication: insertApplication,
    insertApplicationRole: insertApplicationRole,
    insertDeployment: insertDeployment,
    insertRelease: insertRelease,
    selectAllApplications: selectAllApplications,
    selectApplicationById: selectApplicationById,
    selectApplicationReleaseById: selectApplicationReleaseById,
    selectApplicationReleaseIds: selectApplicationReleaseIds,
    selectApplicationReleases: selectApplicationReleases,
    selectApplicationRoleById: selectApplicationRoleById,
    selectApplicationRoles: selectApplicationRoles,
    selectLatestApplication: selectLatestApplication,
    selectLatestApplicationRelease: selectLatestApplicationRelease,
    selectLatestApplicationRole: selectLatestApplicationRole,
    selectUserByEmail: selectUserByEmail,
    updateApplication: updateApplication,
    updateApplicationRelease: updateApplicationRelease,
    updateApplicationRole: updateApplicationRole
  }

  return mod
}())
