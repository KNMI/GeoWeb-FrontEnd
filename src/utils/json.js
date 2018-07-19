import produce from 'immer';
import getNestedProperty from 'lodash.get';
import setNestedProperty from 'lodash.set';
import hasNestedProperty from 'lodash.has';
import cloneDeep from 'lodash.clonedeep';
import removeNestedProperty from 'lodash.unset';

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
      // console.log('Pointer', pointer);
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
        // console.log('indices', numericIndices);
        numericIndices.forEach((numericIndex, indexIndex) => {
          let affectedArray = draftState;
          let affectedName = parentName;
          if (numericIndex > 0) {
            affectedArray = getNestedProperty(draftState, pathParts.slice(0, numericIndex));
            affectedName = pathParts[numericIndex - 1];
          }
          if (!Array.isArray(affectedArray) || affectedArray.length === 0) {
            return;
          }
          const additionalOccurrences = parseInt(pathParts[numericIndex]) + 1 - affectedArray.length;
          if (additionalOccurrences < 1) {
            return;
          }

          let templateForArray = templates[affectedName];
          if (typeof templateForArray === 'undefined') {
            // fallback for uppercase property name
            templateForArray = templates[affectedName.toUpperCase()];
          }
          if (typeof templateForArray === 'undefined' && !isNaN(affectedName)) {
            // fallback for nested arrays
            const reversedNumericIndices = numericIndices.slice(0, indexIndex + 1).reverse();
            const previousReversedIndex = reversedNumericIndices.find((reversedNumericIndex, reversedIndexIndex) =>
              reversedNumericIndices[reversedIndexIndex] - reversedNumericIndices[reversedIndexIndex + 1] > 1);
            let firstNonNumericIndex = previousReversedIndex ? previousReversedIndex - 1 : -1;
            if (firstNonNumericIndex === -1) {
              affectedName = parentName;
            } else {
              affectedName = pathParts[firstNonNumericIndex];
            }
            templateForArray = getNestedProperty(templates[affectedName], pathParts.slice(firstNonNumericIndex + 1, numericIndex));
          }
          // console.log('name', affectedName, templateForArray);
          // console.log('additional', additionalOccurrences);
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
 * Upwards recursively remove empty properties
 * @param {Object} objectToClear The object to cleanse
 * @param {Array} pathParts Array of JSON-path-elements
 */
const clearRecursive = (objectToClear, pathParts) => {
  pathParts.pop();
  const parent = getNestedProperty(objectToClear, pathParts);
  // Check for empty sibling arrays / objects
  if (Array.isArray(parent) && parent.length !== 0) {
    parent.forEach((child, index) => {
      if ((!child) ||
        (Array.isArray(child) && child.length === 0) ||
        (typeof child === 'object' && Object.keys(child).length === 0)) {
        pathParts.push(index);
        removeNestedProperty(objectToClear, pathParts);
        pathParts.pop();
      }
    });
  } else if (parent && typeof parent === 'object') {
    Object.entries(parent).forEach(([key, value]) => {
      if ((!value && value !== 0) ||
        (Array.isArray(value) && value.length === 0) ||
        (value && typeof value === 'object' && Object.keys(value).length === 0)) {
        pathParts.push(key);
        removeNestedProperty(objectToClear, pathParts);
        pathParts.pop();
      }
    });
  }
  if ((Array.isArray(parent) && parent.length === 0) || (parent && typeof parent === 'object' && Object.keys(parent).length === 0)) {
    removeNestedProperty(objectToClear, pathParts);
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
  nullPointers.forEach((nullPointer) => {
    const pathParts = nullPointer.split('/');
    pathParts.shift();
    removeNestedProperty(objectToClear, pathParts);
    clearRecursive(objectToClear, pathParts);
  });
};

module.exports = {
  getJsonPointers: getJsonPointers,
  clearRecursive: clearRecursive,
  mergeInTemplate: mergeInTemplate,
  clearNullPointersAndAncestors: clearNullPointersAndAncestors
};
