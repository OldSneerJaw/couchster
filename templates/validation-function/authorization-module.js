function authorizationModule(utils) {
  // A document definition may define its authorizations (roles or users) for each operation type (add, replace, delete or
  // write) as either a string or an array of strings. In either case, add them to the list if they are not already present.
  function appendToAuthorizationList(allAuthorizations, authorizationsToAdd) {
    if (!utils.isValueNullOrUndefined(authorizationsToAdd)) {
      if (Array.isArray(authorizationsToAdd)) {
        for (var i = 0; i < authorizationsToAdd.length; i++) {
          var authorization = authorizationsToAdd[i];
          if (allAuthorizations.indexOf(authorization) < 0) {
            allAuthorizations.push(authorization);
          }
        }
      } else if (allAuthorizations.indexOf(authorizationsToAdd) < 0) {
        allAuthorizations.push(authorizationsToAdd);
      }
    }
  }

  // Retrieves a list of authorizations (e.g. roles, users) for the current document write operation type (add, replace or remove)
  function resolveRequiredAuthorizations(newDoc, oldDoc, authorizationDefinition) {
    var authorizationMap = utils.resolveDocumentConstraint(authorizationDefinition);

    if (utils.isValueNullOrUndefined(authorizationMap)) {
      // This document type does not define any authorizations (roles, users) at all
      return null;
    }

    var requiredAuthorizations = [ ];
    var writeAuthorizationFound = false;
    if (authorizationMap.write) {
      writeAuthorizationFound = true;
      appendToAuthorizationList(requiredAuthorizations, authorizationMap.write);
    }

    if (newDoc._deleted) {
      if (authorizationMap.remove) {
        writeAuthorizationFound = true;
        appendToAuthorizationList(requiredAuthorizations, authorizationMap.remove);
      }
    } else if (!utils.isDocumentMissingOrDeleted(oldDoc)) {
      if (authorizationMap.replace) {
        writeAuthorizationFound = true;
        appendToAuthorizationList(requiredAuthorizations, authorizationMap.replace);
      }
    } else {
      if (authorizationMap.add) {
        writeAuthorizationFound = true;
        appendToAuthorizationList(requiredAuthorizations, authorizationMap.add);
      }
    }

    if (writeAuthorizationFound) {
      return requiredAuthorizations;
    } else {
      // This document type does not define any authorizations (roles, users) that apply to this particular write operation type
      return null;
    }
  }

  // Ensures the user is authorized to create/replace/delete this document
  function authorize(newDoc, oldDoc, userContext, securityInfo, docDefinition) {
    if (utils.isValueNullOrUndefined(userContext)) {
      throw unauthorizedResult();
    }

    var authorizedRoles = resolveRequiredAuthorizations(newDoc, oldDoc, docDefinition.authorizedRoles);
    var authorizedUsers = resolveRequiredAuthorizations(newDoc, oldDoc, docDefinition.authorizedUsers);
    var grantAllMembersWriteAccess = utils.resolveDocumentConstraint(docDefinition.grantAllMembersWriteAccess);

    if (grantAllMembersWriteAccess) {
      // The document definition allows any authenticated DB member to write documents of this type
      return authorizationSuccessResult(authorizedRoles, authorizedUsers);
    } else if (isAdminUser(userContext, securityInfo)) {
      // Database admins have unrestricted access
      return authorizationSuccessResult(authorizedRoles, authorizedUsers);
    } else if (!authorizedRoles && !authorizedUsers) {
      // The document type does not define any authorized roles or users
      throw forbiddenResult();
    }

    var roleMatch = hasAuthorizedRole(authorizedRoles, userContext.roles);
    var usernameMatch = hasAuthorizedUsername(authorizedUsers, userContext.name);
    if (!roleMatch && !usernameMatch) {
      // None of the required authorizations were satisfied
      throw forbiddenResult();
    } else {
      return authorizationSuccessResult(authorizedRoles, authorizedUsers);
    }
  }

  function hasAuthorizedRole(authorizedRoles, userRoles) {
    var effectiveUserRoles = userRoles || [ ];
    var effectiveAuthorizedRoles = authorizedRoles || [ ];
    for (var userRoleIndex = 0; userRoleIndex < effectiveUserRoles.length; userRoleIndex++) {
      if (effectiveAuthorizedRoles.indexOf(effectiveUserRoles[userRoleIndex]) >= 0) {
        return true;
      }
    }

    // If we got here, the user does not have an authorized role
    return false;
  }

  function hasAuthorizedUsername(authorizedUsers, username) {
    var effectiveAuthorizedUsers = authorizedUsers || [ ];

    return effectiveAuthorizedUsers.indexOf(username) >= 0;
  }

  function isAdminUser(userContext, securityInfo) {
    if (utils.isValueNullOrUndefined(userContext)) {
      throw unauthorizedResult();
    }

    var dbAdminUsers = (securityInfo && securityInfo.admins && securityInfo.admins.names) ? securityInfo.admins.names : [ ];
    if (dbAdminUsers.indexOf(userContext.name) >= 0) {
      return true;
    }

    // See if the user belongs to the server admin role ("_admin") or a DB admin role
    var userRoles = userContext.roles || [ ];
    var dbAdminRoles = (securityInfo && securityInfo.admins && securityInfo.admins.roles) ? securityInfo.admins.roles : [ ];
    for (var userRoleIndex = 0; userRoleIndex < userRoles.length; userRoleIndex++) {
      var userRole = userRoles[userRoleIndex];
      if (userRole === '_admin' || dbAdminRoles.indexOf(userRole) >= 0) {
        return true;
      }
    }

    // If we got here, then the user is not an administrator
    return false;
  }

  function authorizationSuccessResult(authorizedRoles, authorizedUsers) {
    return {
      roles: authorizedRoles,
      users: authorizedUsers
    };
  }

  function unauthorizedResult() {
    return { unauthorized: 'Not authenticated' };
  }

  function forbiddenResult() {
    return { forbidden: 'Access denied' };
  }

  return {
    authorize: authorize,
    isAdminUser: isAdminUser
  };
}
