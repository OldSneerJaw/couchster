const { expect } = require('chai');
const testHelper = require('../src/testing/test-helper');

describe('Test helper module initialization', () => {
  describe('when initialized from a generated validation function file', () => {
    it('loads the validation function successfully for a valid path', () => {
      testHelper.initValidationFunction('build/validation-functions/test-init-validation-function.js');

      const doc = {
        _id: 'foobar',
        type: 'initDoc',
        testProp: 174.6
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('fails to load the validation function for a file that does not exist', () => {
      let validationFuncError = null;
      expect(() => {
        try {
          testHelper.initValidationFunction('build/validation-functions/test-nonexistant-validation-function.js');
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
      testHelper.initDocumentDefinitions('test/resources/init-doc-definitions.js');

      const doc = {
        _id: 'barfoo',
        type: 'initDoc',
        testProp: -97.99
      };

      testHelper.verifyDocumentCreated(doc);
    });

    it('fails to load the validation function for a file that does not exist', () => {
      let validationFuncError = null;
      expect(() => {
        try {
          testHelper.initDocumentDefinitions('test/resources/nonexistant-doc-definitions.js');
        } catch (ex) {
          validationFuncError = ex;

          throw ex;
        }
      }).to.throw();

      expect(validationFuncError.code).to.equal('ENOENT');
    });
  });
});
