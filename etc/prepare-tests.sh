#!/bin/sh -e

cd "$(dirname "$0")"/.. || exit 1

outputDir="build/validation-functions"

echo "Linting modules and specs with JSHint...\n"
node_modules/jshint/bin/jshint src test

sampleDocDefinitionsPath="samples/sample-doc-definitions.js"

# Validate the structure and sematics of the sample document definitions
echo "Validating sample document definitions...\n"
./validate-document-definitions "$sampleDocDefinitionsPath"

# Create a validation function from the sample document definitions file
echo "Generating document validation functions...\n"
./make-validation-function "$sampleDocDefinitionsPath" "$outputDir"/test-sample-validation-function.js

# Automatically validate and create a validation function from each document definitions file in the test resources directory
definitionsDir="test/resources"
for docDefinitionPath in "$definitionsDir"/*-doc-definitions.js; do
  # Skip entries that are not files
  if [ ! -f "$docDefinitionPath" ]; then continue; fi

  ./validate-document-definitions "$docDefinitionPath"

  validationFuncName=$(basename "$docDefinitionPath" "-doc-definitions.js")

  outputFile="$outputDir/test-$validationFuncName-validation-function.js"

  ./make-validation-function "$docDefinitionPath" "$outputFile"
done

# Set up JSHint configuration for the generated validation functions
cp "etc/jshintrc-validation-function-template.json" "$outputDir/.jshintrc"

echo "\nLinting generated document validation functions with JSHint...\n"
node_modules/jshint/bin/jshint "$outputDir"/*.js

echo "Done"
