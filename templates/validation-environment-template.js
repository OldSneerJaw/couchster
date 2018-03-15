function makeValidationEnvironment(simpleMock) {
  const doc = { };
  const oldDoc = { };
  const typeIdValidator = { type: 'string' };
  const simpleTypeFilter = simpleMock.stub();
  const isDocumentMissingOrDeleted = simpleMock.stub();
  const isValueNullOrUndefined = simpleMock.stub();

  // CouchDB utility functions
  const isArray = Array.isArray;
  const log = simpleMock.stub();
  const sum = (list) => list.reduce((accumulator, item) => accumulator + item, 0);
  const toJSON = JSON.stringify;

  return {
    doc,
    oldDoc,
    typeIdValidator,
    simpleTypeFilter,
    isDocumentMissingOrDeleted,
    isValueNullOrUndefined,
    isArray,
    log,
    sum,
    toJSON,
    documentDefinitions: %DOC_DEFINITIONS_PLACEHOLDER%
  };
}
