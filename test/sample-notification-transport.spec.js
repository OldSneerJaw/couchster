const sampleSpecHelper = require('./helpers/sample-spec-helper');
const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;
const { expect } = require('chai');

describe('Sample business notification transport doc definition:', () => {
  beforeEach(() => {
    testHelper.initValidationFunction('build/validation-functions/test-sample-validation-function.js');
  });

  const expectedDocType = 'notificationTransport';
  const expectedBasePrivilege = 'NOTIFICATIONS_CONFIG';

  it('successfully creates a valid notification transport document', () => {
    const doc = {
      _id: 'biz.82.notificationTransport.ABC',
      type: 'email',
      recipient: 'foo.bar@example.com'
    };

    sampleSpecHelper.verifyDocumentCreated(expectedBasePrivilege, 82, doc);
  });

  it('cannot create a notification transport document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.75.notificationTransport.ABC',
      recipient: ''
    };

    sampleSpecHelper.verifyDocumentNotCreated(
      expectedBasePrivilege,
      75,
      doc,
      expectedDocType,
      [ errorFormatter.requiredValueViolation('type'), errorFormatter.mustNotBeEmptyViolation('recipient') ]);
  });

  it('successfully replaces a valid notification transport document', () => {
    const doc = {
      _id: 'biz.38.notificationTransport.ABC',
      type: 'email',
      recipient: 'different.foo.bar@example.com'
    };
    const oldDoc = {
      _id: 'biz.38.notificationTransport.ABC',
      type: 'email',
      recipient: 'foo.bar@example.com'
    };

    testHelper.validationFunction(doc, oldDoc, { name: 'me', roles: [ `38-CHANGE_${expectedBasePrivilege}`, `${doc._id}-replace` ] });
  });

  it('cannot replace a notification transport document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.73.notificationTransport.ABC',
      type: 23,
    };
    const oldDoc = {
      _id: 'biz.73.notificationTransport.ABC',
      type: 'email',
      recipient: 'foo.bar@example.com'
    };

    let validationFuncError = null;
    expect(() => {
      try {
        testHelper.validationFunction(doc, oldDoc, { name: 'me', roles: [ `73-CHANGE_${expectedBasePrivilege}`, `${doc._id}-replace` ] });
      } catch (ex) {
        validationFuncError = ex;
        throw ex;
      }
    }).to.throw();

    testHelper.verifyValidationErrors(
      expectedDocType,
      [ errorFormatter.typeConstraintViolation('type', 'string'), errorFormatter.requiredValueViolation('recipient') ],
      validationFuncError);
  });

  it('cannot replace a notification transport document when the user fails the custom authorization', () => {
    const doc = {
      _id: 'biz.38.notificationTransport.ABC',
      type: 'email',
      recipient: 'different.foo.bar@example.com'
    };
    const oldDoc = {
      _id: 'biz.38.notificationTransport.ABC',
      type: 'email',
      recipient: 'foo.bar@example.com'
    };

    verifyCustomAuthorizationFailed(doc, oldDoc, { name: 'me', roles: [ '38-CHANGE_NOTIFICATIONS_CONFIG' ] });
  });

  it('successfully deletes a notification transport document', () => {
    const doc = {
      _id: 'biz.14.notificationTransport.ABC',
      _deleted: true
    };
    const oldDoc = {
      _id: 'biz.14.notificationTransport.ABC',
      type: 'email',
      recipient: 'different.foo.bar@example.com'
    };

    testHelper.validationFunction(doc, oldDoc, { name: 'me', roles: [ `14-REMOVE_${expectedBasePrivilege}`, `${doc._id}-delete` ] });
  });

  it('cannot delete a notification transport document when the user fails the custom authorization', () => {
    const doc = {
      _id: 'biz.38.notificationTransport.ABC',
      _deleted: true
    };
    const oldDoc = {
      _id: 'biz.14.notificationTransport.ABC',
      type: 'email',
      recipient: 'different.foo.bar@example.com'
    };

    verifyCustomAuthorizationFailed(doc, oldDoc, { name: 'me', roles: [ '38-REMOVE_NOTIFICATIONS_CONFIG' ] });
  });

  function verifyCustomAuthorizationFailed(doc, oldDoc, userContext) {
    let validationFuncError = null;
    expect(() => {
      try {
        testHelper.validationFunction(doc, oldDoc, userContext);
      } catch (ex) {
        validationFuncError = ex;
        throw ex;
      }
    }).to.throw();

    expect(validationFuncError).to.eql({ forbidden: 'Operation forbidden' });
  }
});
