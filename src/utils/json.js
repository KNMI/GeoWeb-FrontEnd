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

/**
 * Merges the values into (nested) templates
 * @param {any} incomingValues The object with values to merge into templates, same hierarchy as template
 * @param {string} parentName The property name of the top level incomingValues entity
 * @param {object} templates A map of templates, with keys equal to the property names
 * @returns {any} The template with the incoming values merged or null
 */
const mergeInTemplate = (incomingValues, parentName, templates) => {
  if (!templates || !templates.hasOwnProperty(parentName)) {
    return null;
  }
  const incomingPointers = [];
  getJsonPointers(incomingValues, (field) =>
    field === null ||
    (!Array.isArray(field) && (typeof field !== 'object' || field.constructor !== Object)), incomingPointers);
  return produce(templates[parentName], draftState => {
    incomingPointers.forEach((pointer) => {
      const pathParts = pointer.split('/');
      pathParts.shift();
      if (hasNestedProperty(draftState, pathParts)) {
        const templateValue = getNestedProperty(draftState, pathParts);
        const nextValue = getNestedProperty(incomingValues, pathParts);
        // check for allowed type changes
        if (templateValue === null ||
          (!Array.isArray(templateValue) && (typeof templateValue !== 'object' || templateValue.constructor !== Object) &&
          typeof templateValue === typeof nextValue)) {
          setNestedProperty(draftState, pathParts, nextValue);
        }
      } else {
        // deal with possible item additions for an intermediate array in the data structure
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
          let templateForArray = templates[parentName];
          if (numericIndex > 0) {
            affectedArray = getNestedProperty(draftState, pathParts.slice(0, numericIndex));
            const templatePath = pathParts.slice(0, numericIndex);
            numericIndices.forEach((otherNumericIndex) => {
              if (otherNumericIndex < numericIndex && templatePath[otherNumericIndex] !== 0) {
                templatePath[otherNumericIndex] = 0;
              }
            });
            templateForArray = getNestedProperty(templates[parentName], templatePath);
          }
          if (!Array.isArray(affectedArray) || affectedArray.length === 0) {
            return;
          }
          const additionalOccurrences = parseInt(pathParts[numericIndex]) + 1 - affectedArray.length;
          if (additionalOccurrences < 1) {
            return;
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
                  typeof templateValue === typeof nextValue)) {
              setNestedProperty(draftState, pathParts, nextValue);
            }
          }
        });
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
  (structure && typeof structure === 'object' && structure.constructor === Object);

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
 * @param  {Object|Array|String} collection A Collection or property to descend
 * @param  {Function} predicate The test to apply to each property
 * @param  {Array} accumulator The array to store the (intermediate) results
 * @param  {String, optional} parentName The parent pointer
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
  mergeInTemplate: mergeInTemplate,
  clearNullPointersAndAncestors: clearNullPointersAndAncestors,
  clearEmptyPointersAndAncestors: clearEmptyPointersAndAncestors,
  removeNestedProperty: removeNestedProperty,
  isFeatureGeoJsonComplete: isFeatureGeoJsonComplete,
  isObject: isObject,
  MODES_GEO_SELECTION: MODES_GEO_SELECTION
};
