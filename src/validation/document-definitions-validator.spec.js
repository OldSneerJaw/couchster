const { expect } = require('chai');
const docDefinitionsLoader = require('../loading/document-definitions-loader');
const validator = require('./document-definitions-validator');

describe('Document definitions validator:', () => {
  it('performs validation on the sample document definitions file', () => {
    const filePath = 'samples/sample-doc-definitions.js';
    const sampleDocDefinitions = docDefinitionsLoader.load(filePath);

    const results = validator.validate(sampleDocDefinitions, filePath);

    expect(results.length).to.equal(0);
  });

  it('performs validation on a document definitions object', () => {
    const fakeDocDefinitions = {
      myDoc1: {
        grantAllMembersWriteAccess: (a, b, c, extraParam) => extraParam, // Too many parameters
        documentIdRegexPattern: { }, // Must be a RegExp object
        allowUnknownProperties: 1, // Must be a boolean
        immutable: true,
        cannotDelete: true, // Must not be defined if "immutable" is also defined
        attachmentConstraints: (a, b) => b, // "allowAttachments" must also be defined,
        customActions: {
          onTypeIdentificationSucceeded: (a, b, c, d, e, extraParam) => extraParam, // Too many parameters
          onAuthorizationSucceeded: 5, // Must be a function
          invalidEvent: (a, b, c) => c // Unsupported event type
        }
      }
    };

    const results = validator.validate(fakeDocDefinitions);

    expect(results).to.have.members(
      [
        'myDoc1.grantAllMembersWriteAccess: \"grantAllMembersWriteAccess\" must have an arity lesser or equal to 3',
        'myDoc1.documentIdRegexPattern: \"documentIdRegexPattern\" must be an instance of \"RegExp\"',
        'myDoc1.typeFilter: "typeFilter" is required',
        'myDoc1.propertyValidators: "propertyValidators" is required',
        'myDoc1.allowUnknownProperties: \"allowUnknownProperties\" must be a boolean',
        'myDoc1.immutable: \"immutable\" conflict with forbidden peer \"cannotDelete\"',
        'myDoc1.allowAttachments: \"allowAttachments\" is required',
        'myDoc1.customActions.onTypeIdentificationSucceeded: \"onTypeIdentificationSucceeded\" must have an arity lesser or equal to 5',
        'myDoc1.customActions.onAuthorizationSucceeded: \"onAuthorizationSucceeded\" must be a Function',
        'myDoc1.customActions.invalidEvent: \"invalidEvent\" is not allowed'
      ]);
  });

  it('performs validation on a document definitions function', () => {
    const fakeDocDefinitions = () => {
      return {
        myDoc1: {
          typeFilter: () => { },
          authorizedRoles: {
            view: 'view-role' // This permission category is not supported for "authorizedRoles"
          },
          authorizedUsers: { }, // Must have at least one permission type
          grantAllMembersWriteAccess: true, // Must not be defined with "authorizedRoles" or "authorizedUsers"
          documentIdRegexPattern: (a, extraParam) => extraParam, // Too many parameters
          immutable: true,
          cannotReplace: false, // Must not be defined if "immutable" is also defined
          allowAttachments: false, // Must be true since "attachmentConstraints" is defined
          attachmentConstraints: {
            maximumAttachmentCount: 0, // Must be at least 1
            supportedExtensions: (doc, oldDoc, extraParam) => [ extraParam ], // Has too many params
            supportedContentTypes: [ ] // Must have at least one element
          },
          customActions: { }, // Must have at least one property
          propertyValidators: {
            timeProperty: {
              type: 'time',
              immutable: 1, // Must be a boolean
              minimumValue: '15', // Must have at least hour and minute components
              maximumValue: '23:49:52.1234', // Must not have more than 3 fractional digits
              mustEqual: 'foobar' // Must be a valid time string
            },
            timezoneProperty: {
              type: 'timezone',
              minimumValueExclusive: '-15', // Must include minute component
              maximumValueExclusive: '19:00', // Must have a positive or negative sign
              mustEqual: 'barfoo' // Must be a valid timezone string
            },
            _invalidName: { // CouchDB does not allow top-level property names to start with underscore
              type: 'string'
            },
            nestedObject: {
              type: 'object',
              unrecognizedConstraint: true, // Invalid property constraint
              propertyValidators: {
                _validName: {
                  type: 'boolean'
                },
                dateProperty: {
                  type: 'date',
                  required: true,
                  immutable: true,
                  immutableWhenSet: false, // Must not be defined in conjunction with "immutable"
                  maximumValue: '2018-01-31T17:31:27.283-08:00', // Should not include time and time zone components
                  mustEqualStrict: new Date('1578-11-30'), // Must be a date string for equality
                  customValidation: (a, b, c, d, e, f, extraParam) => extraParam // Too many parameters
                },
                enumProperty: {
                  type: 'enum',
                  predefinedValues: [
                    'foo',
                    'bar',
                    3,
                    1.9 // Must include only strings and integers
                  ],
                  mustEqual: true, // Must be an integer or string
                  mustEqualStrict: 3 // Must not be defined in conjunction with "mustEqual"
                },
                hashtableProperty: {
                  type: 'hashtable',
                  minimumSize: 2,
                  maximumSize: 1, // Must not be less than "minimumSize"
                  hashtableKeysValidator: {
                    regexPattern: '^[a-z]+$' // Must actually be either a literal regex or a RegExp object
                  },
                  hashtableValuesValidator: {
                    type: 'datetime',
                    minimumValue: 'Mon, 25 Dec 1995 13:30:00 +0430', // Must be an ISO 8601 date string
                    maximumValueExclusive: new Date(2018, 0, 31, 17, 31, 27, 283), // Must not be defined in conjunction with "mustEqual"
                    mustEqual: new Date('2018-01-31T17:31:27.283-08:00') // Must be a date string for equality
                  }
                },
                arrayProperty: {
                  type: 'array',
                  minimumLength: 3.5, // Must be an integer
                  maximumLength: 3.5, // Must be an integer
                  arrayElementsValidator: {
                    type: 'object',
                    allowUnknownProperties: true,
                    required: (doc, oldDoc, value, oldValue) => oldValue === true,
                    propertyValidators: {
                      stringProperty: {
                        type: 'string',
                        mustEqual: 'FooBar', // Must not be defined in conjunction with "mustEqualIgnoreCase"
                        mustEqualIgnoreCase: null, // Must not be null or defined with "mustEqual"
                        mustBeTrimmed: 0, // Must be a boolean
                        regexPattern: /^[a-z]+$/,
                        minimumLength: () => 9,
                        maximumLength: -1 // Must be at least 0
                      },
                      booleanProperty: {
                        type: 'boolean',
                        mustEqual: 'true' // Must be a boolean
                      },
                      validIntegerProperty: {
                        type: 'integer',
                        minimumValue: 5,
                        maximumValueExclusive: 6
                      },
                      invalidIntegerProperty: {
                        type: 'integer',
                        required: true,
                        mustNotBeMissing: true, // Must not be defined if "required" is defined
                        minimumValueExclusive: 1,
                        maximumValue: 1, // Must be greater than "minimumValueExclusive"
                        maximumValueExclusive: 1 // Must be greater than "minimumValueExclusive"
                      },
                      validFloatProperty: {
                        type: 'float',
                        minimumValueExclusive: 1,
                        maximumValue: 1.0001
                      },
                      invalidFloatProperty: {
                        type: 'float',
                        minimumValue: 31.9,
                        maximumValue: 31.89998, // Must be at least "minimumValue"
                        maximumValueExclusive: 31.9 // Must be greater than "minimumValue"
                      },
                      uuidProperty: {
                        type: 'uuid',
                        minimumValue: '4050b662-4383-4d2E-8771-54d380d11C41',
                        maximumValue: '1234' // Not a valid UUID
                      },
                      noTypeProperty: { // The "type" property is required
                        required: true
                      },
                      invalidMustEqualConstraintProperty: {
                        type: 'object',
                        mustEqual: [ ] // Must be an object
                      },
                      emptyPropertyValidatorsProperty: {
                        type: 'object',
                        mustEqual: (a, b, c, d) => d,
                        propertyValidators: { } // Must specify at least one property validator
                      }
                    }
                  }
                },
                unrecognizedTypeProperty: {
                  type: 'foobar' // Not a supported validation constraint type
                }
              }
            }
          }
        }
      };
    };

    const results = validator.validate(fakeDocDefinitions);

    expect(results).to.have.members(
      [
        'myDoc1.authorizedRoles.view: \"view\" is not allowed',
        'myDoc1.authorizedUsers: \"authorizedUsers\" must have at least 1 children',
        'myDoc1.grantAllMembersWriteAccess: \"grantAllMembersWriteAccess\" must be one of [false]',
        'myDoc1.documentIdRegexPattern: \"documentIdRegexPattern\" must have an arity lesser or equal to 1',
        'myDoc1.immutable: \"immutable\" conflict with forbidden peer \"cannotReplace\"',
        'myDoc1.allowAttachments: \"allowAttachments\" must be one of [true]',
        'myDoc1.attachmentConstraints.maximumAttachmentCount: \"maximumAttachmentCount\" must be larger than or equal to 1',
        'myDoc1.attachmentConstraints.supportedExtensions: "supportedExtensions" must have an arity lesser or equal to 2',
        'myDoc1.attachmentConstraints.supportedContentTypes: \"supportedContentTypes\" must contain at least 1 items',
        'myDoc1.customActions: \"customActions\" must have at least 1 children',
        'myDoc1.propertyValidators.timeProperty.immutable: \"immutable\" must be a boolean',
        'myDoc1.propertyValidators.timeProperty.minimumValue: \"minimumValue\" with value \"15\" fails to match the required pattern: /^((([01]\\d|2[0-3])(:[0-5]\\d)(:[0-5]\\d(\\.\\d{1,3})?)?)|(24:00(:00(\\.0{1,3})?)?))$/',
        'myDoc1.propertyValidators.timeProperty.maximumValue: \"maximumValue\" with value \"23:49:52.1234\" fails to match the required pattern: /^((([01]\\d|2[0-3])(:[0-5]\\d)(:[0-5]\\d(\\.\\d{1,3})?)?)|(24:00(:00(\\.0{1,3})?)?))$/',
        'myDoc1.propertyValidators.timeProperty.mustEqual: \"mustEqual\" with value \"foobar\" fails to match the required pattern: /^((([01]\\d|2[0-3])(:[0-5]\\d)(:[0-5]\\d(\\.\\d{1,3})?)?)|(24:00(:00(\\.0{1,3})?)?))$/',
        'myDoc1.propertyValidators.timeProperty.minimumValue: \"minimumValue\" conflict with forbidden peer \"mustEqual\"',
        'myDoc1.propertyValidators.timeProperty.maximumValue: \"maximumValue\" conflict with forbidden peer \"mustEqual\"',
        'myDoc1.propertyValidators.timezoneProperty.minimumValueExclusive: \"minimumValueExclusive\" with value \"-15\" fails to match the required pattern: /^(Z|([+-])([01]\\d|2[0-3]):([0-5]\\d))$/',
        'myDoc1.propertyValidators.timezoneProperty.maximumValueExclusive: \"maximumValueExclusive\" with value \"19:00\" fails to match the required pattern: /^(Z|([+-])([01]\\d|2[0-3]):([0-5]\\d))$/',
        'myDoc1.propertyValidators.timezoneProperty.mustEqual: \"mustEqual\" with value \"barfoo\" fails to match the required pattern: /^(Z|([+-])([01]\\d|2[0-3]):([0-5]\\d))$/',
        'myDoc1.propertyValidators.timezoneProperty.minimumValueExclusive: \"minimumValueExclusive\" conflict with forbidden peer \"mustEqual\"',
        'myDoc1.propertyValidators.timezoneProperty.maximumValueExclusive: \"maximumValueExclusive\" conflict with forbidden peer \"mustEqual\"',
        'myDoc1.propertyValidators._invalidName: "_invalidName" is not allowed',
        'myDoc1.propertyValidators.nestedObject.unrecognizedConstraint: "unrecognizedConstraint" is not allowed',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.dateProperty.immutableWhenSet: \"immutableWhenSet\" conflict with forbidden peer \"immutable\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.dateProperty.immutable: \"immutable\" conflict with forbidden peer \"immutableWhenSet\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.dateProperty.maximumValue: "maximumValue" with value "2018-01-31T17:31:27.283-08:00" fails to match the required pattern: /^([+-]\\d{6}|\\d{4})(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\\d|3[01]))?)?$/',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.dateProperty.maximumValue: \"maximumValue\" conflict with forbidden peer \"mustEqualStrict\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.dateProperty.mustEqualStrict: \"mustEqualStrict\" must be a string',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.dateProperty.customValidation: \"customValidation\" must have an arity lesser or equal to 6',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.enumProperty.predefinedValues.3: \"predefinedValues\" at position 3 does not match any of the allowed types',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.enumProperty.mustEqual: \"mustEqual\" conflict with forbidden peer \"mustEqualStrict\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.enumProperty.mustEqualStrict: \"mustEqualStrict\" conflict with forbidden peer \"mustEqual\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.enumProperty.mustEqual: \"mustEqual\" must be a string',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.enumProperty.mustEqual: \"mustEqual\" must be a number',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.hashtableProperty.maximumSize: \"maximumSize\" must be larger than or equal to 2',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.hashtableProperty.hashtableKeysValidator.regexPattern: "regexPattern" must be an object',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.hashtableProperty.hashtableValuesValidator.minimumValue: \"minimumValue\" with value \"Mon, 25 Dec 1995 13:30:00 +0430\" fails to match the required pattern: /^([+-]\\d{6}|\\d{4})(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\\d|3[01]))?)?(T((([01]\\d|2[0-3])(:[0-5]\\d)(:[0-5]\\d(\\.\\d{1,3})?)?)|(24:00(:00(\\.0{1,3})?)?))(Z|([+-])([01]\\d|2[0-3]):([0-5]\\d))?)?$/',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.hashtableProperty.hashtableValuesValidator.minimumValue: \"minimumValue\" conflict with forbidden peer \"mustEqual\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.hashtableProperty.hashtableValuesValidator.maximumValueExclusive: "maximumValueExclusive" conflict with forbidden peer "mustEqual"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.hashtableProperty.hashtableValuesValidator.mustEqual: \"mustEqual\" must be a string',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.minimumLength: \"minimumLength\" must be an integer',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.maximumLength: \"maximumLength\" must be an integer',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.stringProperty.mustEqual: \"mustEqual\" conflict with forbidden peer \"mustEqualIgnoreCase\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.stringProperty.mustEqualIgnoreCase: \"mustEqualIgnoreCase\" conflict with forbidden peer \"mustEqual\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.stringProperty.mustEqualIgnoreCase: \"mustEqualIgnoreCase\" must be a string',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.stringProperty.mustBeTrimmed: \"mustBeTrimmed\" must be a boolean',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.stringProperty.maximumLength: \"maximumLength\" must be larger than or equal to 0',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.booleanProperty.mustEqual: \"mustEqual\" must be a boolean',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.required: \"required\" conflict with forbidden peer \"mustNotBeMissing\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.mustNotBeMissing: \"mustNotBeMissing\" conflict with forbidden peer \"required\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.maximumValue: \"maximumValue\" must be greater than 1',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.maximumValue: \"maximumValue\" conflict with forbidden peer \"maximumValueExclusive\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.maximumValueExclusive: \"maximumValueExclusive\" must be greater than 1',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidIntegerProperty.maximumValueExclusive: \"maximumValueExclusive\" conflict with forbidden peer \"maximumValue\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidFloatProperty.maximumValueExclusive: \"maximumValueExclusive\" must be greater than 31.9',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidFloatProperty.maximumValue: \"maximumValue\" must be larger than or equal to 31.9',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidFloatProperty.maximumValue: \"maximumValue\" conflict with forbidden peer \"maximumValueExclusive\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidFloatProperty.maximumValueExclusive: \"maximumValueExclusive\" conflict with forbidden peer \"maximumValue\"',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.uuidProperty.maximumValue: "maximumValue" must be a valid GUID',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.invalidMustEqualConstraintProperty.mustEqual: \"mustEqual\" must be an object',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.emptyPropertyValidatorsProperty.propertyValidators: \"propertyValidators\" must have at least 1 children',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.arrayProperty.arrayElementsValidator.propertyValidators.noTypeProperty.type: "type" is required',
        'myDoc1.propertyValidators.nestedObject.propertyValidators.unrecognizedTypeProperty.type: "type" must be one of [array, attachmentReference, boolean, date, datetime, enum, float, hashtable, integer, object, string, time, timezone, uuid]'
      ]);
  });
});
