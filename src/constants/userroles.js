
// List of possible roles mapped to strings. Strings match with values given by backend
export const UserRoles = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MET: 'MET',
  TEST: 'test',
  TAF_EDIT: 'TAF_edit',
  TAF_READ: 'TAF_read',
  TAF_SETTINGS_EDIT: 'TAF_settings_edit',
  TAF_SETTINGS_READ: 'TAF_settings_read',
  SIGMET_EDIT: 'SIGMET_edit',
  SIGMET_READ: 'SIGMET_read',
  SIGMET_SETTINGS_EDIT: 'SIGMET_settings_edit',
  SIGMET_SETTINGS_READ: 'SIGMET_settings_read',
  AIRMET_EDIT: 'AIRMET_edit',
  AIRMET_READ: 'AIRMET_read',
  AIRMET_SETTINGS_EDIT: 'AIRMET_settings_edit',
  AIRMET_SETTINGS_READ: 'AIRMET_settings_read'
};

export const UserRoleLists = {
  METEOROLOGIST: [
    UserRoles.MET,
    UserRoles.TAF_EDIT,
    UserRoles.TAF_READ,
    UserRoles.TAF_SETTINGS_EDIT,
    UserRoles.TAF_SETTINGS_READ,
    UserRoles.SIGMET_EDIT,
    UserRoles.SIGMET_READ,
    UserRoles.SIGMET_SETTINGS_EDIT,
    UserRoles.SIGMET_SETTINGS_READ,
    UserRoles.AIRMET_EDIT,
    UserRoles.AIRMET_READ,
    UserRoles.AIRMET_SETTINGS_EDIT,
    UserRoles.AIRMET_SETTINGS_READ
  ]
};
