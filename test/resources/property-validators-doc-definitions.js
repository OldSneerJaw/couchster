function() {
  function docTypeFilter(doc, oldDoc, docType) {
    return doc._id === docType;
  }

  var authorizedRoles = { write: 'write' };

  return {
    staticAllowUnknownDoc: {
      typeFilter: docTypeFilter,
      authorizedRoles: authorizedRoles,
      allowUnknownProperties: true,
      propertyValidators: {
        preventUnknownProp: {
          type: 'object',
          allowUnknownProperties: false,
          propertyValidators: {
            myStringProp: {
              type: 'string'
            }
          }
        }
      }
    },
    staticPreventUnknownDoc: {
      typeFilter: docTypeFilter,
      authorizedRoles: authorizedRoles,
      allowUnknownProperties: false,
      propertyValidators: {
        allowUnknownProp: {
          type: 'object',
          allowUnknownProperties: true,
          propertyValidators: {
            myStringProp: {
              type: 'string'
            }
          }
        }
      }
    },
    dynamicPropertiesValidationDoc: {
      typeFilter: simpleTypeFilter,
      authorizedRoles: authorizedRoles,
      allowUnknownProperties: function(doc, oldDoc) {
        return doc.unknownPropertiesAllowed;
      },
      propertyValidators: function(doc, oldDoc) {
        var props = {
          unknownPropertiesAllowed: { type: 'boolean' }
        };

        if (doc._id === 'foobar') {
          props.extraProperty = { type: 'float' };
        } else {
          props.extraProperty = { type: 'string' };
        }

        return props;
      }
    },
    dynamicObjectValidationDoc: {
      typeFilter: simpleTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        subObject: {
          type: 'object',
          allowUnknownProperties: function(doc, oldDoc, value, oldValue) {
            return doc.subObject.unknownPropertiesAllowed;
          },
          propertyValidators: function(doc, oldDoc, value, oldValue) {
            var props = {
              unknownPropertiesAllowed: { type: 'boolean' }
            };

            if (doc._id === 'foobar') {
              props.extraProperty = { type: 'float' };
            } else {
              props.extraProperty = { type: 'string' };
            }

            return props;
          }
        }
      }
    }
  };
}
