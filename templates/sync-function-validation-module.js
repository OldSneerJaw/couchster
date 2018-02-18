function validationModule() {
  // Determine if a given value is an integer. Exists as a failsafe because Number.isInteger is not guaranteed to exist in all environments.
  var isInteger = Number.isInteger || function(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
  };

  // Check that a given value is a valid ISO 8601 format date string with optional time and time zone components
  function isIso8601DateTimeString(value) {
    var regex = /^(([0-9]{4})(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?)(T([01][0-9]|2[0-3])(:[0-5][0-9])(:[0-5][0-9](\.[0-9]{1,3})?)?(Z|([+-])([01][0-9]|2[0-3]):?([0-5][0-9]))?)?$/;

    // Verify that it's in ISO 8601 format (via the regex) and that it represents a valid point in time (via Date.parse)
    return regex.test(value) && !isNaN(Date.parse(value));
  }

  // Check that a given value is a valid ISO 8601 date string without time and time zone components
  function isIso8601DateString(value) {
    var regex = /^([0-9]{4})(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$/;

    // Verify that it's in ISO 8601 format (via the regex) and that it represents a valid day (via Date.parse)
    return regex.test(value) && !isNaN(Date.parse(value));
  }

  // Check that a given value is a valid ISO 8601 time string without date and time zone components
  function isIso8601TimeString(value) {
    var regex = /^([01][0-9]|2[0-3])(:[0-5][0-9])(:[0-5][0-9](\.[0-9]{1,3})?)?$/;

    return regex.test(value);
  }

  // Check that a given value is a valid ISO 8601 time zone
  function isIso8601TimeZoneString(value) {
    var regex = /^(Z|([+-])([01][0-9]|2[0-3]):?([0-5][0-9]))$/;

    return regex.test(value);
  }

  // Converts an ISO 8601 time into an array of its component pieces
  function extractIso8601TimePieces(value) {
    var timePieces = /^(\d{2}):(\d{2})(?:\:(\d{2}))?(?:\.(\d{1,3}))?$/.exec(value);
    if (timePieces === null) {
      return null;
    }

    var hour = timePieces[1] ? parseInt(timePieces[1], 10) : 0;
    var minute = timePieces[2] ? parseInt(timePieces[2], 10) : 0;
    var second = timePieces[3] ? parseInt(timePieces[3], 10) : 0;

    // The millisecond component has a variable length; normalize the length by padding it with zeros
    var millisecond = timePieces[4] ? parseInt(padRight(timePieces[4], 3, '0'), 10) : 0;

    return [ hour, minute, second, millisecond ];
  }

  // Compares the given time strings. Returns a negative number if a is less than b, a positive number if a is greater
  // than b, or zero if a and b are equal.
  function compareTimes(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return NaN;
    }

    var aTimePieces = extractIso8601TimePieces(a);
    var bTimePieces = extractIso8601TimePieces(b);

    if (aTimePieces === null || bTimePieces === null) {
      return NaN;
    }

    for (var timePieceIndex = 0; timePieceIndex < aTimePieces.length; timePieceIndex++) {
      if (aTimePieces[timePieceIndex] < bTimePieces[timePieceIndex]) {
        return -1;
      } else if (aTimePieces[timePieceIndex] > bTimePieces[timePieceIndex]) {
        return 1;
      }
    }

    // If we got here, the two parameters represent the same time of day
    return 0;
  }

  function extractIso8601DateOnlyPieces(value) {
    var datePieces = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value);
    if (datePieces === null) {
      return null;
    }

    var year = datePieces[1] ? parseInt(datePieces[1], 10) : 0;
    var month = datePieces[2] ? parseInt(datePieces[2], 10) : 1;
    var day = datePieces[3] ? parseInt(datePieces[3], 10) : 1;

    return [ year, month, day ];
  }

  function extractDateFromPieces(dateAndTimePieces) {
    var dateString = dateAndTimePieces.length > 0 ? dateAndTimePieces[0] : '';
    var datePieces = extractIso8601DateOnlyPieces(dateString);
    if (datePieces === null) {
      return null;
    }

    return {
      year: datePieces[0],
      month: datePieces[1],
      day: datePieces[2]
    };
  }

  function extractTimeFromPieces(dateAndTimePieces) {
      // Default to midnight UTC if the candidate value represents a date only
      var timeAndTimezoneString = dateAndTimePieces.length > 1 ? dateAndTimePieces[1] : '00:00:00.000Z';
      var timezoneSeparatorIndex =
        Math.max(timeAndTimezoneString.indexOf('-'), timeAndTimezoneString.indexOf('+'), timeAndTimezoneString.indexOf('Z'));

      var timeString = (timezoneSeparatorIndex >= 0) ? timeAndTimezoneString.substr(0, timezoneSeparatorIndex) : timeAndTimezoneString;
      var timePieces = extractIso8601TimePieces(timeString);
      if (timePieces === null)
      {
        return null;
      }

      var timezoneString = (timezoneSeparatorIndex >= 0) ? timeAndTimezoneString.substr(timezoneSeparatorIndex) : null;

      // Default to the server's local time zone offset if time zone is missing from the input
      var timezoneOffsetMinutes = timezoneString !== null ? normalizeIso8601TimeZone(timezoneString) : -(new Date().getTimezoneOffset());

      return {
        hour: timePieces[0],
        minute: timePieces[1],
        second: timePieces[2],
        millisecond: timePieces[3],
        timezoneOffsetMinutes: timezoneOffsetMinutes
      };
  }

  // Converts the given date representation to a timestamp that represents the number of ms since the Unix epoch
  function convertToTimestamp(value) {
    if (value instanceof Date) {
      return value.getTime();
    } else if (typeof value === 'number') {
      return Math.floor(value);
    } else if (typeof value === 'string') {
      var dateAndTimePieces = value.split('T', 2);

      var date = extractDateFromPieces(dateAndTimePieces);
      if (date === null) {
        return NaN;
      }

      var time = extractTimeFromPieces(dateAndTimePieces);
      if (time === null) {
        return NaN;
      }

      return Date.UTC(
        date.year,
        date.month - 1,
        date.day,
        time.hour,
        time.minute - time.timezoneOffsetMinutes,
        time.second,
        time.millisecond);
    } else {
      return NaN;
    }
  }

  // Compares the given date representations. Returns a negative number if a is less than b, a positive number if a is
  // greater than b, or zero if a and b are equal.
  function compareDates(a, b) {
    var aTimestamp = convertToTimestamp(a);
    var bTimestamp = convertToTimestamp(b);

    if (isNaN(aTimestamp) || isNaN(bTimestamp)) {
      return NaN;
    } else {
      return aTimestamp - bTimestamp;
    }
  }

  // Converts an ISO 8601 time zone into the number of minutes offset from UTC
  function normalizeIso8601TimeZone(value) {
    if (value === 'Z') {
      return 0;
    }

    var regex = /^([+-])(\d\d):?(\d\d)$/;
    var matches = regex.exec(value);
    if (matches === null) {
      return NaN;
    } else {
      var multiplicationFactor = (matches[1] === '+') ? 1 : -1;
      var hour = parseInt(matches[2], 10);
      var minute = parseInt(matches[3], 10);

      return multiplicationFactor * ((hour * 60) + minute);
    }
  }

  // Compares the given time zone representations. Returns a negative number if a is less than b, a positive number if
  // a is greater than b, or zero if a and b are equal.
  function compareTimeZones(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return NaN;
    }

    return normalizeIso8601TimeZone(a) - normalizeIso8601TimeZone(b);
  }

  function minValueInclusiveViolationComparator(validatorType) {
    switch (validatorType) {
      case 'time':
        return function(candidateValue, constraintValue) {
          return compareTimes(candidateValue, constraintValue) < 0;
        };
      case 'date':
      case 'datetime':
        return function(candidateValue, constraintValue) {
          return compareDates(candidateValue, constraintValue) < 0;
        };
      case 'timezone':
        return function(candidateValue, constraintValue) {
          return compareTimeZones(candidateValue, constraintValue) < 0;
        };
      case 'uuid':
        return function(candidateValue, constraintValue) {
          return convertToLowerCase(candidateValue) < convertToLowerCase(constraintValue);
        };
      default:
        return function(candidateValue, constraintValue) {
          return candidateValue < constraintValue;
        };
    }
  }

  function minValueExclusiveViolationComparator(validatorType) {
    switch (validatorType) {
      case 'time':
        return function(candidateValue, constraintValue) {
          return compareTimes(candidateValue, constraintValue) <= 0;
        };
      case 'date':
      case 'datetime':
        return function(candidateValue, constraintValue) {
          return compareDates(candidateValue, constraintValue) <= 0;
        };
      case 'timezone':
        return function(candidateValue, constraintValue) {
          return compareTimeZones(candidateValue, constraintValue) <= 0;
        };
      case 'uuid':
        return function(candidateValue, constraintValue) {
          return convertToLowerCase(candidateValue) <= convertToLowerCase(constraintValue);
        };
      default:
        return function(candidateValue, constraintValue) {
          return candidateValue <= constraintValue;
        };
    }
  }

  function maxValueInclusiveViolationComparator(validatorType) {
    switch (validatorType) {
      case 'time':
        return function(candidateValue, constraintValue) {
          return compareTimes(candidateValue, constraintValue) > 0;
        };
      case 'date':
      case 'datetime':
        return function(candidateValue, constraintValue) {
          return compareDates(candidateValue, constraintValue) > 0;
        };
      case 'timezone':
        return function(candidateValue, constraintValue) {
          return compareTimeZones(candidateValue, constraintValue) > 0;
        };
      case 'uuid':
        return function(candidateValue, constraintValue) {
          return convertToLowerCase(candidateValue) > convertToLowerCase(constraintValue);
        };
      default:
        return function(candidateValue, constraintValue) {
          return candidateValue > constraintValue;
        };
    }
  }

  function maxValueExclusiveViolationComparator(validatorType) {
    switch (validatorType) {
      case 'time':
        return function(candidateValue, constraintValue) {
          return compareTimes(candidateValue, constraintValue) >= 0;
        };
      case 'date':
      case 'datetime':
        return function(candidateValue, constraintValue) {
          return compareDates(candidateValue, constraintValue) >= 0;
        };
      case 'timezone':
        return function(candidateValue, constraintValue) {
          return compareTimeZones(candidateValue, constraintValue) >= 0;
        };
      case 'uuid':
        return function(candidateValue, constraintValue) {
          return convertToLowerCase(candidateValue) >= convertToLowerCase(constraintValue);
        };
      default:
        return function(candidateValue, constraintValue) {
          return candidateValue >= constraintValue;
        };
    }
  }

  function simpleTypeEqualityComparator(validatorType) {
    switch (validatorType) {
      case 'time':
        return function(candidateValue, constraintValue) {
          return compareTimes(candidateValue, constraintValue) === 0;
        };
      case 'date':
      case 'datetime':
        return function(candidateValue, constraintValue) {
          return compareDates(candidateValue, constraintValue) === 0;
        };
      case 'timezone':
        return function(candidateValue, constraintValue) {
          return compareTimeZones(candidateValue, constraintValue) === 0;
        };
      case 'uuid':
        return function(candidateValue, constraintValue) {
          return convertToLowerCase(candidateValue) === convertToLowerCase(constraintValue);
        };
      default:
        return function(candidateValue, constraintValue) {
          return candidateValue === constraintValue;
        };
    }
  }

  function convertToString(value) {
    if (value instanceof Date) {
      return value.toISOString();
    } else {
      return !isValueNullOrUndefined(value) ? value.toString() : 'null';
    }
  }

  function convertToLowerCase(value) {
    return !isValueNullOrUndefined(value) ? value.toLowerCase() : null;
  }

  function isUuid(value) {
    var regex = /^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/;

    return regex.test(value);
  }

  // A regular expression that matches one of the given file extensions
  function buildSupportedExtensionsRegex(extensions) {
    // Note that this regex uses double quotes rather than single quotes as a workaround to https://github.com/Kashoo/synctos/issues/116
    return new RegExp("\\.(" + extensions.join("|") + ")$", "i");
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
    return (typeof constraintDefinition === 'function') ? constraintDefinition(doc, getEffectiveOldDoc(oldDoc)) : constraintDefinition;
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
    if (!isDocumentMissingOrDeleted(oldDoc)) {
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
    var attachmentReferenceValidators = { };
    var itemStack = [
      {
        itemValue: doc,
        oldItemValue: oldDoc,
        itemName: null
      }
    ];

    var resolvedPropertyValidators = resolveDocConstraint(doc, oldDoc, docDefinition.propertyValidators);

    // Ensure that, if the document type uses the simple type filter, it supports the "type" property
    if (docDefinition.typeFilter === simpleTypeFilter && isValueNullOrUndefined(resolvedPropertyValidators.type)) {
      resolvedPropertyValidators.type = typeIdValidator;
    }

    // Execute each of the document's property validators while ignoring internal document properties at the root level
    validateProperties(
      resolvedPropertyValidators,
      resolveDocConstraint(doc, oldDoc, docDefinition.allowUnknownProperties),
      true);

    if (doc._attachments) {
      validateAttachments();
    }

    // The following functions are nested within this function so they can share access to the doc, oldDoc and validationErrors params and
    // the attachmentReferenceValidators and itemStack variables
    function resolveValidationConstraint(constraintDefinition) {
      if (typeof constraintDefinition === 'function') {
        var currentItemEntry = itemStack[itemStack.length - 1];

        return constraintDefinition(doc, getEffectiveOldDoc(oldDoc), currentItemEntry.itemValue, currentItemEntry.oldItemValue);
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
        if (isValueNullOrUndefined(validator) || isValueNullOrUndefined(resolveValidationConstraint(validator.type))) {
          // Skip over non-validator fields/properties
          continue;
        }

        var propertyValue = objectValue[propertyValidatorName];

        var oldPropertyValue;
        if (!isValueNullOrUndefined(oldObjectValue)) {
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
      var validatorType = resolveValidationConstraint(validator.type);

      if (validator.customValidation) {
        performCustomValidation(validator);
      }

      if (resolveValidationConstraint(validator.immutable)) {
        validateImmutable(false, validator.type);
      }

      if (resolveValidationConstraint(validator.immutableStrict)) {
        // Omitting validator type forces it to perform strict equality comparisons for specialized string types
        // (e.g. "date", "datetime", "time", "timezone", "uuid")
        validateImmutable(false);
      }

      if (resolveValidationConstraint(validator.immutableWhenSet)) {
        validateImmutable(true, validator.type);
      }

      if (resolveValidationConstraint(validator.immutableWhenSetStrict)) {
        // Omitting validator type forces it to perform strict equality comparisons for specialized string types
        // (e.g. "date", "datetime", "time", "timezone", "uuid")
        validateImmutable(true);
      }

      var expectedEqualValue = resolveValidationConstraint(validator.mustEqual);
      if (typeof expectedEqualValue !== 'undefined') {
        validateEquality(expectedEqualValue, validator.type);
      }

      var expectedStrictEqualValue = resolveValidationConstraint(validator.mustEqualStrict);
      if (typeof expectedStrictEqualValue !== 'undefined') {
        // Omitting validator type forces it to perform strict equality comparisons for specialized string types
        // (e.g. "date", "datetime", "time", "timezone", "uuid")
        validateEquality(expectedStrictEqualValue);
      }

      if (!isValueNullOrUndefined(itemValue)) {
        if (resolveValidationConstraint(validator.mustNotBeEmpty) && itemValue.length < 1) {
          validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be empty');
        }

        var minimumValue = resolveValidationConstraint(validator.minimumValue);
        if (!isValueNullOrUndefined(minimumValue)) {
          validateRangeConstraint(minimumValue, validatorType, minValueInclusiveViolationComparator(validatorType), 'less than');
        }

        var minimumValueExclusive = resolveValidationConstraint(validator.minimumValueExclusive);
        if (!isValueNullOrUndefined(minimumValueExclusive)) {
          validateRangeConstraint(
            minimumValueExclusive,
            validatorType,
            minValueExclusiveViolationComparator(validatorType),
            'less than or equal to');
        }

        var maximumValue = resolveValidationConstraint(validator.maximumValue);
        if (!isValueNullOrUndefined(maximumValue)) {
          validateRangeConstraint(maximumValue, validatorType, maxValueInclusiveViolationComparator(validatorType), 'greater than');
        }

        var maximumValueExclusive = resolveValidationConstraint(validator.maximumValueExclusive);
        if (!isValueNullOrUndefined(maximumValueExclusive)) {
          validateRangeConstraint(
            maximumValueExclusive,
            validatorType,
            maxValueExclusiveViolationComparator(validatorType),
            'greater than or equal to');
        }

        var minimumLength = resolveValidationConstraint(validator.minimumLength);
        if (!isValueNullOrUndefined(minimumLength) && itemValue.length < minimumLength) {
          validationErrors.push('length of item "' + buildItemPath(itemStack) + '" must not be less than ' + minimumLength);
        }

        var maximumLength = resolveValidationConstraint(validator.maximumLength);
        if (!isValueNullOrUndefined(maximumLength) && itemValue.length > maximumLength) {
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
            if (!isInteger(itemValue)) {
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
            if (typeof itemValue !== 'string' || !isIso8601DateTimeString(itemValue)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an ECMAScript simplified ISO 8601 date string with optional time and time zone components');
            }
            break;
          case 'date':
            if (typeof itemValue !== 'string' || !isIso8601DateString(itemValue)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an ECMAScript simplified ISO 8601 date string with no time or time zone components');
            }
            break;
          case 'time':
            if (typeof itemValue !== 'string' || !isIso8601TimeString(itemValue)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an ECMAScript simplified ISO 8601 time string with no date or time zone components');
            }
            break;
          case 'timezone':
            if (typeof itemValue !== 'string' || !isIso8601TimeZoneString(itemValue)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an ECMAScript simplified ISO 8601 time zone string');
            }
            break;
          case 'enum':
            var enumPredefinedValues = resolveValidationConstraint(validator.predefinedValues);
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
            var childPropertyValidators = resolveValidationConstraint(validator.propertyValidators);
            if (typeof itemValue !== 'object' || itemValue instanceof Array) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an object');
            } else if (childPropertyValidators) {
              validateProperties(childPropertyValidators, resolveValidationConstraint(validator.allowUnknownProperties));
            }
            break;
          case 'array':
            validateArray(resolveValidationConstraint(validator.arrayElementsValidator));
            break;
          case 'hashtable':
            validateHashtable(validator);
            break;
          case 'attachmentReference':
            validateAttachmentRef(validator);
            break;
          default:
            // This is not a document validation error; the item validator is configured incorrectly and must be fixed
            throw { forbidden: 'No data type defined for validator of item "' + buildItemPath(itemStack) + '"' };
        }
      } else if (resolveValidationConstraint(validator.required)) {
        // The item has no value (either it's null or undefined), but the validator indicates it is required
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be null or missing');
      } else if (resolveValidationConstraint(validator.mustNotBeMissing) && typeof itemValue === 'undefined') {
        // The item is missing (i.e. it's undefined), but the validator indicates it must not be
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be missing');
      } else if (resolveValidationConstraint(validator.mustNotBeNull) && itemValue === null) {
        // The item is null, but the validator indicates it must not be
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be null');
      }
    }

    function validateString(validator) {
      var currentItemEntry = itemStack[itemStack.length - 1];
      var itemValue = currentItemEntry.itemValue;

      var regexPattern = resolveValidationConstraint(validator.regexPattern);
      if (regexPattern && !regexPattern.test(itemValue)) {
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must conform to expected format ' + regexPattern);
      }

      var mustBeTrimmed = resolveValidationConstraint(validator.mustBeTrimmed);
      if (mustBeTrimmed && isStringUntrimmed(itemValue)) {
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must not have any leading or trailing whitespace');
      }
    }

    function isStringUntrimmed(value) {
      if (isValueNullOrUndefined(value)) {
        return false;
      } else {
        return value !== value.trim();
      }
    }

    function validateImmutable(onlyEnforceIfHasValue, validatorType) {
      if (!isDocumentMissingOrDeleted(oldDoc)) {
        var currentItemEntry = itemStack[itemStack.length - 1];
        var itemValue = currentItemEntry.itemValue;
        var oldItemValue = currentItemEntry.oldItemValue;

        if (onlyEnforceIfHasValue && isValueNullOrUndefined(oldItemValue)) {
          // No need to continue; the constraint only applies if the old document has a value for this item
          return;
        }

        // Only compare the item's value to the old item if the item's parent existed in the old document. For example, if the item in
        // question is the value of a property in an object that is itself in an array, but the object did not exist in the array in the old
        // document, then there is nothing to validate.
        var oldParentItemValue = (itemStack.length >= 2) ? itemStack[itemStack.length - 2].oldItemValue : null;
        var constraintSatisfied;
        if (isValueNullOrUndefined(oldParentItemValue)) {
          constraintSatisfied = true;
        } else {
          constraintSatisfied = checkItemEquality(itemValue, oldItemValue, validatorType);
        }

        if (!constraintSatisfied) {
          validationErrors.push('item "' + buildItemPath(itemStack) + '" cannot be modified');
        }
      }
    }

    function validateEquality(expectedItemValue, validatorType) {
      var currentItemEntry = itemStack[itemStack.length - 1];
      var currentItemValue = currentItemEntry.itemValue;
      if (!checkItemEquality(currentItemValue, expectedItemValue, validatorType)) {
        validationErrors.push('value of item "' + buildItemPath(itemStack) + '" must equal ' + jsonStringify(expectedItemValue));
      }
    }

    function checkItemEquality(itemValue, expectedItemValue, validatorType) {
      if (simpleTypeEqualityComparator(validatorType)(itemValue, expectedItemValue)) {
        // Both have the same simple type (string, number, boolean, null) value
        return true;
      } else if (isValueNullOrUndefined(itemValue) && isValueNullOrUndefined(expectedItemValue)) {
        // Both values are missing, which means they can be considered equal
        return true;
      } else if (isValueNullOrUndefined(itemValue) !== isValueNullOrUndefined(expectedItemValue)) {
        // One has a value while the other does not
        return false;
      } else {
        if (itemValue instanceof Array || expectedItemValue instanceof Array) {
          return checkArrayEquality(itemValue, expectedItemValue);
        } else if (typeof itemValue === 'object' || typeof expectedItemValue === 'object') {
          return checkObjectEquality(itemValue, expectedItemValue);
        } else {
          return false;
        }
      }
    }

    function checkArrayEquality(itemValue, expectedItemValue) {
      if (!(itemValue instanceof Array && expectedItemValue instanceof Array)) {
        return false;
      } else if (itemValue.length !== expectedItemValue.length) {
        return false;
      }

      for (var elementIndex = 0; elementIndex < itemValue.length; elementIndex++) {
        var elementValue = itemValue[elementIndex];
        var expectedElementValue = expectedItemValue[elementIndex];

        if (!checkItemEquality(elementValue, expectedElementValue)) {
          return false;
        }
      }

      // If we got here, all elements match
      return true;
    }

    function checkObjectEquality(itemValue, expectedItemValue) {
      if (typeof itemValue !== 'object' || typeof expectedItemValue !== 'object') {
        return false;
      }

      var itemProperties = [ ];
      for (var itemProp in itemValue) {
        itemProperties.push(itemProp);
      }

      for (var expectedItemProp in expectedItemValue) {
        if (itemProperties.indexOf(expectedItemProp) < 0) {
          itemProperties.push(expectedItemProp);
        }
      }

      for (var propIndex = 0; propIndex < itemProperties.length; propIndex++) {
        var propertyName = itemProperties[propIndex];
        var propertyValue = itemValue[propertyName];
        var expectedPropertyValue = expectedItemValue[propertyName];

        if (!checkItemEquality(propertyValue, expectedPropertyValue)) {
          return false;
        }
      }

      // If we got here, all properties match
      return true;
    }

    function validateRangeConstraint(rangeConstraint, validationType, violationComparator, violationDescription) {
      var itemValue = itemStack[itemStack.length - 1].itemValue;
      if (violationComparator(itemValue, rangeConstraint)) {
        addOutOfRangeValidationError(rangeConstraint, violationDescription);
      }
    }

    function addOutOfRangeValidationError(rangeConstraint, violationDescription) {
      validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be ' + violationDescription + ' ' + convertToString(rangeConstraint));
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
            (!isValueNullOrUndefined(oldItemValue) && elementIndex < oldItemValue.length) ? oldItemValue[elementIndex] : null;

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
      var keyValidator = resolveValidationConstraint(validator.hashtableKeysValidator);
      var valueValidator = resolveValidationConstraint(validator.hashtableValuesValidator);
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
              if (resolveValidationConstraint(keyValidator.mustNotBeEmpty) && elementKey.length < 1) {
                validationErrors.push('hashtable "' + buildItemPath(itemStack) + '" must not have an empty key');
              }
              var regexPattern = resolveValidationConstraint(keyValidator.regexPattern);
              if (regexPattern && !regexPattern.test(elementKey)) {
                validationErrors.push('hashtable key "' + fullKeyPath + '" must conform to expected format ' + regexPattern);
              }
            }
          }

          if (valueValidator) {
            var oldElementValue;
            if (!isValueNullOrUndefined(oldItemValue)) {
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

        var maximumSize = resolveValidationConstraint(validator.maximumSize);
        if (!isValueNullOrUndefined(maximumSize) && size > maximumSize) {
          validationErrors.push('hashtable "' + hashtablePath + '" must not be larger than ' + maximumSize + ' elements');
        }

        var minimumSize = resolveValidationConstraint(validator.minimumSize);
        if (!isValueNullOrUndefined(minimumSize) && size < minimumSize) {
          validationErrors.push('hashtable "' + hashtablePath + '" must not be smaller than ' + minimumSize + ' elements');
        }
      }
    }

    function validateAttachmentRef(validator) {
      var currentItemEntry = itemStack[itemStack.length - 1];
      var itemValue = currentItemEntry.itemValue;

      if (typeof itemValue !== 'string') {
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an attachment reference string');
      } else {
        attachmentReferenceValidators[itemValue] = validator;

        var supportedExtensions = resolveValidationConstraint(validator.supportedExtensions);
        if (supportedExtensions) {
          var extRegex = buildSupportedExtensionsRegex(supportedExtensions);
          if (!extRegex.test(itemValue)) {
            validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must have a supported file extension (' + supportedExtensions.join(',') + ')');
          }
        }

        // Because the addition of an attachment is typically a separate operation from the creation/update of the associated document, we
        // can't guarantee that the attachment is present when the attachment reference property is created/updated for it, so only
        // validate it if it's present. The good news is that, because adding an attachment is a two part operation (create/update the
        // document and add the attachment), the sync function will be run once for each part, thus ensuring the content is verified once
        // both parts have been synced.
        if (doc._attachments && doc._attachments[itemValue]) {
          var attachment = doc._attachments[itemValue];

          var supportedContentTypes = resolveValidationConstraint(validator.supportedContentTypes);
          if (supportedContentTypes && supportedContentTypes.indexOf(attachment.content_type) < 0) {
            validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must have a supported content type (' + supportedContentTypes.join(',') + ')');
          }

          var maximumSize = resolveValidationConstraint(validator.maximumSize);
          if (!isValueNullOrUndefined(maximumSize) && attachment.length > maximumSize) {
            validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must not be larger than ' + maximumSize + ' bytes');
          }
        }
      }
    }

    function validateAttachments() {
      var attachmentConstraints = resolveDocConstraint(doc, oldDoc, docDefinition.attachmentConstraints);

      var maximumAttachmentCount =
        attachmentConstraints ? resolveDocConstraint(doc, oldDoc, attachmentConstraints.maximumAttachmentCount) : null;
      var maximumIndividualAttachmentSize =
        attachmentConstraints ? resolveDocConstraint(doc, oldDoc, attachmentConstraints.maximumIndividualSize) : null;
      var maximumTotalAttachmentSize =
        attachmentConstraints ? resolveDocConstraint(doc, oldDoc, attachmentConstraints.maximumTotalSize) : null;

      var supportedExtensions = attachmentConstraints ? resolveDocConstraint(doc, oldDoc, attachmentConstraints.supportedExtensions) : null;
      var supportedExtensionsRegex = supportedExtensions ? buildSupportedExtensionsRegex(supportedExtensions) : null;

      var supportedContentTypes =
        attachmentConstraints ? resolveDocConstraint(doc, oldDoc, attachmentConstraints.supportedContentTypes) : null;

      var requireAttachmentReferences =
        attachmentConstraints ? resolveDocConstraint(doc, oldDoc, attachmentConstraints.requireAttachmentReferences) : false;

      var totalSize = 0;
      var attachmentCount = 0;
      for (var attachmentName in doc._attachments) {
        attachmentCount++;

        var attachment = doc._attachments[attachmentName];

        var attachmentSize = attachment.length;
        totalSize += attachmentSize;

        var attachmentRefValidator = attachmentReferenceValidators[attachmentName];

        if (requireAttachmentReferences && isValueNullOrUndefined(attachmentRefValidator)) {
          validationErrors.push('attachment ' + attachmentName + ' must have a corresponding attachment reference property');
        }

        if (isInteger(maximumIndividualAttachmentSize) && attachmentSize > maximumIndividualAttachmentSize) {
          // If this attachment is owned by an attachment reference property, that property's size constraint (if any) takes precedence
          if (isValueNullOrUndefined(attachmentRefValidator) || !isInteger(attachmentRefValidator.maximumSize)) {
            validationErrors.push('attachment ' + attachmentName + ' must not exceed ' + maximumIndividualAttachmentSize + ' bytes');
          }
        }

        if (supportedExtensionsRegex && !supportedExtensionsRegex.test(attachmentName)) {
          // If this attachment is owned by an attachment reference property, that property's extensions constraint (if any) takes
          // precedence
          if (isValueNullOrUndefined(attachmentRefValidator) || isValueNullOrUndefined(attachmentRefValidator.supportedExtensions)) {
            validationErrors.push('attachment "' + attachmentName + '" must have a supported file extension (' + supportedExtensions.join(',') + ')');
          }
        }

        if (supportedContentTypes && supportedContentTypes.indexOf(attachment.content_type) < 0) {
          // If this attachment is owned by an attachment reference property, that property's content types constraint (if any) takes
          // precedence
          if (isValueNullOrUndefined(attachmentRefValidator) || isValueNullOrUndefined(attachmentRefValidator.supportedContentTypes)) {
            validationErrors.push('attachment "' + attachmentName + '" must have a supported content type (' + supportedContentTypes.join(',') + ')');
          }
        }
      }

      if (isInteger(maximumTotalAttachmentSize) && totalSize > maximumTotalAttachmentSize) {
        validationErrors.push('documents of this type must not have a combined attachment size greater than ' + maximumTotalAttachmentSize + ' bytes');
      }

      if (isInteger(maximumAttachmentCount) && attachmentCount > maximumAttachmentCount) {
        validationErrors.push('documents of this type must not have more than ' + maximumAttachmentCount + ' attachments');
      }

      if (!resolveDocConstraint(doc, oldDoc, docDefinition.allowAttachments) && attachmentCount > 0) {
        validationErrors.push('document type does not support attachments');
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
