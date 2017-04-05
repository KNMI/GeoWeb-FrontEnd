// ========================================================
// User functions
// Use :
//
// import { UserRoles, CheckIfUserHasRole } from 'user';
//
// console.log('Is ADMIN:', CheckIfUserHasRole(this.props, UserRoles.ADMIN));
// console.log('Is MET:', CheckIfUserHasRole(this.props, UserRoles.MET));
// console.log('Is USER:', CheckIfUserHasRole(this.props, UserRoles.USER));
// ========================================================

// List of possible roles mapped to strings. Strings match with values given by backend
export const UserRoles = {
  USER:'USER',
  ADMIN:'ADMIN',
  MET:'MET'
};

// Determines if role is in current rolelist
// @props Object with roles property or an array with a list of roles
// @role Object of type UserRoles
// @return true if this role is indeed present in the role list
export const CheckIfUserHasRole = (props, role) => {
  let roles = props.roles ? props.roles : props;
  for (let j = 0; j < roles.length; j++) {
    if (role === roles[j]) {
      return true;
    }
  }
  return false;
};
