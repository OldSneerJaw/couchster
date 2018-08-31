{
  authorizedRoles: function(doc, oldDoc) {
    var businessId = getBusinessId(doc, oldDoc);

    // Only service users can create new notifications
    return {
      add: [ 'notification-add' ],
      replace: [ toDbRole(businessId, 'CHANGE_NOTIFICATIONS') ],
      remove: [ toDbRole(businessId, 'REMOVE_NOTIFICATIONS') ]
    };
  },
  typeFilter: function(doc, oldDoc) {
    return createBusinessEntityRegex('notification\\.[A-Za-z0-9_-]+$').test(doc._id);
  },
  propertyValidators: {
    eventId: {
      type: 'uuid',
      required: true,
      immutable: true
    },
    sender: {
      // Which Kashoo app/service generated the notification
      type: 'string',
      required: true,
      mustNotBeEmpty: true,
      immutable: true
    },
    users: {
      type: 'array',
      immutable: true,
      arrayElementsValidator: {
        type: 'string',
        required: true,
        mustNotBeEmpty: true
      }
    },
    groups: {
      type: 'array',
      immutable: true,
      arrayElementsValidator: {
        type: 'string',
        required: true,
        mustNotBeEmpty: true
      }
    },
    type: {
      // The type of notification. Corresponds to an entry in the business' notificationsConfig.notificationTypes property.
      type: 'string',
      required: true,
      mustNotBeEmpty: true,
      immutable: true
    },
    subject: {
      // The subject line of the notification
      type: 'string',
      required: true,
      mustNotBeEmpty: true,
      immutable: true
    },
    message: {
      // The message body of the notification
      type: 'string',
      required: true,
      mustNotBeEmpty: true,
      immutable: true
    },
    createdAt: {
      // When the notification was first created
      type: 'datetime',
      required: true,
      immutable: true
    },
    firstReadAt: {
      // When the notification was first read
      type: 'datetime',
      immutableWhenSet: true
    },
    siteName: {
      // The name of the white label site/brand for which the notification was generated
      type: 'string',
      mustNotBeEmpty: true,
      immutable: true
    },
    actions: {
      // A list of actions that are available to the recipient of the notification
      type: 'array',
      immutable: true,
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
                url: {
                  // The URL of the action
                  type: 'string',
                  required: true,
                  mustNotBeEmpty: true
                },
                label: {
                  // A plain text label for the action
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
              // The URL of the action
              type: 'string',
              mustNotBeEmpty: true
            }
          }
        ]
      }
    }
  }
}
