// Determines if role is in current rolelist
// @props Object with roles property or an array with a list of roles
// @role Object of type UserRoles or array of role objects.
// @return true if this role is indeed present in the role list
export const CheckIfUserHasRole = (props, roleOrRoleList) => {
  const roles = props.roles ? props.roles : props;
  if (!(roles instanceof Array)) {
    return false;
  }
  if ((roleOrRoleList instanceof Array)) {
    for (let j = 0; j < roleOrRoleList.length; j++) {
      const role = roleOrRoleList[j];
      if (roles.some(item => item === role)) {
        return true;
      }
    };
  } else {
    return roles.some(item => item === roleOrRoleList);
  }
};
