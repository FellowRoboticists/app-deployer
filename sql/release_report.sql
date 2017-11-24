-- 
-- This SELECT will be used to report on deployments for any particular
-- application or role.
--
SELECT
  app.name AS app_name,
  rel.version,
  rol.role,
  CASE dep.deploy_at
    WHEN 0 THEN 'Deferred'
    WHEN 1 THEN 'Immediate'
    ELSE 'Invalid deploy_at'
  END AS deploy_at,
  CASE dep.status
    WHEN 0 THEN 'New'
    WHEN 1 THEN 'In Process'
    WHEN 2 THEN 'Completed - Success'
    WHEN 3 THEN 'Completed - Error'
    ELSE 'Invalid Status'
  END AS status,
  rel.created_at AS release_created_at,
  dep.created_at AS deploy_created_at
FROM
  releases AS rel INNER JOIN deployments AS dep ON rel.rowid = dep.release_id
  INNER JOIN applications AS app ON app.rowid = rel.application_id
  INNER JOIN roles AS rol ON rol.rowid = role_id
