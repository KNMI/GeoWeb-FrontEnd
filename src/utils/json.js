import produce from 'immer';
import getNestedProperty from 'lodash.get';
import setNestedProperty from 'lodash.set';
import hasNestedProperty from 'lodash.has';
import cloneDeep from 'lodash.clonedeep';
import unsetNestedProperty from 'lodash.unset';

// Modes for geo-location selection
const MODES_GEO_SELECTION = {
  POINT: 'point',
  BOX: 'box',
  POLY: 'poly',
  FIR: 'fir'
};

const MODES_GEO_MAPPING = {
  [MODES_GEO_SELECTION.POINT]: 'select-point',
  [MODES_GEO_SELECTION.BOX]: 'select-region',
  [MODES_GEO_SELECTION.POLY]: 'select-shape',
  [MODES_GEO_SELECTION.FIR]: 'select-fir'
};

const PATTERN_INDICATOR = 'pattern_';

// Goal: to have a guaranteed data structures
//                       templates
//                           │
// incomingValues ──┐        ▼
//                ┌─┼──▶ validate() ──────▶ merge()
//                │ │      │  ▲
//                │ │      │  │
//                │ │      ▼  │
//                ├─┴──▶ complement()
// existingData ──┘          ▲
//                           │
//                       templates

/**
 * Validate (shallow) a property (path, type) using existing and template structure
 * @param {string|number} propertyKey - The key of the property to validate
 * @param {*} incomingStructure - The incoming structure containing the property to validate
 * @param {*} existingStructure - The existing structure to use as reference
 * @param {*} templateStructure - The template structure to use as specification
 * @param {Object} [result={isValid: false, matchedKey: null}] - An object to store the result
 * @returns {Object} - The result object
 */
const validate = (propertyKey, incomingStructure, existingStructure, templateStructure, result = { isValid: false, matchedKey: null }) => {
  const isPathPresent = isPropertyPresent(existingStructure, propertyKey);
  const isTemplatePresent = isPropertyPresent(templateStructure, Number.isInteger(propertyKey) ? 0 : propertyKey);

  if (isPathPresent && !isTemplatePresent) {

  }

  if (isPathPresent && isTemplatePresent && isSameTypeOrNull(incomingStructure[propertyKey], templateStructure[propertyKey])) {
    if (Number.isInteger(propertyKey)) {
      result.matchedKey = 0;
    }
    result.isValid = true;
    return result;
  }
  return result;
};

/**
 * Try to complement a structure, based on a base template, additional templates, array increments, and property pattern matching
 * @param {string|number} propertyKey - The key of the property to complement
 * @param {*} existingStructure - The existing structure to complement
 * @param {*} templateStructure - The base template structure as a base for complementation
 * @param {*} optionalTemplates - Addtional templates to search for possible matches to be used as base for complementation
 * @param {*} [result={isComplemented: false, structure: null}] - The result object
 */
const complement = (propertyKey, existingStructure, templateStructure, optionalTemplates, result = { isComplemented: false, structure: null }) => {
  return result;
};

const merge = (structure, key, value) => {
  return produce(structure, draftState => {
    draftState[key] = value;
  });
};

