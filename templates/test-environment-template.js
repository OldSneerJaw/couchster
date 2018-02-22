function makeTestEnvironment(simpleMock) {
  var customActionStub = simpleMock.stub();

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
    customActionStub: customActionStub,
    requireAccess: requireAccess,
    requireRole: requireRole,
    requireUser: requireUser,
    channel: channel,
    isArray: isArray,
    log: log,
    sum: sum,
    toJSON: toJSON,
    validationFunction: %VALIDATION_FUNC_PLACEHOLDER%
  };
}
