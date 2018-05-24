{
  staticRegularAttachmentsDoc: {
    typeFilter: simpleTypeFilter,
    authorizedRoles: { write: 'write' },
    allowAttachments: true,
    attachmentConstraints: {
      maximumAttachmentCount: 3,
      supportedExtensions: [ 'html', 'jpg', 'pdf', 'txt', 'xml' ],
      supportedContentTypes: [ 'text/html', 'image/jpeg', 'application/pdf', 'text/plain', 'application/xml' ]
    },
    propertyValidators: {
      attachmentRefProp: {
        type: 'attachmentReference',
        maximumSize: 40,
        supportedExtensions: [ 'foo', 'html', 'jpg', 'pdf', 'txt', 'xml' ],
        supportedContentTypes: [ 'text/bar', 'text/html', 'image/jpeg', 'application/pdf', 'text/plain', 'application/xml' ]
      }
    }
  },
  staticAttachmentRefsOnlyDoc: {
    typeFilter: simpleTypeFilter,
    authorizedRoles: { write: 'write' },
    allowAttachments: true,
    attachmentConstraints: {
      requireAttachmentReferences: true
    },
    propertyValidators: {
      attachmentRefProp: {
        type: 'attachmentReference'
      }
    }
  },
  dynamicAttachmentsDoc: {
    typeFilter: simpleTypeFilter,
    authorizedRoles: { write: 'write' },
    allowAttachments: function(doc, oldDoc) {
      return doc.attachmentsEnabled;
    },
    attachmentConstraints: function(doc, oldDoc) {
      return {
        maximumAttachmentCount: function(doc, oldDoc) {
          return doc.maximumAttachmentCount;
        },
        supportedExtensions: function(doc, oldDoc) {
          return doc.supportedExtensions;
        },
        supportedContentTypes: function(doc, oldDoc) {
          return doc.supportedContentTypes;
        },
        requireAttachmentReferences: function(doc, oldDoc) {
          return doc.requireAttachmentReferences;
        }
      };
    },
    propertyValidators: {
      attachmentsEnabled: {
        type: 'boolean'
      },
      maximumAttachmentCount: {
        type: 'integer'
      },
      supportedExtensions: {
        type: 'array'
      },
      supportedContentTypes: {
        type: 'array'
      },
      requireAttachmentReferences: {
        type: 'boolean'
      },
      attachmentReferences: {
        type: 'array',
        arrayElementsValidator: {
          type: 'attachmentReference'
        }
      }
    }
  }
}
