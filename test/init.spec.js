const { expect } = require('chai');
const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Test fixture maker module initialization', () => {
  describe('when initialized from a generated validation function file', () => {
    it('loads the validation function successfully for a valid path', () => {
      const testFixture =
        testFixtureMaker.initFromValidationFunction('build/validation-functions/test-init-validation-function.js');

      const doc = {
        _id: 'foobar',
        type: 'initDoc',
        testProp: 174.6
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('fails to load the validation function for a file that does not exist', () => {
      let validationFuncError = null;
      expect(() => {
        try {
          testFixtureMaker.initFromValidationFunction('build/validation-functions/test-nonexistant-validation-function.js');
        } catch (ex) {
          validationFuncError = ex;

          throw ex;
        }
      }).to.throw();

      expect(validationFuncError.code).to.equal('ENOENT');
    });
  });

  describe('when initialized from a document definitions file', () => {
    it('loads the validation function successfully for a valid path', () => {
      const testFixture = testFixtureMaker.initFromDocumentDefinitions('test/resources/init-doc-definitions.js');

      const doc = {
        _id: 'barfoo',
        type: 'initDoc',
        testProp: -97.99
      };

      testFixture.verifyDocumentCreated(doc);
    });

    it('fails to load the validation function for a file that does not exist', () => {
      let validationFuncError = null;
      expect(() => {
        try {
          testFixtureMaker.initFromDocumentDefinitions('test/resources/nonexistant-doc-definitions.js');
        } catch (ex) {
          validationFuncError = ex;

          throw ex;
        }
      }).to.throw();

      expect(validationFuncError.code).to.equal('ENOENT');
    });
  });
});
