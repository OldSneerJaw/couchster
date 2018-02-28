{
  typeFilter: simpleTypeFilter,
  authorizedRoles: { write: 'write' },
  propertyValidators: {
    objectProp: {
      type: 'object',
      required: true,
      propertyValidators: {
        nestedProperty: importDocumentDefinitionFragment('fragment-nested-property.js')
      }
    }
  }
}
