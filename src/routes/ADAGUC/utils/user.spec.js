import { UserRoles, CheckIfUserHasRole } from './user';

describe('(Utils) user', () => {
  it('Checks if ADMIN role is found', () => {
    const testProp = {
      userName: 'test',
      roles: [UserRoles.USER, UserRoles.ADMIN]
    };
    expect(CheckIfUserHasRole(testProp, UserRoles.ADMIN)).to.equal(true);
  });
  it('Checks if ADMIN role is NOT found', () => {
    const testProp = {
      userName: 'test',
      roles: [UserRoles.USER]
    };
    expect(CheckIfUserHasRole(testProp, UserRoles.ADMIN)).to.equal(false);
  });
  it('Checks if false is returned when no roles are given.', () => {
    const testProp = {
      userName: 'test'
    };
    expect(CheckIfUserHasRole(testProp, UserRoles.ADMIN)).to.equal(false);
  });
});
