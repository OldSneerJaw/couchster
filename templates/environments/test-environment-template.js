function makeTestEnvironment(simpleMock) {
  // CouchDB utility functions
  const isArray = Array.isArray;
  const log = simpleMock.stub();
  const toJSON = JSON.stringify;

  function sum(list) {
    return list.reduce((accumulator, item) => accumulator + item, 0);
  }

  return {
    isArray,
    log,
    sum,
    toJSON,
    validationFunction: $VALIDATION_FUNC_PLACEHOLDER$
  };
}
