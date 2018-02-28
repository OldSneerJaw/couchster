{
  typeIdDoc: {
    authorizedRoles: {
      write: [ 'write' ]
    },
    typeFilter: function(doc) {
      return doc._id === 'typeIdDoc';
    },
    propertyValidators: {
      typeIdProp: typeIdValidator
    }
  }
}
