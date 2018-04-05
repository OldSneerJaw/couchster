function makeValidationEnvironment(simpleMock) {
  const newDoc = { };
  const oldDoc = { };
  const typeIdValidator = { type: 'string' };
  const simpleTypeFilter = simpleMock.stub();
  const isDocumentMissingOrDeleted = simpleMock.stub();
  const isValueNullOrUndefined = simpleMock.stub();

  // CouchDB utility functions
  const isArray = Array.isArray;
  const log = simpleMock.stub();
  const toJSON = JSON.stringify;

  function sum(list) {
    return list.reduce((accumulator, item) => accumulator + item, 0);
  }

  return {
    newDoc,
    oldDoc,
    typeIdValidator,
    simpleTypeFilter,
    isDocumentMissingOrDeleted,
    isValueNullOrUndefined,
    isArray,
    log,
    sum,
    toJSON,
    documentDefinitions: $DOC_DEFINITIONS_PLACEHOLDER$
  };
}
