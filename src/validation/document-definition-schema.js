const joi = require('../../lib/joi/joi.bundle');
const propertyValidatorSchema = require('./property-validator-schema');
const makeConstraintSchemaDynamic = require('./dynamic-constraint-schema-maker');

const integerSchema = joi.number().integer();
const nonEmptyStringSchema = joi.string().min(1);
const customActionEventSchema = joi.func().maxArity(5); // Function parameters: doc, oldDoc, customActionMetadata, userContext, securityInfo
const authorizationSchema = dynamicAuthorizationSchema(
  joi.object().min(1).keys(
    {
      add: arrayOrSingleItemSchema(nonEmptyStringSchema),
      replace: arrayOrSingleItemSchema(nonEmptyStringSchema),
      remove: arrayOrSingleItemSchema(nonEmptyStringSchema),
      write: arrayOrSingleItemSchema(nonEmptyStringSchema)
    }));

/**
 * The full schema for a single document definition object.
 */
module.exports = exports = joi.object().options({ convert: false }).keys({
  typeFilter: joi.func().required().maxArity(3), // Function parameters: doc, oldDoc, docType
  allowUnknownProperties: dynamicConstraintSchema(joi.boolean()),
  immutable: dynamicConstraintSchema(joi.boolean()),
  cannotReplace: dynamicConstraintSchema(joi.boolean()),
  cannotDelete: dynamicConstraintSchema(joi.boolean()),
  documentIdRegexPattern: makeConstraintSchemaDynamic(joi.object().type(RegExp), 1), // Only one parameter is allowed: doc

  allowAttachments: joi.any().when(
    // This property must be true or a function if "attachmentConstraints" is defined
    'attachmentConstraints',
    {
      is: joi.any().exist(),
      then: dynamicConstraintSchema(joi.boolean().only(true)).required(),
      otherwise: dynamicConstraintSchema(joi.boolean())
    }),
  attachmentConstraints: dynamicConstraintSchema(
    joi.object().min(1).keys(
      {
        requireAttachmentReferences: dynamicConstraintSchema(joi.boolean()),
        maximumAttachmentCount: dynamicConstraintSchema(integerSchema.min(1)),
        maximumIndividualSize: dynamicConstraintSchema(integerSchema.min(1)),
        maximumTotalSize: dynamicConstraintSchema(
          integerSchema.when(
            // This property must be greater or equal to "maximumIndividualSize" if it's defined
            'maximumIndividualSize',
            {
              is: integerSchema.exist(),
              then: integerSchema.min(joi.ref('maximumIndividualSize')),
              otherwise: integerSchema.min(1)
            })),
        supportedExtensions: dynamicConstraintSchema(joi.array().min(1).items(joi.string())),
        supportedContentTypes: dynamicConstraintSchema(joi.array().min(1).items(nonEmptyStringSchema)),
        filenameRegexPattern: dynamicConstraintSchema(joi.object().type(RegExp))
      })),

  authorizedRoles: authorizationSchema,
  authorizedUsers: authorizationSchema,

  grantAllMembersWriteAccess: joi.any().when(
    // This property must be false or a function if "authorizedRoles" or "authorizedUsers" is defined
    'authorizedRoles',
    {
      is: joi.object().unknown().exist(),
      then: dynamicAuthorizationSchema(joi.boolean().only(false)),
      otherwise: joi.any().when(
        'authorizedUsers',
        {
          is: joi.object().unknown().exist(),
          then: dynamicAuthorizationSchema(joi.boolean().only(false)),
          otherwise: dynamicAuthorizationSchema(joi.boolean())
        })
    }),

  customActions: joi.object().min(1).keys({
    onTypeIdentificationSucceeded: customActionEventSchema,
    onAuthorizationSucceeded: customActionEventSchema,
    onValidationSucceeded: customActionEventSchema
  }),

  propertyValidators: dynamicConstraintSchema(
    joi.object().pattern(
      /^[^_].*$/, // CouchDB does not allow top-level document property names to start with an underscore
      propertyValidatorSchema)).required()
})
  // At least one of "authorizedRoles", "authorizedUsers" or "grantAllMembersWriteAccess" must be defined
  .or('authorizedRoles', 'authorizedUsers', 'grantAllMembersWriteAccess')
  // It makes no sense to set "immutable" with either of "cannotReplace" or "cannotDelete"
  .without('immutable', [ 'cannotReplace', 'cannotDelete' ]);

function arrayOrSingleItemSchema(singleItemSchema, minimumLength) {
  return joi.any().when(
    joi.array(),
    {
      then: joi.array().min(minimumLength || 0).items(singleItemSchema),
      otherwise: singleItemSchema
    });
}

// Generates a schema that can be used for top-level authorization properties (e.g. "authorizedRoles", "authorizedUsers",
// "grantAllMembersWriteAccess")
function dynamicAuthorizationSchema(wrappedSchema) {
  // The function schema this creates will support no more than three parameters (doc, oldDoc, dbName)
  return makeConstraintSchemaDynamic(wrappedSchema, 3);
}

// Generates a schema that can be used for top-level document definition property constraints
function dynamicConstraintSchema(wrappedSchema) {
  // The function schema this creates will support no more than two parameters (doc, oldDoc)
  return makeConstraintSchemaDynamic(wrappedSchema, 2);
}
