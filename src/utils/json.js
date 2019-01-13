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

const NODE_TYPES = {
  ARRAY: 'array',
  OBJECT: 'object',
  LEAF: 'leaf'
};

const PATTERN_INDICATOR = '{patternProperties}_';
const ONE_OF_INDICATOR = '{oneOf}_';
/**
 * Purpose: to have guaranteed, immutable, consistent, incorruptable data structures
 * Pattern: use (the same) templates to validate and to complement the data structure
 *
 *                       templates
 *                           │
 * incomingValue ───┐        ▼
 *                ┌─┴──▶ validate ──────▶ merge
 *                │        │  ▲
 *                │        │  │
 *                │        ▼  │
 *                ├─┬──▶ complement
 * existingData ──┘ │        ▲
 *                  │        │
 * defaultValue ────┘    templates
 *
 */

/**
 * Successively extracts a nested template, strips placeholders and complements with default information
 * @param {Object|Array} template - The (top level) template
 * @param {Array} pointerPath - The pointer as array to the structure part which needs to be complemented
 * @param {Array} placeholderPaths - The paths to placeholders
 * @returns {*} - The complement for the structure part
 */
const getComplement = (template, pointerPath, placeholderPaths) => {
  const complement = Array.isArray(pointerPath) && pointerPath.length > 0
    ? cloneDeep(getNestedProperty(template, pointerPath))
    : cloneDeep(template);
  const strippablePlaceholders = placeholderPaths.filter((path) =>
    pointerPath.every((part, index) => part === path[index])
  );
  strippablePlaceholders.forEach((placeholderPath) => {
    removeNestedProperty(complement, placeholderPath.slice(pointerPath.length));
  });
  return complement;
};

/**
 * Complements data structure for dynamic property keys
 * @param {Object|Array} parentStructure - The data structure to complement
 * @param {Object|Array} template - The template to inject
 * @param {string} complementKey - The dynamic key at which the template will be injected
 * @param {Array} pointerPath - The prefixing path
 * @param {Array} placeholderPaths - The paths to placeholders
 */
const complementForKey = (parentStructure, template, complementKey, pointerPath, placeholderPaths) => {
  parentStructure[complementKey] = getComplement(template, pointerPath, placeholderPaths);
};

/**
 * Complements data structure for additions (i.e. numeric properties -> array)
 * @param {Object|Array} parentStructure - The data structure to complement
 * @param {Object|Array} template - The template to inject
 * @param {string} complementKey - The index key at which the template will be injected
 * @param {Array} pointerPath - The prefixing path
 * @param {Array} placeholderPaths - The paths to placeholders
 */
const complementForAdditions = (parentStructure, template, complementKey, pointerPath, placeholderPaths) => {
  if (!isNaN(complementKey) && Array.isArray(parentStructure)) {
    const additionalOccurrences = parseInt(complementKey) + 1 - parentStructure.length;
    const templateForArray = getComplement(template, pointerPath, placeholderPaths);
    Array(additionalOccurrences).fill(null).forEach((occurrence, index) => {
      parentStructure.push(cloneDeep(templateForArray));
    });
  }
};

/**
 * Filter possible solutions (paths) to match a given path partially:
 * for the last path part it implies testing against a RegExp in the sollution,
 * for other parts it implies string equality
 * @param {Array} solutions - An array of paths to be filtered
 * @param {Array} path - The path to filter against
 * @param {boolean} [skipTemplateValueCheck] - Whether or not the exact template value should be filtered
 * @returns {Array} - a subset of the solutions array
 */
const filterSolutions = (solutions, path, startIndex, skipTemplateValueCheck = false) =>
  solutions.filter((solution) => {
    return solution.templateValueIndex() < path.length && solution.templateValueIndex() >= startIndex &&
      solution.path.every((part, index) =>
        (index < solution.templateValueIndex() && part === path[index]) ||
        (index === solution.templateValueIndex() && solution.test(path[index]) &&
          (skipTemplateValueCheck || part !== path[index]))
      );
  });