const parallelTraverse = (incomingStructure, existingStructure, templateStructure, optionalTemplates) => {
  // determine properties
  const incomingPropertyKeyList = Array.isArray(incomingStructure)
    ? Array.from({ length: incomingStructure.length }, (value, index) => index)
    : isObject(incomingStructure)
      ? Object.keys(incomingStructure)
      : [];
  // validate - and if necessary complement and merge - each property
  incomingPropertyKeyList.forEach((incomingPropertyKey) => {
    const validationResult = {
      isValid: false,
      matchedKey: null
    };
    const complementationResult = {
      isComplemented: false,
      structure: null
    };
    validate(incomingPropertyKey, incomingStructure, existingStructure, templateStructure, validationResult);
    if (!validationResult.isValid) {
      // try to complement structure to fix validation
      complement(incomingPropertyKey, existingStructure, templateStructure, optionalTemplates, complementationResult);
      if (complementationResult.isComplemented) {
        // re-validate complemented structure
        validate(incomingPropertyKey, incomingStructure, existingStructure, templateStructure, validationResult);
      }
    }
    if (validationResult.isValid) {
      const baseStructure = complementationResult.isComplemented
        ? complementationResult.structure
        : existingStructure[incomingPropertyKey];
      if (isEndNode(incomingPropertyKey)) {
        merge(baseStructure, incomingPropertyKey, incomingStructure[incomingPropertyKey]);
      } else {
        parallelTraverse(incomingStructure[incomingPropertyKey], existingStructure[incomingPropertyKey], templateStructure[incomingPropertyKey], optionalTemplates);
      }
    }
  });
};

/**
 * Immutably merges the values into data structure templates
 * @param {Object|Array} incomingValues - The data structure with values to merge into templates, same hierarchy as template
 * @param {string} baseName - The property name of the top level incomingValues entity / base template
 * @param {Object} templates - A map of templates, with keys equal to the property names
 * @param {Object|Array} [existingData=null] - The data structure to use as alternative starting point for the merge
 * @returns {Promise} - A promise which resolves to the data structure template with the incoming values merged
 */
