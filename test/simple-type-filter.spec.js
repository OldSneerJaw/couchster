const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Simple type filter:', () => {
  const testFixture =
    testFixtureMaker.initFromValidationFunction('build/validation-functions/test-simple-type-filter-validation-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  function testSimpleTypeFilter(docTypeId) {
    it('identifies a brand new document by its type property', () => {
      const doc = {
        _id: 'my-doc',
        type: docTypeId
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('identifies an updated document by its type property when it matches that of the old document', () => {
      const doc = {
        _id: 'my-doc',
        type: docTypeId
      };
      const oldDoc = {
        _id: 'my-doc',
        type: docTypeId
      };

      testFixture.verifyDocumentReplaced(doc, oldDoc);
    });

    it('identifies a deleted document by the type property of the old document', () => {
      const oldDoc = {
        _id: 'my-doc',
        type: docTypeId
      };

      testFixture.verifyDocumentDeleted(oldDoc);
    });

    it('refuses to identify an updated document by its type property when it differs from that of the old document', () => {
      const doc = {
        _id: 'my-doc',
        type: docTypeId
      };
      const oldDoc = {
        _id: 'my-doc',
        type: 'somethingElse'
      };

      testFixture.verifyUnknownDocumentType(doc, oldDoc);
    });

    it('cannot identify a document when the type property is not set', () => {
      const doc = {
        _id: 'my-doc'
      };

      testFixture.verifyUnknownDocumentType(doc);
    });

    it('cannot identify a document when the type property is set to an unknown type', () => {
      const doc = {
        _id: 'my-doc',
        type: 'somethingElse'
      };

      testFixture.verifyUnknownDocumentType(doc);
    });
  }

  describe('when a type property validator is explicitly defined', () => {
    testSimpleTypeFilter('myExplicitTypeValidatorDoc');
  });

  describe('when a type property validator is implied (i.e. not defined)', () => {
    testSimpleTypeFilter('myImplicitTypeValidatorDoc');
  });
});
