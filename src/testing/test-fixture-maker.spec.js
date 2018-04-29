const { expect } = require('chai');
const simpleMock = require('../../lib/simple-mock/index');
const mockRequire = require('mock-require');

describe('Test fixture maker:', () => {
  let testFixtureMaker, fsMock, validationFunctionLoaderMock, testEnvironmentMakerMock;

  const fakeFilePath = 'my-file-path';
  const fakeValidationFunctionContents = 'my-validation-function';

  beforeEach(() => {
    // Stub out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    fsMock.readFileSync.returnWith(fakeValidationFunctionContents);
    mockRequire('fs', fsMock);

    validationFunctionLoaderMock = { load: simpleMock.stub() };
    validationFunctionLoaderMock.load.returnWith(fakeValidationFunctionContents);
    mockRequire('../loading/validation-function-loader', validationFunctionLoaderMock);

    testEnvironmentMakerMock = { create: simpleMock.stub() };
    testEnvironmentMakerMock.create.callFn(fakeTestEnvironment);
    mockRequire('./test-environment-maker', testEnvironmentMakerMock);

    testFixtureMaker = mockRequire.reRequire('./test-fixture-maker');
  });

  afterEach(() => {
    mockRequire.stopAll();
  });

  describe('when verifying that document authorization is denied', () => {
    let testFixture = null;

    beforeEach(() => {
      testFixture = (testFixture === null) ? testFixtureMaker.initFromDocumentDefinitions(fakeFilePath) : testFixture;
    });

    afterEach(() => {
      testFixture.resetTestEnvironment();
    });

    it('fails if authorization is NOT denied', () => {
      testFixture.testEnvironment.validationFunction = () => { };

      expect(() => {
        testFixture.verifyAccessDenied({ }, null, { }, null);
      }).to.throw('Document authorization succeeded when it was expected to fail');
    });
  });

  describe('when initializing a test environment', () => {
    it('can initialize from a validation function', () => {
      fsMock.readFileSync.returnWith(fakeValidationFunctionContents);

      const testFixture = testFixtureMaker.initFromValidationFunction(fakeFilePath);

      expect(fsMock.readFileSync.callCount).to.equal(1);
      expect(fsMock.readFileSync.calls[0].args).to.eql([ fakeFilePath, 'utf8' ]);

      expect(testEnvironmentMakerMock.create.callCount).to.equal(1);
      expect(testEnvironmentMakerMock.create.calls[0].args).to.eql([ fakeValidationFunctionContents, fakeFilePath ]);

      verifyTestEnvironment(testFixture);
    });

    it('can initialize directly from document definitions', () => {
      validationFunctionLoaderMock.load.returnWith(fakeValidationFunctionContents);

      const testFixture = testFixtureMaker.initFromDocumentDefinitions(fakeFilePath);

      expect(validationFunctionLoaderMock.load.callCount).to.equal(1);
      expect(validationFunctionLoaderMock.load.calls[0].args).to.eql([ fakeFilePath ]);

      expect(testEnvironmentMakerMock.create.callCount).to.equal(1);
      expect(testEnvironmentMakerMock.create.calls[0].args).to.eql([ fakeValidationFunctionContents, void 0 ]);

      verifyTestEnvironment(testFixture);
    });

    function verifyTestEnvironment(testFixture) {
      // Verify the validation function source code
      expect(testFixture.testEnvironment.validationFunction).to.be.a('function');
      expect(testFixture.testEnvironment.validationFunction.toString())
        .to.equal(fakeTestEnvironment().validationFunction.toString());
    }
  });

  describe('when verifying that a document type is unknown', () => {
    let testFixture = null;

    beforeEach(() => {
      testFixture = (testFixture === null) ? testFixtureMaker.initFromDocumentDefinitions(fakeFilePath) : testFixture;
    });

    afterEach(() => {
      testFixture.resetTestEnvironment();
    });

    it('fails if the document type is recognized', () => {
      testFixture.testEnvironment.validationFunction = () => { };

      expect(() => {
        testFixture.verifyUnknownDocumentType({ });
      }).to.throw('Document type was successfully identified when it was expected to be unknown');
    });
  });

  describe('when verifying that document contents are invalid', () => {
    const docType = 'my-doc-type';
    let testFixture = null;

    beforeEach(() => {
      testFixture = (testFixture === null) ? testFixtureMaker.initFromDocumentDefinitions(fakeFilePath) : testFixture;
    });

    afterEach(() => {
      testFixture.resetTestEnvironment();
    });

    it('fails if the validation function does not throw an error', () => {
      testFixture.testEnvironment.validationFunction = () => { };

      expect(() => {
        testFixture.verifyDocumentRejected({ }, null, docType, [ ], { expectedRoles: 'my-role' });
      }).to.throw('Document validation succeeded when it was expected to fail');
    });

    it('fails if the validation error message format is invalid', () => {
      const errorMessage = 'Foo: bar';

      testFixture.testEnvironment.validationFunction = () => {
        throw { forbidden: errorMessage };
      };

      expect(() => {
        testFixture.verifyDocumentRejected({ }, null, docType, [ ], 'my-role');
      }).to.throw(`Unrecognized document validation error message format: "${errorMessage}"`);
    });

    it('fails if an expected validation error is missing', () => {
      const expectedErrors = [ 'my-error-1', 'my-error-2' ];
      const errorMessage = `Invalid ${docType} document: ${expectedErrors[0]}`;

      testFixture.testEnvironment.validationFunction = () => {
        throw { forbidden: errorMessage };
      };

      expect(() => {
        testFixture.verifyDocumentRejected({ }, null, docType, expectedErrors, { });
      }).to.throw(`Document validation errors do not include expected error message: "${expectedErrors[1]}". Actual error: ${errorMessage}`);
    });

    it('fails if an unexpected validation error is encountered', () => {
      const actualErrors = [ 'my-error-1', 'my-error-2' ];
      const actualErrorMessage = `Invalid ${docType} document: ${actualErrors[0]}; ${actualErrors[1]}`;
      const expectedErrors = [ actualErrors[0] ];
      const expectedErrorMessage = `Invalid ${docType} document: ${expectedErrors[0]}`;

      testFixture.testEnvironment.validationFunction = () => {
        throw { forbidden: actualErrorMessage };
      };

      expect(() => {
        testFixture.verifyDocumentRejected({ }, null, docType, expectedErrors, { expectedUsers: 'me' });
      }).to.throw(`Unexpected document validation error: "${actualErrors[1]}". Expected error: ${expectedErrorMessage}`);
    });
  });
});

function fakeTestEnvironment() {
  return { validationFunction: simpleMock.stub() };
}