const safeMerge = (incomingValues, baseName, templates, existingData = null) => {
  // input validation
  if (!templates || !isObject(templates)) {
    return Promise.reject(new Error(`Argument 'templates' is missing a proper value`));
  }
  if (!baseName || typeof baseName !== 'string') {
    return Promise.reject(new Error(`Argument 'baseName' is missing a proper value`));
  }
  if (!templates.hasOwnProperty(baseName)) {
    return Promise.reject(new Error(`Template for ${baseName} is missing`));
  }

  const hasExistingData = !!existingData;
  if (hasExistingData && (!isObject(existingData) && !Array.isArray(existingData))) {
    return Promise.reject(new Error(`Argument 'existingData' is missing a proper value`));
  }

  const hasIncomingValues = !!incomingValues;
  if (hasIncomingValues && (!isObject(incomingValues) && !Array.isArray(incomingValues))) {
    return Promise.reject(new Error(`Argument 'incomingValues' is missing a proper value`));
  }

  const baseData = existingData || templates[baseName];
  if (!incomingValues) {
    return Promise.resolve(produce(baseData, () => { }));
  }

  // determine all incoming value pointers
  const incomingPointers = [];
  getJsonPointers(incomingValues, (field) =>
    field === null ||
    ((!Array.isArray(field) || field.length === 0) && (typeof field !== 'object' || field.constructor !== Object)), incomingPointers);

  // find optional patternProperties in the base template hierarchy
  const patternPropertyParentPointers = [];
  getJsonPointers(
    templates[baseName],
    (field) => (
      field !== null && typeof field === 'object' &&
      field.constructor === Object && Object.keys(field).some((key) => key.startsWith(PATTERN_INDICATOR))
    ),
    patternPropertyParentPointers
  );

  // create the new data structure with merged values
  return Promise.resolve(produce(baseData, draftState => {
    // handle each incoming value
    incomingPointers.forEach((pointer) => {
      const pathParts = pointer.split('/');
      pathParts.shift();
      if (hasNestedProperty(draftState, pathParts)) {
        // 1). incoming value and its position do exist in the base data structure
        const templateValue = produce(getNestedProperty(templates[baseName], pathParts), () => {});
        const nextValue = getNestedProperty(incomingValues, pathParts);
        if (templateValue === null ||
            (!Array.isArray(templateValue) && (typeof templateValue !== 'object' || templateValue.constructor !== Object) &&
            (typeof templateValue === typeof nextValue || nextValue === null))) {
          // 1.1) incoming data type is allowed
          setNestedProperty(draftState, pathParts, nextValue);
        } else if (Array.isArray(templateValue) && templateValue.length > 0 && Array.isArray(nextValue) && nextValue.length === 0) {
          // 1.2) emptying arrays is allowed
          const affectedArray = getNestedProperty(draftState, pathParts);
          affectedArray.length = 0;
        }
      } else {
        // 2). incoming value and its position don't match exactly, but could be resolved
        // 2.1) incoming pointer matches a name pattern
        const matchingPatternParentPointers = patternPropertyParentPointers.filter((parentPointer) => pointer.startsWith(parentPointer));
        if (matchingPatternParentPointers.length > 0) {
          // there are name patterns for this pointer
          const patternPaths = [];
          matchingPatternParentPointers.forEach((parentPointer) => {
            const parentPathParts = parentPointer.split('/');
            parentPathParts.shift();
            Object.keys(getNestedProperty(draftState, parentPathParts))
              .filter((possiblePatternKey) => possiblePatternKey.startsWith(PATTERN_INDICATOR))
              .forEach((patternKey) =>
                patternPaths.push([...parentPathParts, patternKey])
              );
            ;
          });
          const patternMatches = patternPaths.filter((path) => {
            const patternIndex = path.length - 1;
            const patternRegEx = new RegExp(path[patternIndex].substring(PATTERN_INDICATOR.length));
            return patternRegEx.test(pathParts[patternIndex]);
          });
          const matchedPathParts = pathParts.slice(0, patternMatches[0].length);

          if (patternMatches.length === 1 && !hasNestedProperty(draftState, matchedPathParts)) {
            setNestedProperty(draftState,
              matchedPathParts,
              cloneDeep(getNestedProperty(draftState, patternMatches[0]))
            );
            if (hasNestedProperty(draftState, pathParts)) {
              const templateValue = getNestedProperty(draftState, pathParts);

              const nextValue = getNestedProperty(incomingValues, pathParts);
              // check for allowed type changes
              if (templateValue === null ||
                (!Array.isArray(templateValue) && (typeof templateValue !== 'object' || templateValue.constructor !== Object) &&
                  (typeof templateValue === typeof nextValue || nextValue === null))) {
                setNestedProperty(draftState, pathParts, nextValue);
                // allows for emptying arrays
              } else if (Array.isArray(templateValue) && templateValue.length > 0 && Array.isArray(nextValue) && nextValue.length === 0) {
                const affectedArray = getNestedProperty(draftState, pathParts);
                affectedArray.length = 0;
              }
              return;
            }
          }
        }

        // Option 2: deal with possible item additions for an intermediate array in the data structure
        const numericIndices = [];
        pathParts.forEach((part, partIndex) => {
          if (!isNaN(part)) {
            numericIndices.push(partIndex);
          }
        });

        if (!numericIndices || !Array.isArray(numericIndices) || numericIndices.length === 0) {
          return;
        }
        numericIndices.sort((a, b) => a - b);
        numericIndices.forEach((numericIndex) => {
          let affectedArray = draftState;
          let templateForArray = templates[baseName];
          let templatePath = [];
          if (numericIndex > 0) {
            // first try to find a template by setting all the intermediate indices to 0
            affectedArray = getNestedProperty(draftState, pathParts.slice(0, numericIndex));
            templatePath = pathParts.slice(0, numericIndex);
            numericIndices.forEach((otherNumericIndex) => {
              if (otherNumericIndex < numericIndex && templatePath[otherNumericIndex] !== 0) {
                templatePath[otherNumericIndex] = 0;
              }
            });
            templateForArray = cloneDeep(getNestedProperty(templates[baseName], templatePath));
          }

          if (!Array.isArray(affectedArray)) {
            return;
          }

          const additionalOccurrences = parseInt(pathParts[numericIndex]) + 1 - affectedArray.length;
          if (additionalOccurrences < 1) {
            return;
          }

          if (!Array.isArray(templateForArray) || templateForArray.length === 0) {
            // next, look up an alternative template
            // find closest ancestor in the data structure with a provided template
            // 1) find indices of path parts for which a template is available (i.e. template key starts with property name)

            const templateKeys = Object.keys(templates);
            const partsWithTemplateIndices = templateKeys
              .map((key) => pathParts.slice(0, numericIndex).lastIndexOf(key.split('-')[0]))
              .filter((index) => index !== -1);
            if (Array.isArray(partsWithTemplateIndices) && partsWithTemplateIndices.length > 0) {
              // 2) sort (descending) the indices to determine the closest ancestor template(s) in line
              partsWithTemplateIndices.sort((a, b) => b - a);
              const relativeTemplatePath = templatePath.slice(partsWithTemplateIndices[0] + 1); // path from ancestor to template
              const ancestorProperty = pathParts[partsWithTemplateIndices[0]];
              // 3) check which ancestor templates provide the nested path
              const ancestorTemplateKeys = templateKeys.filter((key) => key.startsWith(ancestorProperty));
              const templateOptions = relativeTemplatePath.length > 0
                ? ancestorTemplateKeys.map(key => getNestedProperty(templates[key], relativeTemplatePath))
                : ancestorTemplateKeys.map(key => templates[key]);
              if (templateOptions.length === 1) {
                templateForArray = templateOptions[0];
              } else if (templateOptions.length > 1) {
                // multiple template options, check existence and type of field in the template
                const pathInsideTemplate = pathParts.slice(numericIndex).map((part) => !isNaN(part) ? 0 : part); // path from template to field
                const filteredTemplateOptions = templateOptions.filter((option) => {
                  const targetField = getNestedProperty(option, pathInsideTemplate);
                  if (typeof targetField !== 'undefined' && !Array.isArray(targetField)) {
                    return true;
                  }
                  return false;
                });
                templateForArray = filteredTemplateOptions[0];
              }
            }
          }

          if (Array.isArray(templateForArray) && templateForArray.length > 0) {
            affectedArray.push(...Array(additionalOccurrences).fill(cloneDeep(templateForArray[0])));
          }

          if (hasNestedProperty(affectedArray, pathParts.slice(numericIndex))) {
            const templateValue = getNestedProperty(affectedArray, pathParts.slice(numericIndex));
            const nextValue = getNestedProperty(incomingValues, pathParts);
            // check for allowed type changes
            if (templateValue === null ||
              (!Array.isArray(templateValue) && (typeof templateValue !== 'object' || templateValue.constructor !== Object) &&
                (typeof templateValue === typeof nextValue || nextValue === null))) {
              setNestedProperty(draftState, pathParts, nextValue);
            }
          }
        });
      }
    });
  }));
};

