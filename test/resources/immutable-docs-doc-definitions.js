function() {
  function docTypeFilter(doc, oldDoc, docType) {
    return doc._id === docType;
  }

  function isImmutable(doc, oldDoc) {
    return oldDoc ? oldDoc.applyImmutability : doc.applyImmutability;
  }

  var authorizedRoles = { write: 'write' };

  return {
    staticImmutableDoc: {
      typeFilter: docTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        stringProp: {
          type: 'string'
        }
      },
      immutable: true,
      allowAttachments: true
    },
    dynamicImmutableDoc: {
      typeFilter: docTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        integerProp: {
          type: 'integer'
        },
        applyImmutability: {
          type: 'boolean'
        }
      },
      immutable: isImmutable
    },
    staticCannotReplaceDoc: {
      typeFilter: docTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        stringProp: {
          type: 'string'
        }
      },
      cannotReplace: true,
      allowAttachments: true
    },
    dynamicCannotReplaceDoc: {
      typeFilter: docTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        integerProp: {
          type: 'integer'
        },
        applyImmutability: {
          type: 'boolean'
        }
      },
      cannotReplace: isImmutable
    },
    staticCannotDeleteDoc: {
      typeFilter: docTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        stringProp: {
          type: 'string'
        }
      },
      cannotDelete: true,
      allowAttachments: true
    },
    dynamicCannotDeleteDoc: {
      typeFilter: docTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        integerProp: {
          type: 'integer'
        },
        applyImmutability: {
          type: 'boolean'
        }
      },
      cannotDelete: isImmutable
    }
  };
}
