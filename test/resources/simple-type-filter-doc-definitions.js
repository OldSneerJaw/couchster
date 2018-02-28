{
  myExplicitTypeValidatorDoc: {
    authorizedRoles: { write: 'write' },
    typeFilter: simpleTypeFilter,
    propertyValidators: {
      type: {
        type: 'string'
      }
    }
  },
  myImplicitTypeValidatorDoc: {
    authorizedRoles: { write: 'write' },
    typeFilter: simpleTypeFilter,
    propertyValidators: { }
  }
}
