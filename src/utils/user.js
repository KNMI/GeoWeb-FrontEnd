// ========================================================
// User functions
// Use :
//
// import { UserRoles } from ../constants/UserRoles
// import { CheckIfUserHasRole } from '../utils/user';
//
// console.log('Is ADMIN:', CheckIfUserHasRole(this.props, UserRoles.ADMIN));
// console.log('Is MET:', CheckIfUserHasRole(this.props, UserRoles.MET));
// console.log('Is USER:', CheckIfUserHasRole(this.props, UserRoles.USER));
// ========================================================

// Determines if role is in current rolelist
// @props Object with roles property or an array with a list of roles
// @role Object of type UserRoles
// @return true if this role is indeed present in the role list
export const CheckIfUserHasRole = (props, role) => {
  let roles = props.roles ? props.roles : props;
  if (!(roles instanceof Array)) {
    return false;
  }
  return roles.some((item) => item === role);
};
