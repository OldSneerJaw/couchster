{
  timeDoc: {
    typeFilter: simpleTypeFilter,
    authorizedRoles: { write: 'write' },
    propertyValidators: {
      formatValidationProp: {
        type: 'time'
      },
      minAndMaxInclusiveValuesProp: {
        type: 'time',
        minimumValue: '01:08:00.000',
        maximumValue: '01:09:01'
      },
      minAndMaxExclusiveValuesProp: {
        type: 'time',
        minimumValueExclusive: '13:42:00.999',
        maximumValueExclusive: '13:42:01.002'
      },
      immutableValidationProp: {
        type: 'time',
        immutableWhenSet: true
      }
    }
  },
  timeMustEqualDocType: {
    typeFilter: simpleTypeFilter,
    authorizedRoles: { write: 'write' },
    propertyValidators: {
      equalityValidationProp: {
        type: 'time',
        mustEqual: '22:56:00.000'
      }
    }
  }
}