/**
 * Check whether the provide value is a structure
 * @param {*} value - The value to check
 * @returns {boolean} - True when the value is an Array or an Object, false otherwise
 */
const isEndNode = (value) =>
  (!Array.isArray(value) && !isObject(value));

/**
   * Checks whether the provided values are of the same type, or one of them is null
   * @param {*} valueA - The first value to compare
   * @param {*} valueB - The second value to compare
   * @returns {boolean} True when the types are equal (or one of them null), false otherwise
   */
const isSameTypeOrNull = (valueA, valueB) => {
  if (valueA === null || valueB === null) {
    return true;
  }
  if (Array.isArray(valueA) && Array.isArray(valueB)) {
    return true;
  }
  if (isObject(valueA) && isObject(valueB)) {
    return true;
  }
  if (typeof valueA === typeof valueB) {
    return true;
  }
  return false;
};

/**
 * Check whether or not a property exists in a structure
 * @param {Object|Array} structure - The structure to search in
 * @param {string|number} key - The key to search for
 * @returns {boolean} - True if key exists, false otherwise
 */
const isPropertyPresent = (structure, key) => {
  if (Array.isArray(structure) && Number.isInteger(key) &&
    key > -1 && key < structure.length && typeof structure[key] !== 'undefined') {
    return true;
  }
  if (isObject(structure) && structure.hasOwnProperty(key) && typeof structure[key] !== 'undefined') {
    return true;
  }
  return false;
};

