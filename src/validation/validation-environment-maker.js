const path = require('path');
const simpleMock = require('../../lib/simple-mock/index');
const stubbedEnvironmentMaker = require('../environments/stubbed-environment-maker');

/**
 * Parses the given document definitions string as JavaScript and creates a stubbed environment where the global CouchDB functions and
 * variables (e.g. doc, oldDoc, simpleTypeFilter, toJSON) are simple stubs.
 *
 * @param {string} docDefinitionsString The document definitions as a string
 *
 * @returns A JavaScript object that exposes the document definitions via the "documentDefinitions" property along with the stubbed global
 *          dependencies via properties that match their names (e.g. "newDoc", "oldDoc", "typeIdValidator", "simpleTypeFilter")
 */
exports.create = function(docDefinitionsString) {
  const envFunction = stubbedEnvironmentMaker.create(
    path.resolve(__dirname, '../../templates/environments/validation-environment-template.js'),
    '$DOC_DEFINITIONS_PLACEHOLDER$',
    docDefinitionsString);

  return envFunction(simpleMock);
};
