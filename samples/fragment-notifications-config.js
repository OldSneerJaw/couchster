{
  authorizedRoles: function(doc, oldDoc) {
    return toDefaultDbRoles(doc, oldDoc, 'NOTIFICATIONS_CONFIG');
  },
  typeFilter: function(doc, oldDoc) {
    return createBusinessEntityRegex('notificationsConfig$').test(doc._id);
  },
  propertyValidators: {
    notificationTypes: {
      // A map of notification types -> enabled notification transports
      type: 'hashtable',
      hashtableKeysValidator: {
        mustNotBeEmpty: true,
        regexPattern: /^[a-zA-Z]+$/
      },
      hashtableValuesValidator: {
        type: 'object',
        required: true,
        propertyValidators: {
          enabledTransports: {
            // The list of notification transports that are enabled for the notification type
            type: 'array',
            arrayElementsValidator: {
              type: 'conditional',
              required: true,
              validationCandidates: [
                {
                  condition: function(doc, oldDoc, currentItemEntry, validationItemStack) {
                    return typeof currentItemEntry.itemValue === 'object';
                  },
                  validator: {
                    type: 'object',
                    propertyValidators: {
                      transportId: {
                        // The ID of the notification transport
                        type: 'string',
                        required: true,
                        mustNotBeEmpty: true
                      }
                    }
                  }
                },
                {
                  condition: function(doc, oldDoc, currentItemEntry, validationItemStack) {
                    return typeof currentItemEntry.itemValue === 'string';
                  },
                  validator: {
                    // The ID of the notification transport
                    type: 'string',
                    mustNotBeEmpty: true
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
}
