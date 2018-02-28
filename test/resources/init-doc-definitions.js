{
  initDoc: {
    typeFilter: simpleTypeFilter,
    authorizedRoles: { write: 'write' },
    propertyValidators: {
      testProp: {
        type: 'float',
        required: true
      }
    }
  }
}
