{
  authorizedRoles: toDefaultDbRoles(doc, oldDoc, 'NOTIFICATIONS_CONFIG'),
  typeFilter: function(doc, oldDoc) {
    return createBusinessEntityRegex('notificationTransport\\.[A-Za-z0-9_-]+$').test(doc._id);
  },
  propertyValidators: {
    type: {
      // The type of notification transport (e.g. email, sms). Used by a notification service to determine how to deliver a
      // notification.
      type: 'string',
      required: true,
      mustNotBeEmpty: true
    },
    recipient: {
      // The intended recipient for notifications that are configured to use this transport
      type: 'string',
      required: true,
      mustNotBeEmpty: true
    }
  },
  customActions: {
    onAuthorizationSucceeded: function(doc, oldDoc, customActionMetadata, userContext, securityInfo) {
      var userRoles = (userContext && userContext.roles) ? userContext.roles : [ ];
      if (doc._deleted) {
        // The document is being removed, so ensure the user has the document's "-delete" role in addition to one of the
        // roles defined in the document definition's "roles.remove" property
        if (userRoles.indexOf(doc._id + '-delete') < 0) {
          throw { forbidden: 'Operation forbidden' };
        }
      } else if (oldDoc && !oldDoc._deleted) {
        // The document is being replaced, so ensure the user has the document's "-replace" role in addition to one of the
        // roles defined in the document definition's "roles.replace" property
        if (userRoles.indexOf(doc._id + '-replace') < 0) {
          throw { forbidden: 'Operation forbidden' };
        }
      }
    }
  }
}
