function makeValidationEnvironment(simpleMock) {
  var doc = { };
  var oldDoc = { };
  var typeIdValidator = { type: 'string' };
  var simpleTypeFilter = simpleMock.stub();
  var isDocumentMissingOrDeleted = simpleMock.stub();
  var isValueNullOrUndefined = simpleMock.stub();
  var requireAccess = simpleMock.stub();
  var requireRole = simpleMock.stub();
  var requireUser = simpleMock.stub();
  var channel = simpleMock.stub();

  var customActionStub = simpleMock.stub();

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
    customActionStub: customActionStub,
    documentDefinitions: %DOC_DEFINITIONS_PLACEHOLDER%
  };
}
