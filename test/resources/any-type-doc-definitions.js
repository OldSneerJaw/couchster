function() {
  return {
    anyTypeDoc: {
      typeFilter: simpleTypeFilter,
      authorizedRoles: { write: 'write' },
      propertyValidators: {
        arrayProp: {
          type: 'array',
          arrayElementsValidator: {
            type: 'any',
            required: true
          }
        },
        hashtableProp: {
          type: 'hashtable',
          hashtableValuesValidator: {
            type: 'any',
            immutableWhenSet: true
          }
        },
        anyProp: {
          type: 'any'
        }
      }
    }
  };
}
