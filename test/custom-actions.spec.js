const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;
const { expect } = require('chai');

describe('Custom actions:', () => {
  const expectedAuthorization = {
    expectedChannels: [ 'write-channel' ],
    expectedRoles: [ 'write-role' ],
    expectedUsers: [ 'write-user' ]
  };

  beforeEach(() => {
    testHelper.initValidationFunction('build/validation-functions/test-custom-actions-validation-function.js');
  });

  describe('the onTypeIdentificationSucceeded event', () => {
    const docType = 'onTypeIdentifiedDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, void 0, 'onTypeIdentificationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      testHelper.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onTypeIdentificationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      testHelper.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onTypeIdentificationSucceeded');
    });

    it('does not execute a custom action if the type cannot be identified', () => {
      const unknownDocType = 'foo';
      const doc = { _id: unknownDocType };

      let validationFuncError = null;
      expect(() => {
        try {
          testHelper.validationFunction(doc, expectedAuthorization);
        } catch (ex) {
          validationFuncError = ex;

          throw ex;
        }
      }).to.throw();

      testHelper.verifyValidationErrors(unknownDocType, errorFormatter.unknownDocumentType(), validationFuncError);
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onAuthorizationSucceeded event', () => {
    const docType = 'onAuthorizationDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, void 0, 'onAuthorizationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      testHelper.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onAuthorizationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      testHelper.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onAuthorizationSucceeded');
    });

    it('does not execute a custom action if authorization was denied', () => {
      testHelper.verifyAccessDenied(doc, null, expectedAuthorization);
      verifyCustomActionNotExecuted();
    });
  });

  describe('the onValidationSucceeded event', () => {
    const docType = 'onValidationDoc';
    const doc = { _id: docType };
    const oldDoc = { _id: docType };

    it('executes a custom action when a document is created', () => {
      testHelper.verifyDocumentCreated(doc, expectedAuthorization);
      verifyCustomActionExecuted(doc, void 0, 'onValidationSucceeded');
    });

    it('executes a custom action when a document is replaced', () => {
      testHelper.verifyDocumentReplaced(doc, oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(doc, oldDoc, 'onValidationSucceeded');
    });

    it('executes a custom action when a document is deleted', () => {
      testHelper.verifyDocumentDeleted(oldDoc, expectedAuthorization);
      verifyCustomActionExecuted(getDeletedDoc(docType), oldDoc, 'onValidationSucceeded');
    });

    it('does not execute a custom action if the document contents are invalid', () => {
      const doc = {
        _id: docType,
        unsupportedProperty: 'foobar'
      };

      testHelper.verifyDocumentNotCreated(doc, docType, errorFormatter.unsupportedProperty('unsupportedProperty'), expectedAuthorization);
      verifyCustomActionNotExecuted();
    });
  });
});

function verifyCustomActionExecuted(doc, oldDoc, expectedActionType) {
  expect(testHelper.customActionStub.callCount).to.equal(1);
  expect(testHelper.customActionStub.calls[0].args[0]).to.eql(doc);
  expect(testHelper.customActionStub.calls[0].args[1]).to.eql(oldDoc);

  verifyCustomActionMetadata(testHelper.customActionStub.calls[0].args[2], doc._id, expectedActionType);
}

function verifyCustomActionNotExecuted() {
  expect(testHelper.customActionStub.callCount).to.equal(0);
}

function verifyCustomActionMetadata(actualMetadata, docType, expectedActionType) {
  verifyTypeMetadata(actualMetadata, docType);
  verifyAuthorizationMetadata(actualMetadata);
  verifyDocChannelsMetadata(actualMetadata);
  verifyCustomActionTypeMetadata(actualMetadata, expectedActionType);
}

function verifyTypeMetadata(actualMetadata, docType) {
  expect(actualMetadata.documentTypeId).to.equal(docType);
  expect(actualMetadata.documentDefinition.typeFilter({ _id: docType })).to.equal(true);
}

function verifyAuthorizationMetadata(actualMetadata) {
  const expectedAuthMetadata = {
    channels: [ 'write-channel' ],
    roles: [ 'write-role' ],
    users: [ 'write-user' ]
  };
  expect(actualMetadata.authorization).to.eql(expectedAuthMetadata);
}

function verifyDocChannelsMetadata(actualMetadata) {
  expect(actualMetadata.documentChannels).to.eql([ 'write-channel' ]);
}

function verifyCustomActionTypeMetadata(actualMetadata, expectedActionType) {
  expect(actualMetadata.actionType).to.equal(expectedActionType);
}

function getDeletedDoc(docType) {
  return {
    _id: docType,
    _deleted: true
  };
}
