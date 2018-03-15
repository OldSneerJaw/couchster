function makeTestEnvironment(simpleMock) {
  // CouchDB utility functions
  const isArray = Array.isArray;
  const log = simpleMock.stub();
  const sum = (list) => list.reduce((accumulator, item) => accumulator + item, 0);
  const toJSON = JSON.stringify;

  return {
    isArray,
    log,
    sum,
    toJSON,
    validationFunction: %VALIDATION_FUNC_PLACEHOLDER%
  };
}
