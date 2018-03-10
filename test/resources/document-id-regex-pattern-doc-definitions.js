function() {
  return {
    staticDocumentIdRegexPatternDoc: {
      typeFilter: simpleTypeFilter,
      authorizedRoles: { write: 'write' },
      documentIdRegexPattern: /^my-doc\.\d+$/,
      propertyValidators: { }
    },
    dynamicDocumentIdRegexPatternDoc: {
      typeFilter: simpleTypeFilter,
      authorizedRoles: { write: 'write' },
      documentIdRegexPattern: function(doc) {
        return new RegExp('^entity\\.' + doc.entityId + '$');
      },
      propertyValidators: {
        entityId: {
          type: 'string',
          required: true
        }
      }
    }
  };
}
