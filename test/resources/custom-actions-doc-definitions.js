function() {
  function customAction(actionType) {
    return function(doc, oldDoc, customActionMetadata, userContext, securityInfo) {
      // The most reliable means to get a result from a validation function is to throw it
      throw {
        doc: doc,
        oldDoc: oldDoc,
        customActionMetadata: customActionMetadata,
        userContext: userContext,
        securityInfo: securityInfo,
        actionType: actionType
      };
    };
  }

  var authorizedRoles = { write: 'write-role' };
  var authorizedUsers = { write: 'write-user' };

  return {
    onTypeIdentifiedDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onTypeIdentifiedDoc';
      },
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      customActions: { onTypeIdentificationSucceeded: customAction('onTypeIdentificationSucceeded') }
    },
    onAuthorizationDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onAuthorizationDoc';
      },
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      customActions: { onAuthorizationSucceeded: customAction('onAuthorizationSucceeded') }
    },
    onValidationDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onValidationDoc';
      },
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      customActions: { onValidationSucceeded: customAction('onValidationSucceeded') }
    }
  };
}
