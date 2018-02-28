{
  uuidDocType: {
    typeFilter: simpleTypeFilter,
    authorizedRoles: { write: 'write' },
    propertyValidators: {
      formatValidationProp: {
        type: 'uuid'
      },
      rangeValidationProp: {
        type: 'uuid',
        minimumValue: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        maximumValue: 'DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD'
      },
      immutableValidationProp: {
        type: 'uuid',
        immutableWhenSet: true
      }
    }
  },
  uuidMustEqualDocType: {
    typeFilter: simpleTypeFilter,
    authorizedRoles: { write: 'write' },
    propertyValidators: {
      equalityValidationProp: {
        type: 'uuid',
        mustEqual: '5e7f697b-fe56-4b98-a68b-aae104bff1d4'
      }
    }
  }
}
