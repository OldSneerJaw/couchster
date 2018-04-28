const assert = require('assert');
const fs = require('fs');
const validationFunctionLoader = require('../loading/validation-function-loader');
const testEnvironmentMaker = require('./test-environment-maker');
const validationErrorFormatter = require('./validation-error-formatter');

/**
 * Initializes a test fixture for the validation function at the specified file path.
 *
 * @param {string} filePath The path to the validation function to load
 */
exports.initFromValidationFunction = function(filePath) {
  const rawValidationFunction = fs.readFileSync(filePath, 'utf8').toString();

  return init(rawValidationFunction, filePath);
};

/**
 * Initializes a test fixture for the document definitions at the specified file path.
 *
 * @param {string} filePath The path to the document definitions to load
 */
exports.initFromDocumentDefinitions = function(filePath) {
  const rawValidationFunction = validationFunctionLoader.load(filePath);

  return init(rawValidationFunction);
};

function init(rawValidationFunction, validationFunctionFile) {
  const testEnvironment = testEnvironmentMaker.create(rawValidationFunction, validationFunctionFile);

  const fixture = {
    /**
     * An object that contains functions that are used to format expected validation error messages in specifications. Documentation can be
     * found in the "validation-error-formatter" module.
     */
    validationErrorFormatter,

    /**
     * Resets the test fixture's environment to its initial state. Should be called after each test case to ensure the
     * environment is in a pristine state at all times.
     */
    resetTestEnvironment,

    /**
     * Attempts to write the specified doc and then verifies that it completed successfully with the expected authorization.
     *
     * @param {Object} doc The document to write. May include property "_deleted=true" to simulate a delete operation.
     * @param {Object} oldDoc The document to replace or delete. May be null or undefined or include property "_deleted=true" to simulate a
     *                        create operation.
     * @param {(Object|string[])} expectedAuthorization Either an object that specifies the separate roles/users or a list of roles
     *                                                  that are authorized to perform the operation. If it is an object, the following fields are
     *                                                  available:
     *                                                  - expectedRoles: an optional list of roles that are authorized
     *                                                  - expectedUsers: an optional list of users that are authorized
     *                                                  - expectedDbName: the optional name of the database
     */
    verifyDocumentAccepted,

    /**
     * Attempts to create the specified doc and then verifies that it completed successfully with the expected authorization.
     *
     * @param {Object} doc The new document
     * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the roles/users or an optional list
     *                                                    of roles that are authorized to perform the operation. If omitted, then the role
     *                                                    "write" is assumed. If it is an object, the following fields are available:
     *                                                    - expectedRoles: an optional list of roles that are authorized
     *                                                    - expectedUsers: an optional list of users that are authorized
     *                                                    - expectedDbName: the optional name of the database
     */
    verifyDocumentCreated,

    /**
     * Attempts to replace the specified doc and then verifies that it completed successfully with the expected authorization.
     *
     * @param {Object} doc The updated document
     * @param {Object} oldDoc The document to replace
     * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the roles/users or an optional list
     *                                                    of roles that are authorized to perform the operation. If omitted, then the role
     *                                                    "write" is assumed. If it is an object, the following fields are available:
     *                                                    - expectedRoles: an optional list of roles that are authorized
     *                                                    - expectedUsers: an optional list of users that are authorized
     *                                                    - expectedDbName: the optional name of the database
     */
    verifyDocumentReplaced,

    /**
     * Attempts to delete the specified doc and then verifies that it completed successfully with the expected authorizations.
     *
     * @param {Object} oldDoc The document to delete
     * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the roles/users or an optional list
     *                                                    of roles that are authorized to perform the operation. If omitted, then the role
     *                                                    "write" is assumed. If it is an object, the following fields are available:
     *                                                    - expectedRoles: an optional list of roles that are authorized
     *                                                    - expectedUsers: an optional list of users that are authorized
     *                                                    - expectedDbName: the optional name of the database
     */
    verifyDocumentDeleted,

    /**
     * Attempts to write the specified doc and then verifies that it failed validation with the expected authorizations.
     *
     * @param {Object} doc The document to write. May include property "_deleted=true" to simulate a delete operation.
     * @param {Object} oldDoc The document to replace or delete. May be null or undefined or include property "_deleted=true" to simulate a
     *                        create operation.
     * @param {string} docType The document's type as specified in the document definition
     * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
     *                                         if only one validation error is expected.
     * @param {(Object|string[])} expectedAuthorization Either an object that specifies the separate roles/users or a list of roles
     *                                                  that are authorized to perform the operation. If it is an object, the following fields are
     *                                                  available:
     *                                                  - expectedRoles: an optional list of roles that are authorized
     *                                                  - expectedUsers: an optional list of users that are authorized
     *                                                  - expectedDbName: the optional name of the database
     */
    verifyDocumentRejected,

    /**
     * Attempts to create the specified doc and then verifies that it failed validation with the expected authorizations.
     *
     * @param {Object} doc The new document
     * @param {string} docType The document's type as specified in the document definition
     * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
     *                                         if only one validation error is expected.
     * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the roles/users or an optional list
     *                                                    of roles that are authorized to perform the operation. If omitted, then the role
     *                                                    "write" is assumed. If it is an object, the following fields are available:
     *                                                    - expectedRoles: an optional list of roles that are authorized
     *                                                    - expectedUsers: an optional list of users that are authorized
     *                                                    - expectedDbName: the optional name of the database
     */
    verifyDocumentNotCreated,

    /**
     * Attempts to replace the specified doc and then verifies that it failed validation with the expected authorizations.
     *
     * @param {Object} doc The updated document
     * @param {Object} oldDoc The document to replace
     * @param {string} docType The document's type as specified in the document definition
     * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
     *                                         if only one validation error is expected.
     * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the roles/users or an optional list
     *                                                    of roles that are authorized to perform the operation. If omitted, then the role
     *                                                    "write" is assumed. If it is an object, the following fields are available:
     *                                                    - expectedRoles: an optional list of roles that are authorized
     *                                                    - expectedUsers: an optional list of users that are authorized
     *                                                    - expectedDbName: the optional name of the database
     */
    verifyDocumentNotReplaced,

    /**
     * Attempts to delete the specified doc and then verifies that it failed validation with the expected authorizations.
     *
     * @param {Object} oldDoc The document to delete
     * @param {string} docType The document's type as specified in the document definition
     * @param {string[]} expectedErrorMessages The list of validation error messages that should be generated by the operation. May be a string
     *                                         if only one validation error is expected.
     * @param {(Object|string[])} [expectedAuthorization] Either an optional object that specifies the roles/users or an optional list
     *                                                    of roles that are authorized to perform the operation. If omitted, then the role
     *                                                    "write" is assumed. If it is an object, the following fields are available:
     *                                                    - expectedRoles: an optional list of roles that are authorized
     *                                                    - expectedUsers: an optional list of users that are authorized
     *                                                    - expectedDbName: the optional name of the database
     */
    verifyDocumentNotDeleted,

    /**
     * Verifies that the given exception result of a document write operation includes the specified validation error messages.
     *
     * @param {Object} docType The document's type as specified in the document definition
     * @param {string[]} expectedErrorMessages The list of validation error messages that should be contained in the exception. May be a string
     *                                         if only one validation error is expected.
     * @param {Object} exception The exception that was thrown by the validation function. Should include a "forbidden" property of type string.
     */
    verifyValidationErrors,

    /**
     * Verifies that the validation function throws an error when authorization is denied to create/replace/delete a document.
     *
     * @param {Object} doc The document to attempt to write. May include property "_deleted=true" to simulate a delete operation.
     * @param {Object} oldDoc The document to replace or delete. May be null or undefined or include property "_deleted=true" to simulate a
     *                        create operation.
     * @param {Object} userContext A CouchDB user context (http://docs.couchdb.org/en/latest/json-structure.html#userctx-object) that represents
     *                             a user that should be denied access.
     * @param {Object} [securityInfo] A CouchDB security object (http://docs.couchdb.org/en/latest/json-structure.html#security-object) that
     *                                describes the roles assigned to the database.
     */
    verifyAccessDenied,

    /**
     * Verifies that the given document's type is unknown/invalid.
     *
     * @param {Object} doc The document to attempt to write. May include property "_deleted=true" to simulate a delete operation.
     * @param {Object} oldDoc The document to replace or delete. May be null or undefined or include property "_deleted=true" to simulate a
     *                        create operation.
     */
    verifyUnknownDocumentType,

    /**
     * The test environment that the test fixture uses to simulate execution of the validation function. Exposes the
     * validation function itself via the "validationFunction" property.
     */
    testEnvironment
  };

  // Implementation begins here
  const defaultWriteRole = 'write';

  function resetTestEnvironment() {
    const newEnvironment = testEnvironmentMaker.create(rawValidationFunction, validationFunctionFile);
    Object.assign(testEnvironment, newEnvironment);

    return testEnvironment;
  }

  function verifyDocumentAccepted(doc, oldDoc, expectedAuthorization) {
    const userContexts = generateAuthorizedUserContexts(expectedAuthorization);

    userContexts.forEach((userContext) => {
      testEnvironment.validationFunction(doc, oldDoc || null, userContext, { });
    });
  }

  function verifyDocumentCreated(doc, expectedAuthorization) {
    verifyDocumentAccepted(doc, null, expectedAuthorization || defaultWriteRole);
  }

  function verifyDocumentReplaced(doc, oldDoc, expectedAuthorization) {
    verifyDocumentAccepted(doc, oldDoc, expectedAuthorization || defaultWriteRole);
  }

  function verifyDocumentDeleted(oldDoc, expectedAuthorization) {
    verifyDocumentAccepted({ _id: oldDoc._id, _deleted: true }, oldDoc, expectedAuthorization || defaultWriteRole);
  }

  function verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, expectedAuthorization) {
    const userContexts = generateAuthorizedUserContexts(expectedAuthorization);

    userContexts.forEach((userContext) => {
      let validationFuncError = null;
      try {
        testEnvironment.validationFunction(doc, oldDoc || null, userContext);
      } catch (ex) {
        validationFuncError = ex;
      }

      if (validationFuncError) {
        verifyValidationErrors(docType, expectedErrorMessages, validationFuncError);
      } else {
        assert.fail('Document validation succeeded when it was expected to fail');
      }
    });
  }

  function verifyDocumentNotCreated(doc, docType, expectedErrorMessages, expectedAuthorization) {
    verifyDocumentRejected(doc, null, docType, expectedErrorMessages, expectedAuthorization || defaultWriteRole);
  }

  function verifyDocumentNotReplaced(doc, oldDoc, docType, expectedErrorMessages, expectedAuthorization) {
    verifyDocumentRejected(doc, oldDoc, docType, expectedErrorMessages, expectedAuthorization || defaultWriteRole);
  }

  function verifyDocumentNotDeleted(oldDoc, docType, expectedErrorMessages, expectedAuthorization) {
    verifyDocumentRejected({ _id: oldDoc._id, _deleted: true }, oldDoc, docType, expectedErrorMessages, expectedAuthorization || defaultWriteRole);
  }

  function verifyValidationErrors(docType, expectedErrorMessages, exception) {
    const errorMessageList = normalizeList(expectedErrorMessages);

    // Used to split the leading component (e.g. "Invalid foobar document") from the validation error messages, which are separated by a colon
    const validationErrorRegex = /^([^:]+):\s*(.+)$/;

    const exceptionMessageMatches = validationErrorRegex.exec(exception.forbidden);
    let actualErrorMessages;
    if (exceptionMessageMatches) {
      assert.equal(exceptionMessageMatches.length, 3, `Unrecognized document validation error message format: "${exception.forbidden}"`);

      const invalidDocMessage = exceptionMessageMatches[1].trim();
      assert.equal(
        invalidDocMessage,
        `Invalid ${docType} document`,
        `Unrecognized document validation error message format: "${exception.forbidden}"`);

      actualErrorMessages = exceptionMessageMatches[2].trim().split(/;\s*/);
    } else {
      actualErrorMessages = [ exception.forbidden ];
    }

    // Rather than compare the sizes of the two lists, which leads to an obtuse error message on failure (e.g. "expected 2 to be 3"), verify
    // that neither list of validation errors contains an element that does not exist in the other
    errorMessageList.forEach((expectedErrorMsg) => {
      assert.ok(
        actualErrorMessages.includes(expectedErrorMsg),
        `Document validation errors do not include expected error message: "${expectedErrorMsg}". Actual error: ${exception.forbidden}`);
    });

    actualErrorMessages.forEach((errorMessage) => {
      if (!errorMessageList.includes(errorMessage)) {
        assert.fail(`Unexpected document validation error: "${errorMessage}". Expected error: Invalid ${docType} document: ${errorMessageList.join('; ')}`);
      }
    });
  }

  function verifyAccessDenied(doc, oldDoc, userContext, securityInfo) {
    let validationFuncError = null;
    try {
      testEnvironment.validationFunction(doc, oldDoc || null, userContext, securityInfo);
    } catch (ex) {
      validationFuncError = ex;
    }

    if (validationFuncError) {
      assert.deepEqual(validationFuncError, { forbidden: 'Access denied' });
    } else {
      assert.fail('Document authorization succeeded when it was expected to fail');
    }
  }

  function verifyUnknownDocumentType(doc, oldDoc) {
    let validationFuncError = null;
    try {
      testEnvironment.validationFunction(doc, oldDoc || null, { }, { });
    } catch (ex) {
      validationFuncError = ex;
    }

    if (validationFuncError) {
      assert.equal(
        validationFuncError.forbidden,
        'Unknown document type',
        `Document validation error does not indicate the document type is unrecognized. Actual: ${JSON.stringify(validationFuncError)}`);
    } else {
      assert.fail('Document type was successfully identified when it was expected to be unknown');
    }
  }

  function generateAuthorizedUserContexts(expectedAuthorization) {
    const users = convertToUserContexts(expectedAuthorization);

    return (users.length > 0) ? users : [ { db: '', name: '' } ];
  }

  function convertToUserContexts(expectedAuthorization) {
    if (typeof expectedAuthorization === 'string') {
      // The expected authorization is a single role name
      return [ createUserContextFromRole(expectedAuthorization) ];
    } else if (Array.isArray(expectedAuthorization)) {
      // The expected authorization is an array of role names
      return expectedAuthorization.map((expectedRole) => createUserContextFromRole(expectedRole));
    } else {
      const expectedRoles = normalizeList(expectedAuthorization.expectedRoles);
      const expectedUsers = normalizeList(expectedAuthorization.expectedUsers);

      const usersByRole = expectedRoles.map(expectedRole =>
        createUserContextFromRole(expectedRole, expectedAuthorization.expectedDbName));
      const usersByUsername = expectedUsers.map(expectedUsername => ({
        db: expectedAuthorization.expectedDbName || '',
        name: expectedUsername
      }));

      return [ ...usersByRole, ...usersByUsername ];
    }
  }

  function createUserContextFromRole(expectedRole, dbName) {
    return {
      db: dbName || '',
      name: `user-from-role:${expectedRole}`,
      roles: [ expectedRole ]
    };
  }

  function normalizeList(items) {
    if (Array.isArray(items)) {
      return items;
    } else if (typeof items === 'string') {
      return [ items ];
    } else {
      return [ ];
    }
  }

  return fixture;
}