/**
   * Find a solution from all possible ones, matching the problematic path
   * @param {Array} path - The path to find a solution for the problems
   * @param {Array} dimensions - The solution collections of various type
   * @param {number} startIndex - The path index to start from
   * @param {boolean} [skipTemplateValueCheck] - Whether or not the exact template value should be checked
   * @returns {Object} - An object with properties cardinality and path of the solution
   */
const getSolutionSpace = (path, dimensions, startIndex, skipTemplateValueCheck = false) => {
  const filteredSolutionDimensions = dimensions.map((dimension) =>
    filterSolutions(dimension, path, startIndex, skipTemplateValueCheck)
  );
  const solutions = filteredSolutionDimensions.reduce((accumulator, dimension) => accumulator.concat(dimension), []);
  const cardinality = solutions.length;
  return { cardinality, solutions };
};

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

  // determine all incoming value pointers
  const incomingPointers = [];
  getJsonPointers(incomingValues, (field) =>
    field === null ||
    ((!Array.isArray(field) || field.length === 0) && !isObject(field)), incomingPointers);

  // find pattern properties (keys) in the base template hierarchy
  const templatePatternKeyPointers = [];
  getJsonPointers(
    templates[baseName],
    (value, pointer) => (typeof pointer === 'string' && pointer.substring(pointer.lastIndexOf('/') + 1).startsWith(PATTERN_INDICATOR)),
    templatePatternKeyPointers
  );
  const templatePatternKeyPaths = templatePatternKeyPointers.map((pointer) => pointer.split('/').slice(1));

  // find numeric properties (keys) in the base template hierarchy
  const templateNumericKeyPointers = [];
  getJsonPointers(
    templates[baseName],
    (value, pointer) => ((typeof pointer === 'string' || typeof pointer === 'number') && !isNaN(pointer)),
    templateNumericKeyPointers
  );
  const templateNumericKeyPaths = templateNumericKeyPointers.map((pointer) => pointer.split('/').slice(1));

  // find pattern properties (keys) in the base template hierarchy
  const templateOneOfKeyPointers = [];
  getJsonPointers(
    templates[baseName],
    (value, pointer) => (typeof pointer === 'string' && pointer.substring(pointer.lastIndexOf('/') + 1).startsWith(ONE_OF_INDICATOR)),
    templateOneOfKeyPointers
  );
  const templateOneOfKeyPaths = templateOneOfKeyPointers.map((pointer) => pointer.split('/').slice(1));

  const placeholderPaths = [].concat(templatePatternKeyPaths, templateNumericKeyPaths, templateOneOfKeyPaths);

  // create solution paths for pattern properties and numeric keys
  const patternKeySolutions = templatePatternKeyPaths.map((path) => {
    return (() => {
      const _key = path.slice(-1)[0];
      const _regExp = new RegExp(_key.substring(PATTERN_INDICATOR.length));
      const _templateIndex = path.length - 1;
      const _incomingIndex = _templateIndex;
      return {
        templateValueIndex: () => _templateIndex,
        incomingValueIndex: () => _incomingIndex,
        path,
        test: (value) => _regExp.test(value),
        complement: (parentStructure, complementKey) => {
          complementForKey(parentStructure, templates[baseName], complementKey, path, placeholderPaths);
        },
        rewritePath: (pointerPath) =>
          pointerPath.slice(0, _templateIndex).concat(_key).concat(pointerPath.slice(_templateIndex + 1)),
        done: () => {}
      };
    })();
  });
  const numericKeySolutions = templateNumericKeyPaths.map((path) => {
    return (() => {
      const _key = path.slice(-1)[0];
      const _regExp = new RegExp('^\\d+$');
      const _templateIndex = path.length - 1;
      const _incomingIndex = _templateIndex;
      return {
        templateValueIndex: () => _templateIndex,
        incomingValueIndex: () => _incomingIndex,
        path,
        test: (value) => _regExp.test(value),
        complement: (parentStructure, complementKey) => {
          complementForAdditions(parentStructure, templates[baseName], complementKey, path, placeholderPaths);
        },
        rewritePath: (pointerPath) =>
          pointerPath.slice(0, _templateIndex).concat(_key).concat(pointerPath.slice(_templateIndex + 1)),
        done: () => {}
      };
    })();
  });
  const oneOfKeySolutions = templateOneOfKeyPaths.map((path) => {
    return (() => {
      const _key = path.slice(-1)[0];
      let _matchingIndex = null;
      const _regExp = new RegExp(_key.substring(ONE_OF_INDICATOR.length));
      let _templateIndex = path.length - 1;
      const _incomingIndex = _templateIndex;
      const downStreamTypes = getNestedProperty(templates[baseName], path).map((template) =>
        Array.isArray(template)
          ? NODE_TYPES.ARRAY
          : isObject(template)
            ? NODE_TYPES.OBJECT
            : NODE_TYPES.LEAF
      );
      return {
        templateValueIndex: () => _templateIndex,
        incomingValueIndex: () => _incomingIndex,
        path,
        test: (value) => _regExp.test(value),
        complement: (parentStructure, complementKey) => {
          complementForKey(parentStructure, templates[baseName], complementKey,
            _matchingIndex !== null ? path.concat(`${_matchingIndex}`) : path, placeholderPaths);
        },
        rewritePath: (pointerPath) => {
          const downStreamPointerPath = pointerPath.slice(_templateIndex + 1);
          _matchingIndex = downStreamTypes.findIndex((type) =>
            (type === NODE_TYPES.ARRAY && downStreamPointerPath.length > 0 && !isNaN(downStreamPointerPath[0])) ||
            (type === NODE_TYPES.OBJECT && downStreamPointerPath.length > 0 && isNaN(downStreamPointerPath[0])) ||
            (type === NODE_TYPES.LEAF && downStreamPointerPath.length === 0)
          );
          const resultPath = pointerPath.slice(0, _templateIndex).concat(_key).concat(`${_matchingIndex}`)
            .concat(pointerPath.slice(_templateIndex + 1));
          _templateIndex += 1;
          return resultPath;
        },
        done: () => { _templateIndex = _incomingIndex; _matchingIndex = null; }
      };
    })();
  });

  const solutionDimensions = [patternKeySolutions, numericKeySolutions, oneOfKeySolutions];

  // handle situations without incoming data
  const baseData = existingData ||
    getComplement(templates[baseName], [], placeholderPaths);
  if (!incomingValues) {
    return produce(baseData, () => { });
  }

  // create the new data structure with merged values
  return produce(baseData, draftState => {
    // handle each incoming value
    incomingPointers.forEach((pointer) => {
      const pathParts = pointer.split('/');
      pathParts.shift();

      // 1). Resolve template
      let templatePath = pathParts.slice();
      let templateValue = getNestedProperty(templates[baseName], templatePath);
      const pathPartSolutions = [];
      if (typeof templateValue === 'undefined') {
        // the incoming pointer may have parts that are not literally equal, but that match the pattern for that part
        // in the template. To find such part, a 'solution space' - with possible solutions extracted from the template -
        // is minimized and the solution applied.
        let solutionSpace = getSolutionSpace(templatePath, solutionDimensions, 0);
        // quit when either: templateValue is resolved or there is no solution
        while (typeof templateValue === 'undefined' && solutionSpace.cardinality === 1) {
          const solution = solutionSpace.solutions[0];
          templatePath = solution.rewritePath(templatePath);
          pathPartSolutions.push(solution);
          templateValue = getNestedProperty(templates[baseName], templatePath);
          solutionSpace = getSolutionSpace(templatePath, solutionDimensions, solution.templateValueIndex() + 1);
        };
      }

      // devise a solution for pointers which exist in the incoming and template structures,
      // but are still missing in the data structure
      const solutionSpace = getSolutionSpace(templatePath, solutionDimensions, 0, true);
      solutionSpace.solutions.forEach((solution) => {
        if (!pathPartSolutions.some((prevSolution) =>
          prevSolution.templateValueIndex() === solution.templateValueIndex())) {
          pathPartSolutions.push(solution);
        }
      });

      // console.log('1). Template Path', templatePath.join('/'));

      if (typeof templateValue === 'undefined') {
        console.warn(`No template value found for ${pointer}. This value will be skipped.`);
        return;
      }

      // 2). Validate incoming type
      const nextValue = getNestedProperty(incomingValues, pathParts);
      let isNextEmptyArray = false;
      // 2.1). incoming data type is directly allowed
      let isValid = (templateValue === null ||
        (!Array.isArray(templateValue) && !isObject(templateValue) &&
          (typeof templateValue === typeof nextValue || nextValue === null)));
      // 2.2). emptying arrays is allowed
      if (!isValid && Array.isArray(templateValue) && templateValue.length > 0 &&
        Array.isArray(nextValue) && nextValue.length === 0) {
        isValid = true;
        isNextEmptyArray = true;
      }

      if (!isValid) {
        console.warn(`New value for ${pointer} is not of a valid type. This value will be skipped.`);
        return;
      }

      // 3). Complement data structure

      if (!hasNestedProperty(draftState, pathParts) && pathPartSolutions.length > 0) {
        // sort, so complementing starts from the beginning of the path
        pathPartSolutions.sort((solutionA, solutionB) => solutionA.templateValueIndex() - solutionB.templateValueIndex());
        // some solutions might have adjusted the template path length
        const indexOffsets = pathPartSolutions.filter((solution) => solution.templateValueIndex() !== solution.incomingValueIndex())
          .map((adjustedSolution) => ({
            index: adjustedSolution.templateValueIndex(),
            offset: adjustedSolution.templateValueIndex() - adjustedSolution.incomingValueIndex()
          }));

        pathPartSolutions.forEach((solution) => {
          const solutionIndex = indexOffsets.reduce(
            (accumulator, offsetItem) =>
              offsetItem.index < solution.incomingValueIndex() ? accumulator - offsetItem.offset : accumulator,
            solution.incomingValueIndex()
          );
          const parentPath = solutionIndex > 0 ? pathParts.slice(0, solutionIndex) : [];
          const existingParentProperty = parentPath.length > 0 ? getNestedProperty(draftState, parentPath) : draftState;
          const incomingPropertyKey = pathParts[solution.incomingValueIndex()];
          const existingProperty = existingParentProperty[incomingPropertyKey];
          if (typeof existingProperty !== 'undefined') {
            solution.done();
            return;
          }
          solution.complement(existingParentProperty, incomingPropertyKey);
          solution.done();
        });
      }

      // 4). Merge the value when it exists (after the completion) in the structure

      if (hasNestedProperty(draftState, pathParts)) {
        if (isNextEmptyArray) {
          const affectedArray = getNestedProperty(draftState, pathParts);
          affectedArray.length = 0;
        } else {
          setNestedProperty(draftState, pathParts, nextValue);
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
  const parent = pathParts.length === 0 ? produce(objectToClear, () => { }) : getNestedProperty(objectToClear, pathParts);
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
  } else if (isObject(parent)) {
    Object.entries(parent).forEach(([key, value]) => {
      if (isEmptyStructure(value)) {
        pathParts.push(key);
        removeNestedProperty(objectToClear, pathParts);
        pathParts.pop();
      }
    });
  }

  // Clear parent and recur
  const cleanedParent = pathParts.length === 0 ? produce(objectToClear, () => { }) : getNestedProperty(objectToClear, pathParts);

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
