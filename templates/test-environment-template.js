function makeTestEnvironment(_, simple) {
  var requireAccess = simple.stub();
  var requireRole = simple.stub();
  var requireUser = simple.stub();
  var channel = simple.stub();
  var access = simple.stub();
  var role = simple.stub();

  var customActionStub = simple.stub();

  return {
    _: _,
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
