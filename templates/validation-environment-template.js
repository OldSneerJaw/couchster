function makeValidationEnvironment(simpleMock) {
  var doc = { };
  var oldDoc = { };
  var typeIdValidator = { type: 'string' };
  var simpleTypeFilter = simpleMock.stub();
  var isDocumentMissingOrDeleted = simpleMock.stub();
  var isValueNullOrUndefined = simpleMock.stub();

  // Sync Gateway utility functions
  var requireAccess = simpleMock.stub();
  var requireRole = simpleMock.stub();
  var requireUser = simpleMock.stub();
  var channel = simpleMock.stub();

  // CouchDB utility functions
  var isArray = Array.isArray;
  var log = simpleMock.stub();
  var sum = (list) => list.reduce((accumulator, item) => accumulator + item, 0);
  var toJSON = JSON.stringify;

  return {
    doc: doc,
    oldDoc: oldDoc,
    typeIdValidator: typeIdValidator,
    simpleTypeFilter: simpleTypeFilter,
    isDocumentMissingOrDeleted: isDocumentMissingOrDeleted,
    isValueNullOrUndefined: isValueNullOrUndefined,
    requireAccess: requireAccess,
    requireRole: requireRole,
    requireUser: requireUser,
    channel: channel,
    isArray: isArray,
    log: log,
    sum: sum,
    toJSON: toJSON,
    documentDefinitions: %DOC_DEFINITIONS_PLACEHOLDER%
  };
}
