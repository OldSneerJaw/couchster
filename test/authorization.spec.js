const { expect } = require('chai');
const testHelper = require('../src/testing/test-helper');

describe('Authorization:', () => {

  beforeEach(() => {
    testHelper.initValidationFunction('build/validation-functions/test-authorization-validation-function.js');
  });

  describe('for a document with explicit role definitions', () => {
    it('allows document creation for a user that is specified as a database administrator by username', () => {
      const doc = { _id: 'explicitRolesDoc', stringProp: 'foobar' };

      testHelper.validationFunction(
        doc,
        void 0,
        { name: 'me' },
        {
          admins: { names: [ 'me' ] }
        });
    });

    it('rejects document creation for a user with no matching add roles', () => {
      const doc = { _id: 'explicitRolesDoc', stringProp: 'foobar' };

      testHelper.verifyAccessDenied(doc, void 0, { name: 'me', roles: [ 'replace', 'update', 'remove', 'delete' ] });
    });

    it('rejects document creation if the user context is null', () => {
      const doc = { _id: 'explicitRolesDoc', stringProp: 'foobar' };

      verifyUnauthorizedError(doc, null);
    });

    it('rejects document replacement for a user with no matching replace roles', () => {
      const doc = { _id: 'explicitRolesDoc', stringProp: 'foobar' };
      const oldDoc = { _id: 'explicitRolesDoc' };

      testHelper.verifyAccessDenied(doc, oldDoc, { name: 'me', roles: [ 'add', 'remove', 'delete' ] });
    });

    it('rejects document deletion for a user with no matching remove roles', () => {
      const doc = { _id: 'explicitRolesDoc', _deleted: true };

      testHelper.verifyAccessDenied(doc, void 0, { name: 'me', roles: [ 'add', 'replace', 'update' ] });
    });
  });

  describe('for a document with only the write roles defined', () => {
    it('allows document replacement for a user that is specified as a database administrator by role', () => {
      const doc = { _id: 'writeOnlyRolesDoc', stringProp: 'foobar' };
      const oldDoc = { _id: 'writeOnlyRolesDoc' };

      testHelper.validationFunction(
        doc,
        oldDoc,
        {
          name: 'me',
          roles: [ 'administrators-role' ]
        },
        {
          admins: { roles: [ 'administrators-role' ] }
        });
    });

    it('rejects document creation for a user with no matching roles', () => {
      const doc = { _id: 'writeOnlyRolesDoc', stringProp: 'foobar' };

      testHelper.verifyAccessDenied(doc, void 0, { name: 'me', roles: [ 'invalid' ] });
    });

    it('rejects document replacement for a user with no matching roles', () => {
      const doc = { _id: 'writeOnlyRolesDoc', stringProp: 'foobar' };
      const oldDoc = { _id: 'writeOnlyRolesDoc' };

      testHelper.verifyAccessDenied(doc, oldDoc, { name: 'me', roles: [ ] });
    });

    it('rejects document deletion for a user with no matching roles', () => {
      const doc = { _id: 'writeOnlyRolesDoc', _deleted: true };

      testHelper.verifyAccessDenied(doc, void 0, { name: 'me', roles: [ '', ' ' ] });
    });

    it('rejects document deletion if the user context is null', () => {
      const doc = { _id: 'writeOnlyRolesDoc', _deleted: true };
      const oldDoc = { _id: 'writeOnlyRolesDoc', stringProp: 'foobar' };

      verifyUnauthorizedError(doc, oldDoc);
    });
  });

  describe('for a document with write roles and an explicit add role defined', () => {
    it('allows document addition for a user with only the add role', () => {
      const doc = { _id: 'writeAndAddRolesDoc' };

      testHelper.validationFunction(doc, void 0, { name: 'me', roles: [ 'add' ] });
    });

    it('rejects document replacement for a user with only the add role', () => {
      const doc = {
        _id: 'writeAndAddRolesDoc',
        stringProp: 'foobar'
      };
      const oldDoc = { _id: 'writeAndAddRolesDoc' };

      testHelper.verifyAccessDenied(doc, oldDoc, { name: 'me', roles: [ 'add' ] });
    });

    it('rejects document deletion for a user with only the add role', () => {
      const doc = {
        _id: 'writeAndAddRolesDoc',
        _deleted: true
      };
      const oldDoc = { _id: 'writeAndAddRolesDoc' };

      testHelper.verifyAccessDenied(doc, oldDoc, { name: 'me', roles: [ 'add' ] });
    });
  });

  describe('for a document with dynamically-assigned roles and users', () => {
    const expectedWriteRoles = [ 'write-role1', 'write-role2' ];
    const expectedWriteUsers = [ 'write-user1', 'write-user2' ];

    it('allows document creation for a user with a matching username', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        stringProp: 'foobar',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testHelper.validationFunction(doc, void 0, { name: 'write-user1' });
    });

    it('allows document replacement for a user with a matching role', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'dynamicRolesAndUsersDoc',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testHelper.validationFunction(doc, oldDoc, { name: 'me', roles: [ 'write-role2' ] });
    });

    it('allows document deletion for a server admin user', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'dynamicRolesAndUsersDoc',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testHelper.validationFunction(doc, oldDoc, { name: 'me', roles: [ '_admin' ] });
    });

    it('rejects document creation for a user with no matching roles or username', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        stringProp: 'foobar',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testHelper.verifyAccessDenied(doc, null, { name: 'me', roles: [ 'write-role-3' ] });
    });

    it('rejects document replacement for a user with no matching roles or username', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'dynamicRolesAndUsersDoc',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testHelper.verifyAccessDenied(doc, oldDoc, { name: 'me', roles: [ 'write-role-3' ] });
    });

    it('rejects document replacement if the user context is null', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'dynamicRolesAndUsersDoc',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      verifyUnauthorizedError(doc, oldDoc);
    });

    it('rejects document deletion for a user with no matching roles or username', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'dynamicRolesAndUsersDoc',
        roles: expectedWriteRoles,
        users: expectedWriteUsers
      };

      testHelper.verifyAccessDenied(doc, oldDoc, { name: 'me', roles: [ 'write-role-3' ] });
    });
  });

  describe('for a document with explicitly-assigned users', () => {
    it('rejects document creation for a user without a matching username', () => {
      const doc = {
        _id: 'explicitUsernamesDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyAccessDenied(doc, null, { name: 'replace1' });
    });

    it('rejects document replacement for a user without a matching username', () => {
      const doc = {
        _id: 'explicitUsernamesDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'explicitUsernamesDoc'
      };

      testHelper.verifyAccessDenied(doc, oldDoc, { name: 'add2' });
    });

    it('rejects document deletion for a user without a matching username', () => {
      const doc = {
        _id: 'explicitUsernamesDoc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'explicitUsernamesDoc'
      };

      testHelper.verifyAccessDenied(doc, oldDoc, { name: 'add1' });
    });
  });

  describe('for a document with statically-assigned replace role and nothing else', () => {
    const userContext = { name: 'me', roles: [ 'replace' ] };

    it('rejects document creation', () => {
      const doc = {
        _id: 'replaceOnlyRoleDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyAccessDenied(doc, null, userContext);
    });

    it('allows document replacement', () => {
      const doc = {
        _id: 'replaceOnlyRoleDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'replaceOnlyRoleDoc',
        stringProp: 'barfoo'
      };

      testHelper.validationFunction(doc, oldDoc, userContext);
    });

    it('rejects document deletion', () => {
      const doc = {
        _id: 'replaceOnlyRoleDoc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'replaceOnlyRoleDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyAccessDenied(doc, oldDoc, userContext);
    });
  });

  describe('for a document with statically-assigned add role and nothing else', () => {
    const userContext = { name: 'me', roles: [ 'add' ] };

    it('allows document creation', () => {
      const doc = {
        _id: 'addOnlyRoleDoc',
        stringProp: 'foobar'
      };

      testHelper.validationFunction(doc, void 0, userContext);
    });

    it('rejects document replacement', () => {
      const doc = {
        _id: 'addOnlyRoleDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'addOnlyRoleDoc',
        stringProp: 'barfoo'
      };

      testHelper.verifyAccessDenied(doc, oldDoc, userContext);
    });

    it('rejects document deletion', () => {
      const doc = {
        _id: 'addOnlyRoleDoc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'addOnlyRoleDoc',
        stringProp: 'foobar'
      };

      testHelper.verifyAccessDenied(doc, oldDoc, userContext);
    });
  });

  function verifyUnauthorizedError(doc, oldDoc) {
    let validationFuncError = null;
    expect(() => {
      try {
        testHelper.validationFunction(doc, oldDoc, null);
      } catch (ex) {
        validationFuncError = ex;
        throw ex;
      }
    }).to.throw();

    expect(validationFuncError).to.eql({ unauthorized: 'Not authenticated' });
  }
});
