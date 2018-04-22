function validationModule(utils, simpleTypeFilter, typeIdValidator) {
  var documentPropertiesValidationModule =
    importValidationFunctionFragment('document-properties-validation-module.js')(utils, simpleTypeFilter, typeIdValidator);
  var documentConstraintsValidationModule =
    importValidationFunctionFragment('document-constraints-validation-module.js')(utils);

  return { validateDoc: validateDoc };

  function validateDoc(newDoc, oldDoc, userContext, securityInfo, docDefinition, docType) {
    var documentConstraintValidationErrors =
      documentConstraintsValidationModule.validateDocument(newDoc, oldDoc, userContext, securityInfo, docDefinition);

    // Only validate the document's contents if it's being created or replaced. There's no need if it's being deleted.
    var propertyConstraintValidationErrors = !newDoc._deleted ?
      documentPropertiesValidationModule.validateProperties(newDoc, oldDoc, userContext, securityInfo, docDefinition) :
      [ ];

    var validationErrors = documentConstraintValidationErrors.concat(propertyConstraintValidationErrors);

    if (validationErrors.length > 0) {
      throw { forbidden: 'Invalid ' + docType + ' document: ' + validationErrors.join('; ') };
    } else {
      return true;
    }
  }
}
