const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Type identifier validator', () => {
  beforeEach(() => {
    testHelper.initSyncFunction('build/sync-functions/test-type-id-validator-sync-function.js');
  });

  it('allows a valid string value', () => {
    const doc = {
      _id: 'typeIdDoc',
      typeIdProp: 'my-doc-type'
    };

    testHelper.verifyDocumentCreated(doc);
  });

  it('rejects a non-string value', () => {
    const doc = {
      _id: 'typeIdDoc',
      typeIdProp: 15
    };

    testHelper.verifyDocumentNotCreated(doc, 'typeIdDoc', [ errorFormatter.typeConstraintViolation('typeIdProp', 'string') ]);
  });

  it('rejects an empty string value', () => {
    const doc = {
      _id: 'typeIdDoc',
      typeIdProp: ''
    };

    testHelper.verifyDocumentNotCreated(doc, 'typeIdDoc', [ errorFormatter.mustNotBeEmptyViolation('typeIdProp') ]);
  });

  it('rejects a null value', () => {
    const doc = {
      _id: 'typeIdDoc',
      typeIdProp: null
    };

    testHelper.verifyDocumentNotCreated(doc, 'typeIdDoc', [ errorFormatter.requiredValueViolation('typeIdProp') ]);
  });

  it('rejects a value that has been modified', () => {
    const doc = {
      _id: 'typeIdDoc',
      typeIdProp: 'my-modified-doc-type'
    };
    const oldDoc = {
      _id: 'typeIdDoc',
      typeIdProp: 'my-doc-type'
    };

    testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'typeIdDoc', [ errorFormatter.immutableItemViolation('typeIdProp') ]);
  });
});
