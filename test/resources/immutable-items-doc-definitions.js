function() {
  function isImmutable(doc, oldDoc, value, oldValue) {
    return doc.dynamicPropertiesAreImmutable;
  }

  return {
    immutableItemsDoc: {
      authorizedRoles: { write: 'write' },
      typeFilter: function(doc) {
        return doc._id === 'immutableItemsDoc';
      },
      propertyValidators: {
        staticImmutableArrayProp: {
          type: 'array',
          immutable: true
        },
        staticImmutableObjectProp: {
          type: 'object',
          immutable: true
        },
        staticImmutableHashtableProp: {
          type: 'hashtable',
          immutable: true
        },
        dynamicPropertiesAreImmutable: {
          type: 'boolean'
        },
        dynamicImmutableArrayProp: {
          type: 'array',
          immutable: isImmutable
        },
        dynamicImmutableObjectProp: {
          type: 'object',
          immutable: isImmutable
        },
        dynamicImmutableHashtableProp: {
          type: 'hashtable',
          immutable: isImmutable
        }
      }
    }
  };
}
