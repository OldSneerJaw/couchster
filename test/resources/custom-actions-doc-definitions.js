function() {
  function customAction(actionType) {
    return function(doc, oldDoc, customActionMetadata) {
      customActionMetadata.actionType = actionType;

      // This function is defined as a stub by the test-helper module to make it easy to verify whether a custom action has been executed
      customActionStub(doc, oldDoc, customActionMetadata);
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
    },
    onDocChannelsAssignedDoc: {
      typeFilter: function(doc, oldDoc) {
        return doc._id === 'onDocChannelsAssignedDoc';
      },
      channels: channels,
      authorizedRoles: authorizedRoles,
      authorizedUsers: authorizedUsers,
      propertyValidators: { },
      customActions: { onDocumentChannelAssignmentSucceeded: customAction('onDocumentChannelAssignmentSucceeded') }
    }
  };
}
