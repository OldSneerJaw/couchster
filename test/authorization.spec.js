const { expect } = require('chai');
const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Authorization:', () => {
  const testFixture =
    testFixtureMaker.initFromValidationFunction('build/validation-functions/test-authorization-validation-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('for a document with explicit role definitions', () => {
    it('allows document creation for a user that is specified as a database administrator by username', () => {
      const doc = { _id: 'explicitRolesDoc', stringProp: 'foobar' };

      testFixture.testEnvironment.validationFunction(
        doc,
        void 0,
        { name: 'me' },
        {
          admins: { names: [ 'me' ] }
        });
    });

    it('rejects document creation for a user with no matching add roles', () => {
      const doc = { _id: 'explicitRolesDoc', stringProp: 'foobar' };

      testFixture.verifyAccessDenied(doc, void 0, { name: 'me', roles: [ 'replace', 'update', 'remove', 'delete' ] });
    });

    it('rejects document creation if the user context is null', () => {
      const doc = { _id: 'explicitRolesDoc', stringProp: 'foobar' };

      verifyUnauthorizedError(doc, null);
    });

    it('rejects document replacement for a user with no matching replace roles', () => {
      const doc = { _id: 'explicitRolesDoc', stringProp: 'foobar' };
      const oldDoc = { _id: 'explicitRolesDoc' };

      testFixture.verifyAccessDenied(doc, oldDoc, { name: 'me', roles: [ 'add', 'remove', 'delete' ] });
    });

    it('rejects document deletion for a user with no matching remove roles', () => {
      const doc = { _id: 'explicitRolesDoc', _deleted: true };

      testFixture.verifyAccessDenied(doc, void 0, { name: 'me', roles: [ 'add', 'replace', 'update' ] });
    });
  });

  describe('for a document with only the write roles defined', () => {
    it('allows document replacement for a user that is specified as a database administrator by role', () => {
      const doc = { _id: 'writeOnlyRolesDoc', stringProp: 'foobar' };
      const oldDoc = { _id: 'writeOnlyRolesDoc' };

      testFixture.testEnvironment.validationFunction(
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

      testFixture.verifyAccessDenied(doc, void 0, { name: 'me', roles: [ 'invalid' ] });
    });

    it('rejects document replacement for a user with no matching roles', () => {
      const doc = { _id: 'writeOnlyRolesDoc', stringProp: 'foobar' };
      const oldDoc = { _id: 'writeOnlyRolesDoc' };

      testFixture.verifyAccessDenied(doc, oldDoc, { name: 'me', roles: [ ] });
    });

    it('rejects document deletion for a user with no matching roles', () => {
      const doc = { _id: 'writeOnlyRolesDoc', _deleted: true };

      testFixture.verifyAccessDenied(doc, void 0, { name: 'me', roles: [ '', ' ' ] });
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

      testFixture.testEnvironment.validationFunction(doc, void 0, { name: 'me', roles: [ 'add' ] });
    });

    it('rejects document replacement for a user with only the add role', () => {
      const doc = {
        _id: 'writeAndAddRolesDoc',
        stringProp: 'foobar'
      };
      const oldDoc = { _id: 'writeAndAddRolesDoc' };

      testFixture.verifyAccessDenied(doc, oldDoc, { name: 'me', roles: [ 'add' ] });
    });

    it('rejects document deletion for a user with only the add role', () => {
      const doc = {
        _id: 'writeAndAddRolesDoc',
        _deleted: true
      };
      const oldDoc = { _id: 'writeAndAddRolesDoc' };

      testFixture.verifyAccessDenied(doc, oldDoc, { name: 'me', roles: [ 'add' ] });
    });
  });

  describe('for a document with dynamically-assigned roles and users', () => {
    const testDbName = 'my-db';
    const rawRoles = [ 'write-role1', 'write-role2' ];
    const rawUsers = [ 'write-user1', 'write-user2' ];
    const expectedSuccessfulAuthorization = {
      expectedDbName: testDbName,
      expectedUsers: rawUsers.map((username) => `${testDbName}-${username}`),
      expectedRoles: rawRoles.map((role) => `${testDbName}-${role}`)
    };

    it('allows document creation for a user with a matching username', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        stringProp: 'foobar',
        roles: rawRoles,
        users: rawUsers
      };

      testFixture.verifyDocumentCreated(doc, expectedSuccessfulAuthorization);
    });

    it('allows document replacement for a user with a matching role', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'dynamicRolesAndUsersDoc',
        roles: rawRoles,
        users: rawUsers
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc, expectedSuccessfulAuthorization);
    });

    it('allows document deletion for a server admin user', () => {
      const oldDoc = {
        _id: 'dynamicRolesAndUsersDoc',
        roles: rawRoles,
        users: rawUsers
      };

      testFixture.verifyDocumentDeleted(oldDoc, expectedSuccessfulAuthorization);
    });

    it('rejects document creation for a user with no matching roles or username', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        stringProp: 'foobar',
        roles: rawRoles,
        users: rawUsers
      };

      // The user context matches raw username and role, but the authorization functions expect them to be prefixed with the DB name
      testFixture.verifyAccessDenied(doc, null, { db: testDbName, name: 'write-user1', roles: [ 'write-role1' ] });
    });

    it('rejects document replacement for a user with no matching roles or username', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'dynamicRolesAndUsersDoc',
        roles: rawRoles,
        users: rawUsers
      };

      // The user context matches raw username and role, but the authorization functions expect them to be prefixed with the DB name
      testFixture.verifyAccessDenied(doc, oldDoc, { db: testDbName, name: 'write-user2', roles: [ 'write-role2' ] });
    });

    it('rejects document replacement if the user context is null', () => {
      const doc = {
        _id: 'dynamicRolesAndUsersDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'dynamicRolesAndUsersDoc',
        roles: rawRoles,
        users: rawUsers
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
        roles: rawRoles,
        users: rawUsers
      };

      // The user context matches raw username and role, but the authorization functions expect them to be prefixed with the DB name
      testFixture.verifyAccessDenied(doc, oldDoc, { name: 'write-user1', roles: [ 'write-role2' ] });
    });
  });

  describe('for a document with explicitly-assigned users', () => {
    it('rejects document creation for a user without a matching username', () => {
      const doc = {
        _id: 'explicitUsernamesDoc',
        stringProp: 'foobar'
      };

      testFixture.verifyAccessDenied(doc, null, { name: 'replace1' });
    });

    it('rejects document replacement for a user without a matching username', () => {
      const doc = {
        _id: 'explicitUsernamesDoc',
        stringProp: 'foobar'
      };
      const oldDoc = {
        _id: 'explicitUsernamesDoc'
      };

      testFixture.verifyAccessDenied(doc, oldDoc, { name: 'add2' });
    });

    it('rejects document deletion for a user without a matching username', () => {
      const doc = {
        _id: 'explicitUsernamesDoc',
        _deleted: true
      };
      const oldDoc = {
        _id: 'explicitUsernamesDoc'
      };

      testFixture.verifyAccessDenied(doc, oldDoc, { name: 'add1' });
    });
  });

  describe('for a document with statically-assigned replace role and nothing else', () => {
    const userContext = { name: 'me', roles: [ 'replace' ] };

    it('rejects document creation', () => {
      const doc = {
        _id: 'replaceOnlyRoleDoc',
        stringProp: 'foobar'
      };

      testFixture.verifyAccessDenied(doc, null, userContext);
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

      testFixture.testEnvironment.validationFunction(doc, oldDoc, userContext);
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

      testFixture.verifyAccessDenied(doc, oldDoc, userContext);
    });
  });

  describe('for a document with statically-assigned add role and nothing else', () => {
    const userContext = { name: 'me', roles: [ 'add' ] };

    it('allows document creation', () => {
      const doc = {
        _id: 'addOnlyRoleDoc',
        stringProp: 'foobar'
      };

      testFixture.testEnvironment.validationFunction(doc, void 0, userContext);
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

      testFixture.verifyAccessDenied(doc, oldDoc, userContext);
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

      testFixture.verifyAccessDenied(doc, oldDoc, userContext);
    });
  });

  describe('when whether to allow all members write access is defined statically', () => {
    it('allows document creation by an authenticated user', () => {
      const doc = {
        _id: 'staticUniversalAccessDoc',
        floatProp: -1.8
      };

      testFixture.testEnvironment.validationFunction(doc, null, { name: 'me' });
    });

    it('allows document replacement by an authenticated user', () => {
      const doc = {
        _id: 'staticUniversalAccessDoc',
        floatProp: 15.917
      };
      const oldDoc = { _id: 'staticUniversalAccessDoc' };

      testFixture.testEnvironment.validationFunction(doc, oldDoc, { name: 'me' });
    });

    it('allows document deletion by an authenticated user', () => {
      const oldDoc = {
        _id: 'staticUniversalAccessDoc',
        floatProp: 0
      };

      testFixture.testEnvironment.validationFunction({ _id: oldDoc._id, _deleted: true }, oldDoc, { name: 'me' });
    });

    it('rejects document created by an unauthenticated user', () => {
      const doc = {
        _id: 'staticUniversalAccessDoc',
        floatProp: 4.0
      };

      verifyUnauthorizedError(doc, null);
    });
  });

  describe('when whether to allow all members write access is defined dynamically', () => {
    const testUserContext = { db: 'my-db', name: 'me', roles: [ '1' ] };

    it('allows document creation by an authenticated user when the configuration option is enabled in the new document', () => {
      const doc = {
        _id: 'dynamicUniversalAccessDoc',
        allowAccess: true
      };

      testFixture.testEnvironment.validationFunction(doc, null, testUserContext);
    });

    it('allows document replacement by an authenticated user when the configuration option is enabled in the old document', () => {
      const doc = { _id: 'dynamicUniversalAccessDoc' };
      const oldDoc = {
        _id: 'dynamicUniversalAccessDoc',
        allowAccess: true
      };

      testFixture.testEnvironment.validationFunction(doc, oldDoc, testUserContext);
    });

    it('allows document creation by an authenticated user when the database name matches the magic value', () => {
      const doc = {
        _id: 'dynamicUniversalAccessDoc',
        allowAccess: false
      };

      testFixture.testEnvironment.validationFunction(doc, null, { db: 'all-members-write-access-db', name: 'me', roles: [ '1' ] });
    });

    it('rejects document creation by an authenticated user when the configuration option is disabled', () => {
      const doc = {
        _id: 'dynamicUniversalAccessDoc',
        allowAccess: false
      };

      testFixture.verifyAccessDenied(doc, null, testUserContext);
    });

    it('allows document creation by a DB admin even when the configuration option is disabled', () => {
      const testSecurityInfo = {
        admins: { roles: '1' }
      };
      const doc = {
        _id: 'dynamicUniversalAccessDoc',
        allowAccess: true
      };

      testFixture.testEnvironment.validationFunction(doc, null, testUserContext, testSecurityInfo);
    });
  });

  function verifyUnauthorizedError(doc, oldDoc) {
    let validationFuncError = null;
    expect(() => {
      try {
        testFixture.testEnvironment.validationFunction(doc, oldDoc, null);
      } catch (ex) {
        validationFuncError = ex;
        throw ex;
      }
    }).to.throw();

    expect(validationFuncError).to.eql({ unauthorized: 'Not authenticated' });
  }
});