/**
 * Check if value is defined although falsy
 * @param {*} value The value to check
 * @returns {Boolean} True if the value is defined
 */
const isDefinedFalsy = (value) =>
  (value === 0 || value === false || value === '');

/**
 * Check if structure is an object
 * @param {*} structure The data structure to check
 * @returns {Boolean} True when structure is an object, false otherwise
 */
const isObject = (structure) =>
  (structure !== null && typeof structure === 'object' && structure.constructor === Object);

/**
 * Check if structure is empty
 * @param {*} structure The data structure to check whether or not it is null / empty
 * @returns {Boolean} True when structure is empty false otherwise
 */
const isEmptyStructure = (structure) =>
  (!structure && !isDefinedFalsy(structure)) ||
  (Array.isArray(structure) && structure.filter((item) => isDefinedFalsy(item) || item).length === 0) ||
  (isObject(structure) && Object.keys(structure).length === 0);

/**
 * Upwards recursively remove empty properties
 * @param {Object} objectToClear The object to cleanse
 * @param {Array} pathParts Array of JSON-path-elements
 */
const clearRecursive = (objectToClear, pathParts) => {
  if (!Array.isArray(pathParts) || pathParts.length === 0) {
    return;
  }
  pathParts.pop();
  const parent = pathParts.length === 0 ? cloneDeep(objectToClear) : getNestedProperty(objectToClear, pathParts);
  if (typeof parent === 'undefined') {
    return;
  }

  // Clear for empty siblings
  if (Array.isArray(parent) && parent.length !== 0) {
    const removableIndices = [];
    parent.forEach((child, index) => {
      if (isEmptyStructure(child)) {
        removableIndices.push(index);
      }
    });
    removableIndices.sort((a, b) => b - a);
    removableIndices.forEach((removableIndex) => {
      pathParts.push(removableIndex);
      removeNestedProperty(objectToClear, pathParts);
      pathParts.pop();
    });
  } else if (parent && typeof parent === 'object') {
    Object.entries(parent).forEach(([key, value]) => {
      if (isEmptyStructure(value)) {
        pathParts.push(key);
        removeNestedProperty(objectToClear, pathParts);
        pathParts.pop();
      }
    });
  }

  // Clear parent and recur
  const cleanedParent = pathParts.length === 0 ? cloneDeep(objectToClear) : getNestedProperty(objectToClear, pathParts);

  if (isEmptyStructure(cleanedParent)) {
    clearRecursive(objectToClear, pathParts);
  };
};

/**
 * Collect JSON pointers for all (nested) properties which are matched
 * @param  {Object|Array|string} collection A Collection or property to descend
 * @param  {Function} predicate The test to apply to each property
 * @param  {Array} accumulator The array to store the (intermediate) results
 * @param  {string} [parentName] The parent pointer
 * @return {Array|Boolean} The result of the test, XOR an array with (intermediate) results
 */
const getJsonPointers = (collection, predicate, accumulator, parentName = '') => {
  accumulator = accumulator || [];
  const propertyList = [];
  if (Array.isArray(collection)) {
    collection.forEach((item, index) => {
      propertyList.push(index);
    });
  } else if (collection && typeof collection === 'object') {
    for (let property in collection) {
      propertyList.push(property);
    }
  }
  propertyList.forEach((property) => {
    const myAccum = [];
    if (getJsonPointers(collection[property], predicate, myAccum, property) === true) {
      myAccum.push(property);
    }
    myAccum.forEach((item) => {
      accumulator.push(parentName + '/' + item);
    });
  });
  return predicate(collection) || accumulator;
};

/**
 * Clear all null values in an object, and clear resulting empty ancestors as well
 * @param  {Object} objectToClear An hierarchical object to clean null values for
 */
