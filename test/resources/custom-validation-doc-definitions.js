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
              customValidation: function(doc, oldDoc, currentItemEntry, validationItemStack) {
                var parentItemValue = validationItemStack[validationItemStack.length - 1].itemValue;
                if (parentItemValue && parentItemValue.failValidation) {
                  return [
                    'doc: ' + JSON.stringify(doc),
                    'oldDoc: ' + JSON.stringify(oldDoc),
                    'currentItemEntry: ' + JSON.stringify(currentItemEntry),
                    'validationItemStack: ' + JSON.stringify(validationItemStack)
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
