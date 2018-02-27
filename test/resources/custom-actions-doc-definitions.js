function() {
  function customAction(actionType) {
    return function(doc, oldDoc, customActionMetadata, userContext, securityInfo) {
      customActionMetadata.actionType = actionType;

      // This function is defined as a stub by the test-helper module to make it easy to verify whether a custom action has been executed
      customActionStub(doc, oldDoc, customActionMetadata, userContext, securityInfo);
    };
  }

  var channels = { write: 'write-channel' };
  var authorizedRoles = { write: 'write-role' };
  var authorizedUsers = { write: 'write-user' };

  return {
    onTypeIdentifiedDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onTypeIdentifiedDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      customActions: { onTypeIdentificationSucceeded: customAction('onTypeIdentificationSucceeded') }
    },
    onAuthorizationDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onAuthorizationDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      customActions: { onAuthorizationSucceeded: customAction('onAuthorizationSucceeded') }
    },
    onValidationDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onValidationDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      customActions: { onValidationSucceeded: customAction('onValidationSucceeded') }
    }
  };
}
