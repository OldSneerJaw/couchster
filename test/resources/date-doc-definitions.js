{
  dateDoc: {
    authorizedRoles: { write: 'write' },
    typeFilter: function(doc) {
      return doc._id === 'dateDoc';
    },
    propertyValidators: {
      inclusiveRangeValidationProp: {
        type: 'date',
        minimumValue: new Date(Date.UTC(2015, 11, 31, 23, 59, 59, 999)),
        maximumValue: new Date(Date.UTC(2016, 0, 1, 23, 59, 59, 999))
      },
      exclusiveRangeValidationProp: {
        type: 'date',
        minimumValueExclusive: '2018',
        maximumValueExclusive: '2018-02-02'
      },
      formatValidationProp: {
        type: 'date'
      },
      immutableValidationProp: {
        type: 'date',
        immutableWhenSet: true
      }
    }
  },
  dateMustEqualDocType: {
    typeFilter: function(doc) {
      return doc._id === 'dateMustEqualDoc';
    },
    authorizedRoles: { write: 'write' },
    propertyValidators: {
      equalityValidationProp: {
        type: 'date',
        mustEqual: function() {
          return new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 0));
        }
      }
    }
  }
}