const clearNullPointersAndAncestors = (objectToClear) => {
  const nullPointers = [];
  getJsonPointers(objectToClear, (field) => field === null, nullPointers);
  nullPointers.reverse(); // handle high (array-)indices first
  nullPointers.forEach((nullPointer) => {
    const pathParts = nullPointer.split('/');
    pathParts.shift();
    clearRecursive(objectToClear, pathParts);
  });
};

/**
 * Clear all empty values in an object, and clear resulting empty ancestors as well
 * @param  {Object} objectToClear An hierarchical object to clean null values for
 */
const clearEmptyPointersAndAncestors = (objectToClear) => {
  const emptyPointers = [];
  getJsonPointers(objectToClear, (field) => isEmptyStructure(field), emptyPointers);
  emptyPointers.reverse(); // handle high (array-)indices first
  emptyPointers.forEach((nullPointer) => {
    const pathParts = nullPointer.split('/');
    pathParts.shift();
    clearRecursive(objectToClear, pathParts);
  });
};

/**
 * Remove nested property in object
 * @param {Object} containingObject An hierarchical object to remove the nested property from
 * @param {Array} pathParts Array of JSON-path-elements
 */
const removeNestedProperty = (containingObject, pathParts) => {
  const parentPathParts = pathParts.slice();
  const propertyKey = parentPathParts.pop();
  if (!isNaN(propertyKey)) {
    const parentObject = getNestedProperty(containingObject, parentPathParts);
    if (Array.isArray(parentObject)) {
      const index = parseInt(propertyKey);
      parentObject.splice(index, 1);
    }
  } else {
    unsetNestedProperty(containingObject, pathParts);
  }
};

/**
 * Test if a feature (in the context of GeoJson) has necessarily properties (coordinates) are valid and present
 * @param {Object} feature The geojson feature to test
 * @returns {Boolean} True when the feature properties are valid and present, false otherwise
 */
const isFeatureGeoJsonComplete = (feature) => {
  if (!isObject(feature) || !isObject(feature.properties)) {
    return false;
  }
  const selectionType = feature.properties.selectionType || null;
  switch (selectionType) {
    case MODES_GEO_SELECTION.FIR:
      return true;
    case MODES_GEO_SELECTION.POINT:
      if (feature.geometry && Array.isArray(feature.geometry.coordinates) &&
          feature.geometry.coordinates.length === 2 && !isNaN(feature.geometry.coordinates[0]) && !isNaN(feature.geometry.coordinates[1])) {
        return true;
      }
      return false;
    case MODES_GEO_SELECTION.POLY:
    case MODES_GEO_SELECTION.BOX:
      if (feature.geometry && Array.isArray(feature.geometry.coordinates) &&
          feature.geometry.coordinates.length > 0) { // polygon (multiple sub-polygons with joins and exclusions)
        if (feature.geometry.coordinates.every((subPolygon) =>
          (Array.isArray(subPolygon) && subPolygon.length > 3 && subPolygon.every((latLon) =>
            (Array.isArray(latLon) && latLon.length === 2 && !isNaN(latLon[0]) && !isNaN(latLon[1]))
          )))) {
          return true;
        }
      }
      return false;
    default:
      return false;
  }
};

module.exports = {
  getJsonPointers: getJsonPointers,
  clearRecursive: clearRecursive,
  safeMerge: safeMerge,
  clearNullPointersAndAncestors: clearNullPointersAndAncestors,
  clearEmptyPointersAndAncestors: clearEmptyPointersAndAncestors,
  removeNestedProperty: removeNestedProperty,
  isFeatureGeoJsonComplete: isFeatureGeoJsonComplete,
  isObject: isObject,
  validate: validate,
  complement: complement,
  parallelTraverse: parallelTraverse,
  MODES_GEO_SELECTION: MODES_GEO_SELECTION,
  MODES_GEO_MAPPING: MODES_GEO_MAPPING
};
