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

const PATTERN_INDICATOR = '{patternProperties}_';
/**
 * Purpose: to have guaranteed, immutable, data structures
 * Pattern: use (the same) templates to validate and to complement the data structure
 *
 *                       templates
 *                           │
 * incomingValue ───┐        ▼
 *                ┌─┴──▶ validate ──────▶ merge
 *                │        │  ▲
 *                │        │  │
 *                │        ▼  │
 *                ├────▶ complement
 * existingData ──┘          ▲
 *                           │
 *                       templates
 *
 */

/**
 * Complements data structure for pattern properties
 * @param {Object|Array} parentStructure - The data structure to complement
 * @param {Object|Array} template - The template to inject
 * @param {string} complementKey - The index key at which the template will be injected
 * @param {Array} pointerPath - The prefixing path
 */
const complementForPattern = (parentStructure, template, complementKey, pointerPath) => {
  parentStructure[complementKey] = cloneDeep(getNestedProperty(template, pointerPath));
};

/**
 * Complements data structure for numeric properties
 * @param {Object|Array} parentStructure - The data structure to complement
 * @param {Object|Array} template - The template to inject
 * @param {string} complementKey - The index key at which the template will be injected
 * @param {Array} pointerPath - The prefixing path
 */
const complementForNumeric = (parentStructure, template, complementKey, pointerPath) => {
  if (!isNaN(complementKey) && Array.isArray(parentStructure)) {
    const additionalOccurrences = parseInt(complementKey) + 1 - parentStructure.length;
    const templateForArray = cloneDeep(getNestedProperty(template, pointerPath));
    if (additionalOccurrences > 0) {
      parentStructure.push(...Array(additionalOccurrences).fill(cloneDeep(templateForArray)));
    }
  }
};

/**
 * Filter possible solutions (paths) to match a given path partially:
 * for the last path part it implies testing against a RegExp in the sollution,
 * for other parts it implies string equality
 * @param {Array} solutions - An array of paths to be filtered
 * @param {Array} path - The path to filter against
 * @returns {Array} - a subset of the solutions array
 */
const filterSolutions = (solutions, path) =>
  solutions.filter((solutionPath) => {
    const lastIndex = solutionPath.length - 1;
    return solutionPath.length <= path.length &&
      solutionPath.every((part, index) =>
        (index < lastIndex && part === path[index]) ||
        (index === lastIndex && isRegExp(part.regEx) && part.regEx.test(path[index]))
      );
  });

/**
 * Immutably merges the values into data structure templates
 * @param {Object|Array} incomingValues - The data structure with values to merge into templates, same hierarchy as template
 * @param {string} baseName - The property name of the top level incomingValues entity / base template
 * @param {Object} templates - A map of templates, with keys equal to the property names
 * @param {Object|Array} [existingData=null] - The data structure to use as alternative starting point for the merge
 * @returns {Object|Array} - The data structure template with the incoming values merged
 */
