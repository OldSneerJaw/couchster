function makeTestEnvironment(simpleMock) {
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
    validationFunction: function(newDoc, oldDoc, userContext, securityInfo) {
      try {
        ($VALIDATION_FUNC_PLACEHOLDER$)(newDoc, oldDoc, userContext, securityInfo);
      } catch (error) {
        /* Ensure that validation function errors are thrown as Error objects in test cases to avoid misleading test
           failure messages (https://github.com/OldSneerJaw/couchster/issues/15) */
        if (error.forbidden && !(error instanceof Error)) {
          const wrapperError = new Error(error.forbidden);
          wrapperError.forbidden = error.forbidden;

          throw wrapperError;
        } else {
          throw error;
        }
      }
    }
  };
}
