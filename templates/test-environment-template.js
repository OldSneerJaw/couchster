function makeTestEnvironment(simpleMock) {
  var requireAccess = simpleMock.stub();
  var requireRole = simpleMock.stub();
  var requireUser = simpleMock.stub();
  var channel = simpleMock.stub();
  var access = simpleMock.stub();
  var role = simpleMock.stub();

  var customActionStub = simpleMock.stub();

  return {
    requireAccess: requireAccess,
    requireRole: requireRole,
    requireUser: requireUser,
    channel: channel,
    access: access,
    role: role,
    customActionStub: customActionStub,
    validationFunction: %VALIDATION_FUNC_PLACEHOLDER%
  };
}
