const path = require('path');
const { expect } = require('chai');
const simpleMock = require('../../lib/simple-mock/index');
const mockRequire = require('mock-require');

describe('Validation function loader', () => {
  let validationFunctionLoader, fsMock, indentMock, fileFragmentLoaderMock, docDefinitionsLoaderMock;

  const expectedMacroName = 'importValidationFunctionFragment';
  const validationFuncTemplateDir = path.resolve(__dirname, '../../templates/validation-function');
  const validationFuncTemplateFile = path.resolve(validationFuncTemplateDir, 'template.js');

  beforeEach(() => {
    // Mock out the "require" calls in the module under test
    fsMock = { readFileSync: simpleMock.stub() };
    mockRequire('fs', fsMock);

    indentMock = { js: simpleMock.stub() };
    mockRequire('../../lib/indent.js/indent.min.js', indentMock);

    fileFragmentLoaderMock = { load: simpleMock.stub() };
    mockRequire('./file-fragment-loader.js', fileFragmentLoaderMock);

    docDefinitionsLoaderMock = { load: simpleMock.stub() };
    mockRequire('./document-definitions-loader.js', docDefinitionsLoaderMock);

    validationFunctionLoader = mockRequire.reRequire('./validation-function-loader');
  });

  afterEach(() => {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('should load a validation function from valid document definitions', () => {
    const docDefinitionsFile = 'my/doc-definitions.js';
    const docDefinitionsContent = 'my-doc-definitions';
    const originalValidationFuncTemplate = 'my-original-validation-func-template';
    const updatedValidationFuncTemplate = 'function my-validation-func-template() { $DOCUMENT_DEFINITIONS$; }';
    const indentedValidationFunction = 'my\n  \r\nfinal\rvalidation `func`';
    const expectedValidationFunction = 'my\n\nfinal\nvalidation `func`';

    fsMock.readFileSync.returnWith(originalValidationFuncTemplate);
    fileFragmentLoaderMock.load.returnWith(updatedValidationFuncTemplate);
    docDefinitionsLoaderMock.load.returnWith(docDefinitionsContent);
    indentMock.js.returnWith(indentedValidationFunction);

    const result = validationFunctionLoader.load(docDefinitionsFile);

    expect(result).to.equal(expectedValidationFunction);

    expect(fsMock.readFileSync.callCount).to.equal(1);
    expect(fsMock.readFileSync.calls[0].args).to.eql([ validationFuncTemplateFile, 'utf8' ]);

    expect(fileFragmentLoaderMock.load.callCount).to.equal(1);
    expect(fileFragmentLoaderMock.load.calls[0].args)
      .to.eql([ validationFuncTemplateDir, expectedMacroName, originalValidationFuncTemplate ]);

    expect(docDefinitionsLoaderMock.load.callCount).to.equal(1);
    expect(docDefinitionsLoaderMock.load.calls[0].args).to.eql([ docDefinitionsFile ]);

    expect(indentMock.js.callCount).to.equal(1);
    expect(indentMock.js.calls[0].args).to.eql(
      [ `function my-validation-func-template() { ${docDefinitionsContent}; }`, { tabString: '  ' } ]);
  });
});
