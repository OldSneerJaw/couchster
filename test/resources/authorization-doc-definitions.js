{
  explicitRolesDoc: {
    authorizedRoles: {
      add: 'add',
      replace: [ 'replace', 'update' ],
      remove: [ 'remove', 'delete' ]
    },
    typeFilter: function(doc) {
      return doc._id === 'explicitRolesDoc';
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    }
  },
  writeOnlyRolesDoc: {
    authorizedRoles: {
      write: [ 'edit', 'modify', 'write' ]
    },
    typeFilter: function(doc) {
      return doc._id === 'writeOnlyRolesDoc';
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    }
  },
  writeAndAddRolesDoc: {
    authorizedRoles: {
      write: 'edit',
      add: 'add'
    },
    typeFilter: function(doc) {
      return doc._id === 'writeAndAddRolesDoc';
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    }
  },
  dynamicRolesAndUsersDoc: {
    typeFilter: function(doc) {
      return doc._id === 'dynamicRolesAndUsersDoc';
    },
    authorizedRoles: function(doc, oldDoc) {
      return { write: oldDoc ? oldDoc.roles : doc.roles };
    },
    authorizedUsers: function(doc, oldDoc) {
      return { write: oldDoc ? oldDoc.users : doc.users };
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      },
      roles: {
        type: 'array'
      },
      users: {
        type: 'array'
      }
    }
  },
  explicitUsernamesDoc: {
    typeFilter: function(doc) {
      return doc._id === 'explicitUsernamesDoc';
    },
    authorizedUsers: {
      add: [ 'add1', 'add2' ],
      replace: [ 'replace1', 'replace2' ],
      remove: [ 'remove1', 'remove2' ]
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    }
  },
  replaceOnlyRoleDoc: {
    authorizedRoles: {
      replace: 'replace'
    },
    typeFilter: function(doc) {
      return doc._id === 'replaceOnlyRoleDoc';
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    }
  },
  addOnlyRoleDoc: {
    authorizedRoles: {
      add: 'add'
    },
    typeFilter: function(doc) {
      return doc._id === 'addOnlyRoleDoc';
    },
    propertyValidators: {
      stringProp: {
        type: 'string'
      }
    }
  }
}
