const { expect } = require('chai');
const simpleMock = require('../../lib/simple-mock/index');
const mockRequire = require('mock-require');

describe('Test helper:', () => {
  let testHelper, fsMock, validationFunctionLoaderMock, testEnvironmentMakerMock, fakeTestEnvironment;

  const fakeFilePath = 'my-file-path';
  const fakeValidationFunctionContents = 'my-validation-function';

  beforeEach(() => {
    fakeTestEnvironment = {
      _: simpleMock.stub(),
      requireAccess: simpleMock.stub(),
      requireRole: simpleMock.stub(),
      requireUser: simpleMock.stub(),
      channel: simpleMock.stub(),
      customActionStub: simpleMock.stub(),
      validationFunction: simpleMock.stub()
    };

    // Stub out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    fsMock.readFileSync.returnWith(fakeValidationFunctionContents);
    mockRequire('fs', fsMock);

    validationFunctionLoaderMock = { load: simpleMock.stub() };
    validationFunctionLoaderMock.load.returnWith(fakeValidationFunctionContents);
    mockRequire('../loading/validation-function-loader', validationFunctionLoaderMock);

    testEnvironmentMakerMock = { init: simpleMock.stub() };
    testEnvironmentMakerMock.init.returnWith(fakeTestEnvironment);
    mockRequire('./test-environment-maker', testEnvironmentMakerMock);

    testHelper = mockRequire.reRequire('./test-helper');
  });

  afterEach(() => {
    mockRequire.stopAll();
  });

  describe('when initializing a test environment', () => {
    it('can initialize from a validation function', () => {
      fsMock.readFileSync.returnWith(fakeValidationFunctionContents);

      testHelper.initValidationFunction(fakeFilePath);

      expect(fsMock.readFileSync.callCount).to.equal(1);
      expect(fsMock.readFileSync.calls[0].args).to.eql([ fakeFilePath, 'utf8' ]);

      expect(testEnvironmentMakerMock.init.callCount).to.equal(1);
      expect(testEnvironmentMakerMock.init.calls[0].args).to.eql([ fakeValidationFunctionContents, fakeFilePath ]);

      verifyTestEnvironment();
    });

    it('can initialize directly from document definitions', () => {
      validationFunctionLoaderMock.load.returnWith(fakeValidationFunctionContents);

      testHelper.initDocumentDefinitions(fakeFilePath);

      expect(validationFunctionLoaderMock.load.callCount).to.equal(1);
      expect(validationFunctionLoaderMock.load.calls[0].args).to.eql([ fakeFilePath ]);

      expect(testEnvironmentMakerMock.init.callCount).to.equal(1);
      expect(testEnvironmentMakerMock.init.calls[0].args).to.eql([ fakeValidationFunctionContents, void 0 ]);

      verifyTestEnvironment();
    });

    function verifyTestEnvironment() {
      expect(testHelper.requireAccess).to.equal(fakeTestEnvironment.requireAccess);
      expect(testHelper.requireRole).to.equal(fakeTestEnvironment.requireRole);
      expect(testHelper.requireUser).to.equal(fakeTestEnvironment.requireUser);
      expect(testHelper.channel).to.equal(fakeTestEnvironment.channel);
      expect(testHelper.customActionStub).to.equal(fakeTestEnvironment.customActionStub);
      expect(testHelper.validationFunction).to.equal(fakeTestEnvironment.validationFunction);
    }
  });

  describe('when verifying that document authorization is denied', () => {
    beforeEach(() => {
      testHelper.initDocumentDefinitions(fakeFilePath);
    });

    it('fails if it encounters a required channel that was not expected', () => {
      const actualChannels = [ 'my-channel-1', 'my-channel-2' ];
      const expectedChannels = [ 'my-channel-1' ];

      testHelper.validationFunction = () => {
        testHelper.requireAccess(actualChannels);
      };

      expect(() => {
        testHelper.verifyAccessDenied({ }, void 0, expectedChannels);
      }).to.throw(`Unexpected channel encountered: my-channel-2. Expected channels: ${expectedChannels.join(',')}`);
    });

    it('fails if it does not encounter a channel that was expected', () => {
      const actualChannels = [ 'my-channel-1' ];
      const expectedChannels = [ 'my-channel-1', 'my-channel-2' ];

      testHelper.validationFunction = () => {
        testHelper.requireAccess(actualChannels);
      };

      expect(() => {
        testHelper.verifyAccessDenied({ }, void 0, expectedChannels);
      }).to.throw(`Expected channel was not encountered: my-channel-2. Actual channels: ${actualChannels.join(',')}`);
    });

    it('fails if the validation function does not throw an error', () => {
      testHelper.validationFunction = () => { };

      expect(() => {
        testHelper.verifyAccessDenied({ }, void 0, [ ]);
      }).to.throw('Document authorization succeeded when it was expected to fail');
    });

    it('succeeds if there are no expected channels, roles or users allowed', () => {
      testHelper.validationFunction = () => {
        testHelper.requireAccess([ ]);
      };

      expect(() => {
        testHelper.verifyAccessDenied({ }, void 0, { });
      }).not.to.throw();
    });
  });

  describe('when verifying that a document type is unknown', () => {
    beforeEach(() => {
      testHelper.initDocumentDefinitions(fakeFilePath);
    });

    it('fails if the document type is recognized', () => {
      testHelper.validationFunction = () => { };

      expect(() => {
        testHelper.verifyUnknownDocumentType({ });
      }).to.throw('Document type was successfully identified when it was expected to be unknown');
    });
  });

  describe('when verifying that document contents are invalid', () => {
    beforeEach(() => {
      testHelper.initDocumentDefinitions(fakeFilePath);
    });

    it('fails if the validation function does not throw an error', () => {
      testHelper.validationFunction = () => { };

      expect(() => {
        testHelper.verifyDocumentRejected({ }, void 0, 'my-doc-type', [ ], { });
      }).to.throw('Document validation succeeded when it was expected to fail');
    });

    it('fails if the validation error message format is invalid', () => {
      const errorMessage = 'Foo: bar';

      testHelper.validationFunction = () => {
        throw { forbidden: errorMessage };
      };

      expect(() => {
        testHelper.verifyDocumentRejected({ }, void 0, 'my-doc-type', [ ], { });
      }).to.throw(`Unrecognized document validation error message format: "${errorMessage}"`);
    });

    it('fails if an expected validation error is missing', () => {
      const docType = 'my-doc-type';
      const expectedErrors = [ 'my-error-1', 'my-error-2' ];
      const errorMessage = `Invalid ${docType} document: ${expectedErrors[0]}`;

      testHelper.validationFunction = () => {
        throw { forbidden: errorMessage };
      };

      expect(() => {
        testHelper.verifyDocumentRejected({ }, void 0, docType, expectedErrors, { });
      }).to.throw(`Document validation errors do not include expected error message: "${expectedErrors[1]}". Actual error: ${errorMessage}`);
    });

    it('fails if an unexpected validation error is encountered', () => {
      const docType = 'my-doc-type';
      const actualErrors = [ 'my-error-1', 'my-error-2' ];
      const actualErrorMessage = `Invalid ${docType} document: ${actualErrors[0]}; ${actualErrors[1]}`;
      const expectedErrors = [ actualErrors[0] ];
      const expectedErrorMessage = `Invalid ${docType} document: ${expectedErrors[0]}`;

      testHelper.validationFunction = () => {
        throw { forbidden: actualErrorMessage };
      };

      expect(() => {
        testHelper.verifyDocumentRejected({ }, void 0, docType, expectedErrors, { });
      }).to.throw(`Unexpected document validation error: "${actualErrors[1]}". Expected error: ${expectedErrorMessage}`);
    });
  });

  describe('when verifying that document contents are correct', () => {
    beforeEach(() => {
      testHelper.initDocumentDefinitions(fakeFilePath);
    });

    it('fails if the channel assignment function was not called', () => {
      testHelper.validationFunction = () => {
        testHelper.requireAccess([ ]);
      };

      expect(() => {
        testHelper.verifyDocumentAccepted({ }, void 0, [ ]);
      }).to.throw('Document channels were not assigned');
    });
  });
});
