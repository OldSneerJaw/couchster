function timeModule(utils) {
  return {
    isIso8601DateTimeString: isIso8601DateTimeString,
    isIso8601DateString: isIso8601DateString,
    isIso8601TimeString: isIso8601TimeString,
    isIso8601TimeZoneString: isIso8601TimeZoneString,
    compareTimes: compareTimes,
    compareDates: compareDates,
    compareTimeZones: compareTimeZones
  };

  // Check that a given value is a valid ISO 8601 format date string with optional time and time zone components
  function isIso8601DateTimeString(value) {
    var regex = /^(([0-9]{4})(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?)(T([01][0-9]|2[0-3])(:[0-5][0-9])(:[0-5][0-9](\.[0-9]{1,3})?)?(Z|([+-])([01][0-9]|2[0-3]):([0-5][0-9]))?)?$/;

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
    var regex = /^(Z|([+-])([01][0-9]|2[0-3]):([0-5][0-9]))$/;

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
    var millisecond = timePieces[4] ? parseInt(utils.padRight(timePieces[4], 3, '0'), 10) : 0;

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

  // Converts the given date representation to a timestamp that represents the number of ms since the Unix epoch
  function convertToTimestamp(value) {
    if (value instanceof Date) {
      return value.getTime();
    } else if (typeof value === 'number') {
      return Math.floor(value);
    } else if (typeof value === 'string') {
      return Date.parse(value);
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
}
