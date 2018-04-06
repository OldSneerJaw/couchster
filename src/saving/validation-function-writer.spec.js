const { expect } = require('chai');
const simpleMock = require('../../lib/simple-mock/index');
const mockRequire = require('mock-require');

describe('Validation function loader', () => {
  let validationFunctionWriter, fsMock, mkdirpMock;

  beforeEach(() => {
    // Mock out the "require" calls in the module under test
    fsMock = { existsSync: simpleMock.stub(), writeFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    mkdirpMock = { sync: simpleMock.stub() };
    mockRequire('../../lib/mkdirp/index', mkdirpMock);

    validationFunctionWriter = mockRequire.reRequire('./validation-function-writer');
  });

  afterEach(() => {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('should create an output directory that does not exist and save the validation function to the correct file', () => {
    const outputDirectory = '/foo/bar/baz';
    const filePath = `${outputDirectory}/qux.js`;
    const validationFuncString = '"my" validation \\function\\:\r\ndo\rsomething\nhere';

    // The output dir does not exist
    fsMock.existsSync.returnWith(false);

    validationFunctionWriter.save(filePath, validationFuncString);

    expect(fsMock.existsSync.callCount).to.equal(1);
    expect(fsMock.existsSync.calls[0].args).to.deep.equal([ outputDirectory ]);

    expect(mkdirpMock.sync.callCount).to.equal(1);
    expect(mkdirpMock.sync.calls[0].args).to.deep.equal([ outputDirectory ]);

    expect(fsMock.writeFileSync.callCount).to.equal(1);
    expect(fsMock.writeFileSync.calls[0].args)
      .to.deep.equal([ filePath, '"my" validation \\function\\:\ndo\nsomething\nhere', 'utf8' ]);
  });

  it('should save the validation function to the correct file enclosed in a JSON-compatible string', () => {
    const outputDirectory = '/foo/bar/baz';
    const filePath = `${outputDirectory}/qux.js`;
    const validationFuncString = '"my" validation \\function\\:\r\ndo\rsomething\nhere';

    // The output dir does exist
    fsMock.existsSync.returnWith(true);

    validationFunctionWriter.save(filePath, validationFuncString, { jsonString: true });

    expect(fsMock.existsSync.callCount).to.equal(1);
    expect(fsMock.existsSync.calls[0].args).to.deep.equal([ outputDirectory ]);

    expect(mkdirpMock.sync.callCount).to.equal(0);

    expect(fsMock.writeFileSync.callCount).to.equal(1);
    expect(fsMock.writeFileSync.calls[0].args)
      .to.deep.equal([ filePath, '"\\"my\\" validation \\\\function\\\\:\\ndo\\nsomething\\nhere"', 'utf8' ]);
  });
});
