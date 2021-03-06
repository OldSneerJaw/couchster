const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Dynamic constraints', () => {
  const testFixture =
    testFixtureMaker.initFromValidationFunction('build/validation-functions/test-dynamic-constraints-validation-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  it('allows a new doc to be created when the property constraints are satisfied', () => {
    const doc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 7,
      validationByDocProperty: 'foo-7-bar',
      validationByValueProperty: 119
    };

    testFixture.verifyDocumentCreated(doc);
  });

  it('allows an existing doc to be replaced when the property constraints are satisfied', () => {
    const doc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 5,
      validationByDocProperty: 'foo-0-bar', // Note that the new value must be constructed from the old doc's dynamicReferenceId
      validationByValueProperty: -34 // Note that the new value must equal the old value + 1
    };
    const oldDoc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 0,
      validationByDocProperty: 'foo-0-bar',
      validationByValueProperty: -35
    };

    testFixture.verifyDocumentReplaced(doc, oldDoc);
  });

  it('blocks a doc from being created when the property constraints are violated', () => {
    const doc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 83,
      validationByDocProperty: 'foo-38-bar',
      validationByValueProperty: -1
    };

    testFixture.verifyDocumentNotCreated(
      doc,
      doc.type,
      [
        // If the current value of validationByValueProperty is less than zero (as it is in this case), the constraint will be set to zero
        errorFormatter.minimumValueViolation('validationByValueProperty', 0),
        errorFormatter.regexPatternItemViolation('validationByDocProperty', /^foo-83-bar$/)
      ]);
  });

  it('blocks a doc from being replaced when the property constraints are violated', () => {
    const doc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 2,
      validationByDocProperty: 'foo-2-bar', // Note that the new value must be constructed from the old doc's dynamicReferenceId
      validationByValueProperty: 20 // Note that the new value must equal the old value + 1
    };
    const oldDoc = {
      _id: 'my-doc',
      type: 'myDoc',
      dynamicReferenceId: 1,
      validationByDocProperty: 'foo-1-bar',
      validationByValueProperty: 18
    };

    testFixture.verifyDocumentNotReplaced(
      doc,
      oldDoc,
      doc.type,
      [
        errorFormatter.maximumValueViolation('validationByValueProperty', 19),
        errorFormatter.regexPatternItemViolation('validationByDocProperty', /^foo-1-bar$/)
      ]);
  });
});
