function makeTestEnvironment(simpleMock) {
  var requireAccess = simpleMock.stub();
  var requireRole = simpleMock.stub();
  var requireUser = simpleMock.stub();
  var channel = simpleMock.stub();

  var customActionStub = simpleMock.stub();

  return {
    requireAccess: requireAccess,
    requireRole: requireRole,
    requireUser: requireUser,
    channel: channel,
    customActionStub: customActionStub,
    validationFunction: %VALIDATION_FUNC_PLACEHOLDER%
  };
}
