{
  // Uses the type filter that is defined in the document definitions file in which this fragment is to be embedded
  typeFilter: myCustomDocTypeFilter('stringFragmentDoc'),
  authorizedRoles: { write: 'write' },
  propertyValidators: {
    stringProp: {
      type: 'string'
    }
  }
}
