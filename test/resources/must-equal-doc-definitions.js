function() {
  var authorizedRoles = { write: 'write' };

  function sharedTypeFilter(doc, oldDoc, docType) {
    return doc._id === docType;
  }

  function getExpectedDynamicValue(doc, oldDoc, value, oldValue) {
    return doc.expectedDynamicValue;
  }

  return {
    staticArrayDoc: {
      typeFilter: sharedTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        arrayProp: {
          type: 'array',
          mustEqual: [ 16.2, [ 'foobar', 3, false ], [ 45.9 ], null, { foo: 'bar' }, [ ] ]
        }
      }
    },
    dynamicArrayDoc: {
      typeFilter: sharedTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        expectedDynamicValue: {
          type: 'array'
        },
        arrayProp: {
          type: 'array',
          mustEqual: getExpectedDynamicValue
        }
      }
    },
    staticObjectDoc: {
      typeFilter: sharedTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        objectProp: {
          type: 'object',
          mustEqual: {
            myStringProp: 'foobar',
            myIntegerProp: 8,
            myBooleanProp: true,
            myFloatProp: 88.92,
            myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { } ],
            myObjectProp: { foo: 'bar', baz: 73, qux: [ ] }
          }
        }
      }
    },
    dynamicObjectDoc: {
      typeFilter: sharedTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        expectedDynamicValue: {
          type: 'object'
        },
        objectProp: {
          type: 'object',
          mustEqual: getExpectedDynamicValue
        }
      }
    },
    staticHashtableDoc: {
      typeFilter: sharedTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        hashtableProp: {
          type: 'hashtable',
          mustEqual: {
            myArrayProp: [ 'foobar', 3, false, 45.9, [ null ], { foobar: 18 } ],
            myObjectProp: { foo: 'bar', baz: 73, qux: [ ] },
            myStringProp: 'foobar',
            myIntegerProp: 8,
            myBooleanProp: true,
            myFloatProp: 88.92
          }
        }
      }
    },
    dynamicHashtableDoc: {
      typeFilter: sharedTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        expectedDynamicValue: {
          type: 'hashtable'
        },
        hashtableProp: {
          type: 'hashtable',
          mustEqual: getExpectedDynamicValue
        }
      }
    },
    arrayElementConstraintDoc: {
      typeFilter: sharedTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        arrayProp: {
          type: 'array',
          arrayElementsValidator: {
            type: 'string',
            mustEqual: 'foobar'
          }
        }
      }
    },
    hashtableElementConstraintDoc: {
      typeFilter: sharedTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        hashtableProp: {
          type: 'hashtable',
          hashtableValuesValidator: {
            type: 'integer',
            mustEqual: -15
          }
        }
      }
    },
    nullExpectedValueDoc: {
      typeFilter: sharedTypeFilter,
      authorizedRoles: authorizedRoles,
      propertyValidators: {
        stringProp: {
          type: 'string',
          mustEqual: null
        }
      }
    }
  };
}
