function() {
  return {
    customValidationDoc: {
      typeFilter: simpleTypeFilter,
      authorizedRoles: { write: 'write' },
      propertyValidators: {
        baseProp: {
          type: 'object',
          propertyValidators: {
            failValidation: {
              type: 'boolean'
            },
            customValidationProp: {
              type: 'string',
              customValidation: function(doc, oldDoc, currentItemEntry, validationItemStack, userContext, securityInfo) {
                var parentItemValue = validationItemStack[validationItemStack.length - 1].itemValue;
                if (parentItemValue && parentItemValue.failValidation) {
                  return [
                    'doc: ' + JSON.stringify(doc),
                    'oldDoc: ' + JSON.stringify(oldDoc),
                    'currentItemEntry: ' + JSON.stringify(currentItemEntry),
                    'validationItemStack: ' + JSON.stringify(validationItemStack),
                    'userContext: ' + JSON.stringify(userContext),
                    'securityInfo: ' + JSON.stringify(securityInfo)
                  ];
                } else {
                  return [ ];
                }
              }
            }
          }
        }
      }
    }
  };
}
