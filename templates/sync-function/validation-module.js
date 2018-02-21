function validationModule(utils, simpleTypeFilter, typeIdValidator) {
  var timeModule = importSyncFunctionFragment('time-module.js')(utils);
  var comparisonModule = importSyncFunctionFragment('comparison-module.js')(utils, buildItemPath, timeModule);

  function isUuid(value) {
    var regex = /^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/;

    return regex.test(value);
  }

  // Constructs the fully qualified path of the item at the top of the given stack
  function buildItemPath(itemStack) {
    var nameComponents = [ ];
    for (var i = 0; i < itemStack.length; i++) {
      var itemName = itemStack[i].itemName;

      if (!itemName) {
        // Skip null or empty names (e.g. the first element is typically the root of the document, which has no name)
        continue;
      } else if (nameComponents.length < 1 || itemName.indexOf('[') === 0) {
        nameComponents.push(itemName);
      } else {
        nameComponents.push('.' + itemName);
      }
    }

    return nameComponents.join('');
  }

  // Resolves a constraint defined at the document level (e.g. `propertyValidators`, `allowUnknownProperties`, `immutable`).
  function resolveDocConstraint(doc, oldDoc, constraintDefinition) {
    return (typeof constraintDefinition === 'function') ? constraintDefinition(doc, utils.resolveOldDoc(oldDoc)) : constraintDefinition;
  }

  // Ensures the document structure and content are valid
  function validateDoc(doc, oldDoc, docDefinition, docType) {
    var validationErrors = [ ];

    validateDocImmutability(doc, oldDoc, docDefinition, validationErrors);

    // Only validate the document's contents if it's being created or replaced. There's no need if it's being deleted.
    if (!doc._deleted) {
      validateDocContents(
        doc,
        oldDoc,
        docDefinition,
        validationErrors);
    }

    if (validationErrors.length > 0) {
      throw { forbidden: 'Invalid ' + docType + ' document: ' + validationErrors.join('; ') };
    }
  }

  function validateDocImmutability(doc, oldDoc, docDefinition, validationErrors) {
    if (!utils.isDocumentMissingOrDeleted(oldDoc)) {
      if (resolveDocConstraint(doc, oldDoc, docDefinition.immutable)) {
        validationErrors.push('documents of this type cannot be replaced or deleted');
      } else if (doc._deleted) {
        if (resolveDocConstraint(doc, oldDoc, docDefinition.cannotDelete)) {
          validationErrors.push('documents of this type cannot be deleted');
        }
      } else {
        if (resolveDocConstraint(doc, oldDoc, docDefinition.cannotReplace)) {
          validationErrors.push('documents of this type cannot be replaced');
        }
      }
    }
  }

  function validateDocContents(doc, oldDoc, docDefinition, validationErrors) {
    var itemStack = [
      {
        itemValue: doc,
        oldItemValue: oldDoc,
        itemName: null
      }
    ];

    var resolvedPropertyValidators = resolveDocConstraint(doc, oldDoc, docDefinition.propertyValidators);

    // Ensure that, if the document type uses the simple type filter, it supports the "type" property
    if (docDefinition.typeFilter === simpleTypeFilter && utils.isValueNullOrUndefined(resolvedPropertyValidators.type)) {
      resolvedPropertyValidators.type = typeIdValidator;
    }

    var attachmentModule =
      importSyncFunctionFragment('attachment-module.js')(utils, buildItemPath, resolveDocConstraint, resolveItemConstraint);

    // Execute each of the document's property validators while ignoring internal document properties at the root level
    validateProperties(
      resolvedPropertyValidators,
      resolveDocConstraint(doc, oldDoc, docDefinition.allowUnknownProperties),
      true);

    if (doc._attachments) {
      storeOptionalValidationErrors(attachmentModule.validateAttachments(doc, oldDoc, docDefinition));
    }

    // The following functions are nested within this function so they can share access to the doc, oldDoc and validationErrors params and
    // the attachmentReferenceValidators and itemStack variables
    function resolveItemConstraint(constraintDefinition) {
      if (typeof constraintDefinition === 'function') {
        var currentItemEntry = itemStack[itemStack.length - 1];

        return constraintDefinition(doc, utils.resolveOldDoc(oldDoc), currentItemEntry.itemValue, currentItemEntry.oldItemValue);
      } else {
        return constraintDefinition;
      }
    }

    function validateProperties(propertyValidators, allowUnknownProperties, ignoreInternalProperties) {
      var currentItemEntry = itemStack[itemStack.length - 1];
      var objectValue = currentItemEntry.itemValue;
      var oldObjectValue = currentItemEntry.oldItemValue;

      var supportedProperties = [ ];
      for (var propertyValidatorName in propertyValidators) {
        var validator = propertyValidators[propertyValidatorName];
        if (utils.isValueNullOrUndefined(validator) || utils.isValueNullOrUndefined(resolveItemConstraint(validator.type))) {
          // Skip over non-validator fields/properties
          continue;
        }

        var propertyValue = objectValue[propertyValidatorName];

        var oldPropertyValue;
        if (!utils.isValueNullOrUndefined(oldObjectValue)) {
          oldPropertyValue = oldObjectValue[propertyValidatorName];
        }

        supportedProperties.push(propertyValidatorName);

        itemStack.push({
          itemValue: propertyValue,
          oldItemValue: oldPropertyValue,
          itemName: propertyValidatorName
        });

        validateItemValue(validator);

        itemStack.pop();
      }

      // Verify there are no unsupported properties in the object
      if (!allowUnknownProperties) {
        for (var propertyName in objectValue) {
          if (ignoreInternalProperties && propertyName.indexOf('_') === 0) {
            // These properties are special cases that should always be allowed - generally only applied at the root level of the document
            continue;
          }

          if (supportedProperties.indexOf(propertyName) < 0) {
            var objectPath = buildItemPath(itemStack);
            var fullPropertyPath = objectPath ? objectPath + '.' + propertyName : propertyName;
            validationErrors.push('property "' + fullPropertyPath + '" is not supported');
          }
        }
      }
    }

    function validateItemValue(validator) {
      var currentItemEntry = itemStack[itemStack.length - 1];
      var itemValue = currentItemEntry.itemValue;
      var validatorType = resolveItemConstraint(validator.type);

      if (validator.customValidation) {
        performCustomValidation(validator);
      }

      if (!utils.isDocumentMissingOrDeleted(oldDoc)) {
        if (resolveItemConstraint(validator.immutable)) {
          storeOptionalValidationErrors(comparisonModule.validateImmutable(itemStack, false, validator.type));
        }

        if (resolveItemConstraint(validator.immutableStrict)) {
          // Omitting validator type forces it to perform strict equality comparisons for specialized string types
          // (e.g. "date", "datetime", "time", "timezone", "uuid")
          storeOptionalValidationErrors(comparisonModule.validateImmutable(itemStack, false));
        }

        if (resolveItemConstraint(validator.immutableWhenSet)) {
          storeOptionalValidationErrors(comparisonModule.validateImmutable(itemStack, true, validator.type));
        }

        if (resolveItemConstraint(validator.immutableWhenSetStrict)) {
          // Omitting validator type forces it to perform strict equality comparisons for specialized string types
          // (e.g. "date", "datetime", "time", "timezone", "uuid")
          storeOptionalValidationErrors(comparisonModule.validateImmutable(itemStack, true));
        }
      }

      var expectedEqualValue = resolveItemConstraint(validator.mustEqual);
      if (typeof expectedEqualValue !== 'undefined') {
        storeOptionalValidationErrors(comparisonModule.validateEquality(itemStack, expectedEqualValue, validator.type));
      }

      var expectedStrictEqualValue = resolveItemConstraint(validator.mustEqualStrict);
      if (typeof expectedStrictEqualValue !== 'undefined') {
        // Omitting validator type forces it to perform strict equality comparisons for specialized string types
        // (e.g. "date", "datetime", "time", "timezone", "uuid")
        storeOptionalValidationErrors(comparisonModule.validateEquality(itemStack, expectedStrictEqualValue));
      }

      if (!utils.isValueNullOrUndefined(itemValue)) {
        if (resolveItemConstraint(validator.mustNotBeEmpty) && itemValue.length < 1) {
          validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be empty');
        }

        var minimumValue = resolveItemConstraint(validator.minimumValue);
        if (!utils.isValueNullOrUndefined(minimumValue)) {
          storeOptionalValidationErrors(comparisonModule.validateMinValueInclusiveConstraint(itemStack, minimumValue, validatorType));
        }

        var minimumValueExclusive = resolveItemConstraint(validator.minimumValueExclusive);
        if (!utils.isValueNullOrUndefined(minimumValueExclusive)) {
          storeOptionalValidationErrors(comparisonModule.validateMinValueExclusiveConstraint(
            itemStack,
            minimumValueExclusive,
            validatorType));
        }

        var maximumValue = resolveItemConstraint(validator.maximumValue);
        if (!utils.isValueNullOrUndefined(maximumValue)) {
          storeOptionalValidationErrors(comparisonModule.validateMaxValueInclusiveConstraint(itemStack, maximumValue, validatorType));
        }

        var maximumValueExclusive = resolveItemConstraint(validator.maximumValueExclusive);
        if (!utils.isValueNullOrUndefined(maximumValueExclusive)) {
          storeOptionalValidationErrors(comparisonModule.validateMaxValueExclusiveConstraint(
            itemStack,
            maximumValueExclusive,
            validatorType));
        }

        var minimumLength = resolveItemConstraint(validator.minimumLength);
        if (!utils.isValueNullOrUndefined(minimumLength) && itemValue.length < minimumLength) {
          validationErrors.push('length of item "' + buildItemPath(itemStack) + '" must not be less than ' + minimumLength);
        }

        var maximumLength = resolveItemConstraint(validator.maximumLength);
        if (!utils.isValueNullOrUndefined(maximumLength) && itemValue.length > maximumLength) {
          validationErrors.push('length of item "' + buildItemPath(itemStack) + '" must not be greater than ' + maximumLength);
        }

        switch (validatorType) {
          case 'string':
            if (typeof itemValue !== 'string') {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be a string');
            } else {
              validateString(validator);
            }
            break;
          case 'integer':
            if (!utils.isValueAnInteger(itemValue)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an integer');
            }
            break;
          case 'float':
            if (typeof itemValue !== 'number') {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be a floating point or integer number');
            }
            break;
          case 'boolean':
            if (typeof itemValue !== 'boolean') {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be a boolean');
            }
            break;
          case 'datetime':
            if (typeof itemValue !== 'string' || !timeModule.isIso8601DateTimeString(itemValue)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an ECMAScript simplified ISO 8601 date string with optional time and time zone components');
            }
            break;
          case 'date':
            if (typeof itemValue !== 'string' || !timeModule.isIso8601DateString(itemValue)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an ECMAScript simplified ISO 8601 date string with no time or time zone components');
            }
            break;
          case 'time':
            if (typeof itemValue !== 'string' || !timeModule.isIso8601TimeString(itemValue)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an ECMAScript simplified ISO 8601 time string with no date or time zone components');
            }
            break;
          case 'timezone':
            if (typeof itemValue !== 'string' || !timeModule.isIso8601TimeZoneString(itemValue)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an ECMAScript simplified ISO 8601 time zone string');
            }
            break;
          case 'enum':
            var enumPredefinedValues = resolveItemConstraint(validator.predefinedValues);
            if (!(enumPredefinedValues instanceof Array)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" belongs to an enum that has no predefined values');
            } else if (enumPredefinedValues.indexOf(itemValue) < 0) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be one of the predefined values: ' + enumPredefinedValues.join(','));
            }
            break;
          case 'uuid':
            if (!isUuid(itemValue)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be a UUID string');
            }
            break;
          case 'object':
            var childPropertyValidators = resolveItemConstraint(validator.propertyValidators);
            if (typeof itemValue !== 'object' || itemValue instanceof Array) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an object');
            } else if (childPropertyValidators) {
              validateProperties(childPropertyValidators, resolveItemConstraint(validator.allowUnknownProperties));
            }
            break;
          case 'array':
            validateArray(resolveItemConstraint(validator.arrayElementsValidator));
            break;
          case 'hashtable':
            validateHashtable(validator);
            break;
          case 'attachmentReference':
            storeOptionalValidationErrors(attachmentModule.validateAttachmentReference(validator, itemStack, doc._attachments));
            break;
          default:
            // This is not a document validation error; the item validator is configured incorrectly and must be fixed
            throw { forbidden: 'No data type defined for validator of item "' + buildItemPath(itemStack) + '"' };
        }
      } else if (resolveItemConstraint(validator.required)) {
        // The item has no value (either it's null or undefined), but the validator indicates it is required
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be null or missing');
      } else if (resolveItemConstraint(validator.mustNotBeMissing) && typeof itemValue === 'undefined') {
        // The item is missing (i.e. it's undefined), but the validator indicates it must not be
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be missing');
      } else if (resolveItemConstraint(validator.mustNotBeNull) && itemValue === null) {
        // The item is null, but the validator indicates it must not be
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be null');
      }
    }

    function storeOptionalValidationErrors(errorMessages) {
      if (typeof errorMessages === 'string') {
        validationErrors.push(errorMessages);
      } else if (errorMessages instanceof Array) {
        for (var errorMessageIndex = 0; errorMessageIndex < errorMessages.length; errorMessageIndex++) {
          validationErrors.push(errorMessages[errorMessageIndex]);
        }
      }
    }

    function validateString(validator) {
      var currentItemEntry = itemStack[itemStack.length - 1];
      var itemValue = currentItemEntry.itemValue;

      var regexPattern = resolveItemConstraint(validator.regexPattern);
      if (regexPattern && !regexPattern.test(itemValue)) {
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must conform to expected format ' + regexPattern);
      }

      var mustBeTrimmed = resolveItemConstraint(validator.mustBeTrimmed);
      if (mustBeTrimmed && isStringUntrimmed(itemValue)) {
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must not have any leading or trailing whitespace');
      }
    }

    function isStringUntrimmed(value) {
      if (utils.isValueNullOrUndefined(value)) {
        return false;
      } else {
        return value !== value.trim();
      }
    }

    function validateArray(elementValidator) {
      var currentItemEntry = itemStack[itemStack.length - 1];
      var itemValue = currentItemEntry.itemValue;
      var oldItemValue = currentItemEntry.oldItemValue;

      if (!(itemValue instanceof Array)) {
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an array');
      } else if (elementValidator) {
        // Validate each element in the array
        for (var elementIndex = 0; elementIndex < itemValue.length; elementIndex++) {
          var elementName = '[' + elementIndex + ']';
          var elementValue = itemValue[elementIndex];
          var oldElementValue =
            (!utils.isValueNullOrUndefined(oldItemValue) && elementIndex < oldItemValue.length) ? oldItemValue[elementIndex] : null;

          itemStack.push({
            itemName: elementName,
            itemValue: elementValue,
            oldItemValue: oldElementValue
          });

          validateItemValue(elementValidator);

          itemStack.pop();
        }
      }
    }

    function validateHashtable(validator) {
      var keyValidator = resolveItemConstraint(validator.hashtableKeysValidator);
      var valueValidator = resolveItemConstraint(validator.hashtableValuesValidator);
      var currentItemEntry = itemStack[itemStack.length - 1];
      var itemValue = currentItemEntry.itemValue;
      var oldItemValue = currentItemEntry.oldItemValue;
      var hashtablePath = buildItemPath(itemStack);

      if (typeof itemValue !== 'object' || itemValue instanceof Array) {
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an object/hashtable');
      } else {
        var size = 0;
        for (var elementKey in itemValue) {
          size++;
          var elementValue = itemValue[elementKey];

          var elementName = '[' + elementKey + ']';
          if (keyValidator) {
            var fullKeyPath = hashtablePath ? hashtablePath + elementName : elementName;
            if (typeof elementKey !== 'string') {
              validationErrors.push('hashtable key "' + fullKeyPath + '" is not a string');
            } else {
              if (resolveItemConstraint(keyValidator.mustNotBeEmpty) && elementKey.length < 1) {
                validationErrors.push('hashtable "' + buildItemPath(itemStack) + '" must not have an empty key');
              }
              var regexPattern = resolveItemConstraint(keyValidator.regexPattern);
              if (regexPattern && !regexPattern.test(elementKey)) {
                validationErrors.push('hashtable key "' + fullKeyPath + '" must conform to expected format ' + regexPattern);
              }
            }
          }

          if (valueValidator) {
            var oldElementValue;
            if (!utils.isValueNullOrUndefined(oldItemValue)) {
              oldElementValue = oldItemValue[elementKey];
            }

            itemStack.push({
              itemName: elementName,
              itemValue: elementValue,
              oldItemValue: oldElementValue
            });

            validateItemValue(valueValidator);

            itemStack.pop();
          }
        }

        var maximumSize = resolveItemConstraint(validator.maximumSize);
        if (!utils.isValueNullOrUndefined(maximumSize) && size > maximumSize) {
          validationErrors.push('hashtable "' + hashtablePath + '" must not be larger than ' + maximumSize + ' elements');
        }

        var minimumSize = resolveItemConstraint(validator.minimumSize);
        if (!utils.isValueNullOrUndefined(minimumSize) && size < minimumSize) {
          validationErrors.push('hashtable "' + hashtablePath + '" must not be smaller than ' + minimumSize + ' elements');
        }
      }
    }

    function performCustomValidation(validator) {
      var currentItemEntry = itemStack[itemStack.length - 1];

      // Copy all but the last/top element so that the item's parent is at the top of the stack for the custom validation function
      var customValidationItemStack = itemStack.slice(0, -1);

      var customValidationErrors = validator.customValidation(doc, oldDoc, currentItemEntry, customValidationItemStack);

      if (customValidationErrors instanceof Array) {
        for (var errorIndex = 0; errorIndex < customValidationErrors.length; errorIndex++) {
          validationErrors.push(customValidationErrors[errorIndex]);
        }
      }
    }
  }

  return {
    validateDoc: validateDoc
  };
}
