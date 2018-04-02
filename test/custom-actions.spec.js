const { expect } = require('chai');
const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Custom actions:', () => {
  const expectedAuthorization = {
    expectedRoles: [ 'write-role' ],
    expectedUsers: [ 'write-user' ]
  };

  const testFixture =
    testFixtureMaker.initFromValidationFunction('build/validation-functions/test-custom-actions-validation-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('the onTypeIdentificationSucceeded event', () => {
    const docType = 'onTypeIdentifiedDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      verifyCustomActionExecuted(doc, null, docType, 'onTypeIdentificationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      verifyCustomActionExecuted(doc, oldDoc, docType, 'onTypeIdentificationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      verifyCustomActionExecuted({ _id: doc._id, _deleted: true }, oldDoc, docType, 'onTypeIdentificationSucceeded');
    });

    it('does not execute a custom action if the type cannot be identified', () => {
      const unknownDocType = 'foo';
      const doc = { _id: unknownDocType };

      let validationFuncError = null;
      expect(() => {
        try {
          testFixture.testEnvironment.validationFunction(doc, null, { });
        } catch (ex) {
          validationFuncError = ex;

          throw ex;
        }
      }).to.throw();

      testFixture.verifyValidationErrors(unknownDocType, errorFormatter.unknownDocumentType(), validationFuncError);
    });
  });

  describe('the onAuthorizationSucceeded event', () => {
    const docType = 'onAuthorizationDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      verifyCustomActionExecuted(doc, null, docType, 'onAuthorizationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      verifyCustomActionExecuted(doc, oldDoc, docType, 'onAuthorizationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      verifyCustomActionExecuted({ _id: doc._id, _deleted: true }, oldDoc, docType, 'onAuthorizationSucceeded');
    });

    it('does not execute a custom action if authorization was denied', () => {
      testFixture.verifyAccessDenied(doc, null, { name: 'me' });
    });
  });

  describe('the onValidationSucceeded event', () => {
    const docType = 'onValidationDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      verifyCustomActionExecuted(doc, null, docType, 'onValidationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      verifyCustomActionExecuted(doc, oldDoc, docType, 'onValidationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      verifyCustomActionExecuted({ _id: doc._id, _deleted: true }, oldDoc, docType, 'onValidationSucceeded');
    });

    it('does not execute a custom action if the document contents are invalid', () => {
      const doc = {
        _id: docType,
        unsupportedProperty: 'foobar'
      };

      testFixture.verifyDocumentNotCreated(doc, docType, errorFormatter.unsupportedProperty('unsupportedProperty'), expectedAuthorization);
    });
  });

  function verifyCustomActionExecuted(doc, oldDoc, docType, expectedActionType) {
    const userContext = { name: 'me', roles: [ 'write-role' ] };
    const securityInfo = {
      members: { names: 'me' }
    };
    let validationFuncError = null;
    expect(() => {
      try {
        testFixture.testEnvironment.validationFunction(doc, oldDoc, userContext, securityInfo);
      } catch (ex) {
        validationFuncError = ex;
        throw ex;
      }
    }).to.throw();

    expect(validationFuncError.doc).to.eql(doc);
    expect(validationFuncError.oldDoc).to.eql(oldDoc);
    expect(validationFuncError.userContext).to.eql(userContext);
    expect(validationFuncError.securityInfo).to.eql(securityInfo);
    expect(validationFuncError.actionType).to.eql(expectedActionType);

    verifyCustomActionMetadata(validationFuncError.customActionMetadata, docType, expectedActionType);
  }

  function verifyCustomActionMetadata(actualMetadata, docType, expectedActionType) {
    if (expectedActionType === 'onTypeIdentificationSucceeded') {
      verifyTypeMetadata(actualMetadata, docType);
    } else if (expectedActionType === 'onAuthorizationSucceeded' || expectedActionType === 'onValidationSucceeded') {
      verifyTypeMetadata(actualMetadata, docType);
      verifyAuthorizationMetadata(actualMetadata);
    } else {
      expect.fail(null, null, `Unrecognized custom action type: ${expectedActionType}`);
    }
  }

  function verifyTypeMetadata(actualMetadata, docType) {
    expect(actualMetadata.documentTypeId).to.equal(docType);
    expect(actualMetadata.documentDefinition.typeFilter({ _id: docType })).to.equal(true);
  }

  function verifyAuthorizationMetadata(actualMetadata) {
    const expectedAuthMetadata = {
      roles: [ 'write-role' ],
      users: [ 'write-user' ]
    };
    expect(actualMetadata.authorization).to.eql(expectedAuthMetadata);
  }
});
