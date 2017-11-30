-- 
-- Seed the app-deployer database.
--

-- Applications
INSERT INTO applications (
  name
) VALUES (
  'abaqis' -- 1
), (
  'ese' -- 2
), (
  'rqi' -- 3
);

-- Roles
INSERT INTO roles (
  application_id, role, active_server, time_window
) VALUES (
  1, 'uat', 'uat.abaqis.com', '* * * * *'
), (
  1, 'test', 'test.abaqis.com', '* * * * *'
), (
  1, 'demo', 'ping.abaqis.com', '* 17-21 * * 4'
), (
  1, 'training', 'quincy.abaqis.com', '* 20-21 * * 4'
), (
  1, 'production', 'ares.abaqis.com', '* 20-21 * * 4'
), (
  2, 'uat', 'uat.abaqis.com', '* * * * *'
), (
  2, 'demo', 'ping.abaqis.com', '* 17-21 * * 4'
), (
  2, 'production', 'ares.abaqis.com', '* 20-21 * * 4'
), (
  3, 'uat', 'mohontariotw.abaqis.com', '* * * * *'
), (
  3, 'production', 'mohontariopw.abaqis.com', '* 17-21 * * 5'
);

-- Workflows
INSERT INTO workflows (
  role_id, playbook, sequence, enforce_tw, pause_after, final
) VALUES (
  1, 'copy_code', 1, 0, 1, 0
), (
  1, 'stop_application', 2, 1, 0, 0
), (
  1, 'update_rpms', 3, 1, 0, 0
), (
  1, 'activate', 4, 1, 0, 0
), (
  1, 'db_migration', 5, 1, 0, 0
), (
  1, 'restart_application', 6, 1, 0, 1
), (
  2, 'copy_code', 1, 0, 1, 0
), (
  2, 'stop_application', 2, 1, 0, 0
), (
  2, 'update_rpms', 3, 1, 0, 0
), (
  2, 'activate', 4, 1, 0, 0
), (
  2, 'db_migration', 5, 1, 0, 0
), (
  2, 'restart_application', 6, 1, 0, 1
), (
  3, 'copy_code', 1, 0, 1, 0
), (
  3, 'stop_application', 2, 1, 0, 0
), (
  3, 'update_rpms', 3, 1, 0, 0
), (
  3, 'activate', 4, 1, 0, 0
), (
  3, 'db_migration', 5, 1, 0, 0
), (
  3, 'restart_application', 6, 1, 0, 1
), (
  4, 'copy_code', 1, 0, 1, 0
), (
  4, 'stop_application', 2, 1, 0, 0
), (
  4, 'update_rpms', 3, 1, 0, 0
), (
  4, 'activate', 4, 1, 0, 0
), (
  4, 'db_migration', 5, 1, 0, 0
), (
  4, 'restart_application', 6, 1, 0, 1
), (
  5, 'copy_code', 1, 0, 1, 0
), (
  5, 'maintenance_page', 2, 1, 0, 0
), (
  5, 'stop_application', 3, 1, 0, 0
), (
  5, 'update_rpms', 4, 1, 0, 0
), (
  5, 'activate', 5, 1, 0, 0
), (
  5, 'db_migration', 6, 1, 0, 0
), (
  5, 'restart_application', 7, 1, 1, 0
), (
  5, 'remove_maintenance_page', 8, 1, 0, 1
), (
  6, 'copy_code', 1, 0, 1, 0
), (
  6, 'stop_application', 2, 1, 0, 0
), (
  6, 'update_rpms', 3, 1, 0, 0
), (
  6, 'activate', 4, 1, 0, 0
), (
  6, 'db_migration', 5, 1, 0, 0
), (
  6, 'restart_application', 6, 1, 0, 1
), (
  7, 'copy_code', 1, 0, 1, 0
), (
  7, 'stop_application', 2, 1, 0, 0
), (
  7, 'update_rpms', 3, 1, 0, 0
), (
  7, 'activate', 4, 1, 0, 0
), (
  7, 'db_migration', 5, 1, 0, 0
), (
  7, 'restart_application', 6, 1, 0, 1
), (
  8, 'copy_code', 1, 0, 1, 0
), (
  8, 'stop_application', 2, 1, 0, 0
), (
  8, 'update_rpms', 3, 1, 0, 0
), (
  8, 'activate', 4, 1, 0, 0
), (
  8, 'db_migration', 5, 1, 0, 0
), (
  8, 'restart_application', 6, 1, 0, 1
), (
  9, 'copy_code', 1, 0, 1, 0
), (
  9, 'stop_application', 2, 1, 0, 0
), (
  9, 'update_rpms', 3, 1, 0, 0
), (
  9, 'activate', 4, 1, 0, 0
), (
  9, 'db_migration', 5, 1, 0, 0
), (
  9, 'restart_application', 6, 1, 0, 1
), (
  10, 'copy_code', 1, 0, 1, 0
), (
  10, 'stop_application', 2, 1, 0, 0
), (
  10, 'update_rpms', 3, 1, 0, 0
), (
  10, 'activate', 4, 1, 0, 0
), (
  10, 'db_migration', 5, 1, 0, 0
), (
  10, 'restart_application', 6, 1, 0, 1
);
