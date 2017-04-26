// Determines if role is in current rolelist
// @props Object with roles property or an array with a list of roles
// @role Object of type UserRoles
// @return true if this role is indeed present in the role list
export const CheckIfUserHasRole = (props, role) => {
  const roles = props.roles ? props.roles : props;
  if (!(roles instanceof Array)) {
    return false;
  }
  return roles.some((item) => item === role);
};
