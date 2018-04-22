function documentConstraintsValidationModule(utils) {
  return { validateDocument: validateDocument };

  function validateDocument(newDoc, oldDoc, userContext, securityInfo, docDefinition) {
    var validationErrors = [ ];

    validateDocImmutability(newDoc, oldDoc, docDefinition, validationErrors);

    validateDocumentIdRegexPattern(newDoc, oldDoc, docDefinition, validationErrors);

    return validationErrors;
  }

  function validateDocImmutability(newDoc, oldDoc, docDefinition, validationErrors) {
    if (!utils.isDocumentMissingOrDeleted(oldDoc)) {
      if (utils.resolveDocumentConstraint(docDefinition.immutable)) {
        validationErrors.push('documents of this type cannot be replaced or deleted');
      } else if (newDoc._deleted) {
        if (utils.resolveDocumentConstraint(docDefinition.cannotDelete)) {
          validationErrors.push('documents of this type cannot be deleted');
        }
      } else {
        if (utils.resolveDocumentConstraint(docDefinition.cannotReplace)) {
          validationErrors.push('documents of this type cannot be replaced');
        }
      }
    }
  }

  function validateDocumentIdRegexPattern(newDoc, oldDoc, docDefinition, validationErrors) {
    if (!newDoc._deleted && !oldDoc) {
      // The constraint only applies when a document is created
      var documentIdRegexPattern = utils.resolveDocumentConstraint(docDefinition.documentIdRegexPattern);

      if (documentIdRegexPattern instanceof RegExp && !documentIdRegexPattern.test(newDoc._id)) {
        validationErrors.push('document ID must conform to expected pattern ' + documentIdRegexPattern);
      }
    }
  }
}
