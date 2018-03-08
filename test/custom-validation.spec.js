const { expect } = require('chai');
const testFixtureMaker = require('../src/testing/test-fixture-maker.js');

describe('Custom validation constraint:', () => {
  let testFixture;

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromValidationFunction('build/validation-functions/test-custom-validation-validation-function.js');
  });

  it('allows a document if custom validation succeeds', () => {
    const doc = {
      _id: 'my-doc',
      type: 'customValidationDoc',
      baseProp: {
        failValidation: false,
        customValidationProp: 'foo'
      }
    };

    testFixture.verifyDocumentCreated(doc);
  });

  it('blocks a document if custom validation fails', () => {
    const oldDoc = {
      _id: 'my-doc',
      type: 'customValidationDoc',
      baseProp: { }
    };

    const doc = {
      _id: 'my-doc',
      type: 'customValidationDoc',
      baseProp: {
        failValidation: true,
        customValidationProp: 'foo'
      }
    };

    const expectedCurrentItemEntry = {
      itemValue: doc.baseProp.customValidationProp,
      itemName: 'customValidationProp'
    };
    const expectedValidationItemStack = [
      { // The document (root)
        itemValue: doc,
        oldItemValue: oldDoc,
        itemName: null
      },
      { // The parent of the property with the customValidation constraint
        itemValue: doc.baseProp,
        oldItemValue: oldDoc.baseProp,
        itemName: 'baseProp'
      }
    ];
    const testUserContext = {
      name: 'me',
      roles: [ 'write' ]
    };
    const testSecurityInfo = {
      members: { names: [ 'me' ]}
    };

    let validationFuncError = null;
    expect(() => {
      try {
        testFixture.validationFunction(doc, oldDoc, testUserContext, testSecurityInfo);
      } catch (ex) {
        validationFuncError = ex;
        throw ex;
      }
    }).to.throw();

    testFixture.verifyValidationErrors(
      'customValidationDoc',
      [
        'doc: ' + JSON.stringify(doc),
        'oldDoc: ' + JSON.stringify(oldDoc),
        'currentItemEntry: ' + JSON.stringify(expectedCurrentItemEntry),
        'validationItemStack: ' + JSON.stringify(expectedValidationItemStack),
        'userContext: ' + JSON.stringify(testUserContext),
        'securityInfo: ' + JSON.stringify(testSecurityInfo)
      ],
      validationFuncError);
  });
});
