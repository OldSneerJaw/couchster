const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Type identifier validator', () => {
  const testFixture =
    testFixtureMaker.initFromValidationFunction('build/validation-functions/test-type-id-validator-validation-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  it('allows a valid string value', () => {
    const doc = {
      _id: 'typeIdDoc',
      typeIdProp: 'my-doc-type'
    };

    testFixture.verifyDocumentCreated(doc);
  });

  it('rejects a non-string value', () => {
    const doc = {
      _id: 'typeIdDoc',
      typeIdProp: 15
    };

    testFixture.verifyDocumentNotCreated(doc, 'typeIdDoc', [ errorFormatter.typeConstraintViolation('typeIdProp', 'string') ]);
  });

  it('rejects an empty string value', () => {
    const doc = {
      _id: 'typeIdDoc',
      typeIdProp: ''
    };

    testFixture.verifyDocumentNotCreated(doc, 'typeIdDoc', [ errorFormatter.mustNotBeEmptyViolation('typeIdProp') ]);
  });

  it('rejects a null value', () => {
    const doc = {
      _id: 'typeIdDoc',
      typeIdProp: null
    };

    testFixture.verifyDocumentNotCreated(doc, 'typeIdDoc', [ errorFormatter.requiredValueViolation('typeIdProp') ]);
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

    testFixture.verifyDocumentNotReplaced(doc, oldDoc, 'typeIdDoc', [ errorFormatter.immutableItemViolation('typeIdProp') ]);
  });
});