const safeMerge = (incomingValues, baseName, templates, existingData = null) => {
  // input validation
  if (!templates || !isObject(templates)) {
    throw new Error(`Argument 'templates' is missing a proper value`);
  }
  if (!baseName || typeof baseName !== 'string') {
    throw new Error(`Argument 'baseName' is missing a proper value`);
  }
  if (!templates.hasOwnProperty(baseName)) {
    throw new Error(`Template for ${baseName} is missing`);
  }

  const hasExistingData = !!existingData;
  if (hasExistingData && (!isObject(existingData) && !Array.isArray(existingData))) {
    throw new Error(`Argument 'existingData' is missing a proper value`);
  }

  const hasIncomingValues = !!incomingValues;
  if (hasIncomingValues && (!isObject(incomingValues) && !Array.isArray(incomingValues))) {
    throw new Error(`Argument 'incomingValues' is missing a proper value`);
  }

  const baseData = existingData || templates[baseName];
  if (!incomingValues) {
    return produce(baseData, () => { });
  }

  // determine all incoming value pointers
  const incomingPointers = [];
  getJsonPointers(incomingValues, (field) =>
    field === null ||
    ((!Array.isArray(field) || field.length === 0) && (typeof field !== 'object' || field.constructor !== Object)), incomingPointers);

  // find pattern properties (keys) in the base template hierarchy
  const templatePatternKeyPointers = [];
  getJsonPointers(
    templates[baseName],
    (value, pointer) => (typeof pointer === 'string' && pointer.substring(pointer.lastIndexOf('/') + 1).startsWith(PATTERN_INDICATOR)),
    templatePatternKeyPointers
  );
  const patternKeySolutions = templatePatternKeyPointers.map((pointer) => {
    const pointerPath = pointer.split('/');
    pointerPath.shift();
    const key = pointerPath.pop();
    pointerPath.push({
      key,
      regEx: new RegExp(key.substring(PATTERN_INDICATOR.length)),
      complement: (parentStructure, complementKey) => {
        complementForPattern(parentStructure, templates[baseName], complementKey, pointerPath.slice(0, -1).concat(key));
      }
    });
    return pointerPath;
  });

  // find numeric properties (keys) in the base template hierarchy
  const templateNumericKeyPointers = [];
  getJsonPointers(
    templates[baseName],
    (value, pointer) => ((typeof pointer === 'string' || typeof pointer === 'number') && !isNaN(pointer)),
    templateNumericKeyPointers
  );
  const numericKeySolutions = templateNumericKeyPointers.map((pointer) => {
    const pointerPath = pointer.split('/');
    pointerPath.shift();
    const key = pointerPath.pop();
    pointerPath.push({
      key,
      regEx: new RegExp('^\\d+$'),
      complement: (parentStructure, complementKey) => {
        complementForNumeric(parentStructure, templates[baseName], complementKey, pointerPath.slice(0, -1).concat(key));
      }
    });
    return pointerPath;
  });

  /**
   * Find a solution from all possible ones, matching the problematic path
   * @param {Array} path - The path to find a solution for the problems
   * @returns {Object} - An object with properties cardinality and path of the solution
   */
  const getSolutionSpace = (path) => {
    const solutionDimensions = [patternKeySolutions, numericKeySolutions];
    console.log('num', numericKeySolutions);
    const filteredSolutionDimensions = solutionDimensions.map((dimension) => filterSolutions(dimension, path));
    const cardinality = filteredSolutionDimensions.reduce((accumulator, dimension) => accumulator + dimension.length, 0);
    const solutionPath = cardinality === 1
      ? filteredSolutionDimensions.filter((dimension) => dimension.length === 1)[0][0]
      : null;
    return { cardinality, path: solutionPath };
  };

  // create the new data structure with merged values
  return produce(baseData, draftState => {
    // handle each incoming value
    incomingPointers.forEach((pointer) => {
      const pathParts = pointer.split('/');
      pathParts.shift();

      // 1). Resolve template
      const templatePath = pathParts.slice();
      let templateValue = cloneDeep(getNestedProperty(templates[baseName], templatePath));
      const templatePathSolutions = [];
      if (typeof templateValue === 'undefined') {
        let solutionSpace = getSolutionSpace(templatePath);
        console.log('Space', solutionSpace);
        // quit, when either: templateValue is resolved, there is no solution, or the same solution is presented again
        while (typeof templateValue === 'undefined' && solutionSpace.cardinality === 1 &&
          (templatePathSolutions.length === 0 || solutionSpace.path.length > templatePathSolutions.slice(-1)[0].length)) {
          const lastSolutionPathIndex = solutionSpace.path.length - 1;
          templatePathSolutions.push(solutionSpace.path);
          templatePath[lastSolutionPathIndex] = solutionSpace.path[lastSolutionPathIndex].key;
          templateValue = cloneDeep(getNestedProperty(templates[baseName], templatePath));
          solutionSpace = getSolutionSpace(templatePath);
        };
      } else {
        templatePathSolutions.push(getSolutionSpace(templatePath).path);
      }

      // TODO: resolve alternative templates?
      console.log('1). Template Path', templatePath.join('/'));

      if (typeof templateValue === 'undefined') {
        console.warn(`No template value found for ${pointer}. This value will be skipped.`);
        return;
      }

      // 2). Complement data structure

      if (!hasNestedProperty(draftState, pathParts) && templatePathSolutions.length > 0) {
        templatePathSolutions.forEach((solutionPath) => {
          const index = solutionPath.length - 1;
          const parentPath = index > 0 ? pathParts.slice(0, index) : [];
          const existingParentProperty = parentPath.length > 0 ? getNestedProperty(draftState, parentPath) : draftState;
          const existingProperty = existingParentProperty[pathParts[index]];
          if (typeof existingProperty !== 'undefined') {
            return;
          }
          solutionPath[index].complement(existingParentProperty, pathParts[index]);
        });
      }

      console.log('2). Complemented State', JSON.stringify(draftState, null, 2));

      // m 3). Merge the value when it is valid

      if (hasNestedProperty(draftState, pathParts)) {
        // 1). incoming value, its position (and a template value) do exist in the base data structure
        const nextValue = getNestedProperty(incomingValues, pathParts);
        if (templateValue === null ||
          (!Array.isArray(templateValue) && !isObject(templateValue) &&
            (typeof templateValue === typeof nextValue || nextValue === null))) {
          // 1.1) incoming data type is allowed
          setNestedProperty(draftState, pathParts, nextValue);
          console.log('Found value', pointer);
        } else if (Array.isArray(templateValue) && templateValue.length > 0 && Array.isArray(nextValue) && nextValue.length === 0) {
          // 1.2) emptying arrays is allowed
          const affectedArray = getNestedProperty(draftState, pathParts);
          affectedArray.length = 0;
          console.log('Found array', pointer);
        }
      }
    });
  });
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
 * Check if structure is an regular expression object
 * @param {*} structure The data structure to check
 * @returns {Boolean} True when structure is an regular expression object, false otherwise
 */
const isRegExp = (structure) =>
  (structure !== null && typeof structure === 'object' && structure.constructor === RegExp);

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
 * @param  {string} [parentPointer] The parent pointer
 * @return {Array|Boolean} The result of the test, XOR an array with (intermediate) results
 */
const getJsonPointers = (collection, predicate, accumulator, parentPointer = '') => {
  accumulator = accumulator || [];
  const keyList = Array.isArray(collection)
    ? collection.map((item, index) => index)
    : isObject(collection)
      ? Object.keys(collection)
      : [];
  keyList.forEach((key) => {
    const myAccum = [];
    if (getJsonPointers(collection[key], predicate, myAccum, key) === true) {
      myAccum.push(key);
    }
    myAccum.forEach((nestedPointer) => {
      accumulator.push(`${parentPointer}/${nestedPointer}`);
    });
  });
  return predicate(collection, parentPointer) || accumulator;
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
  MODES_GEO_SELECTION: MODES_GEO_SELECTION,
  MODES_GEO_MAPPING: MODES_GEO_MAPPING
};
