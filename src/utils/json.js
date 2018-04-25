import getNestedProperty from 'lodash.get';
import removeNestedProperty from 'lodash.unset';

/**
 * Upwards recursively remove empty properties
 * @param  {Object} objectToClear The object to cleanse
 * @param  {Array} pathParts Array of JSON-path-elements
 */
const clearRecursive = (objectToClear, pathParts) => {
  pathParts.pop();
  const parent = getNestedProperty(objectToClear, pathParts);
  // Check for empty sibling arrays / objects
  if (Array.isArray(parent) && parent.length === 0) {
    const length = parent.length;
    for (let index = 0; index < length; index++) {
      if (!parent[index] ||
        (Array.isArray(parent[index]) && parent[index].length === 0) ||
        (typeof parent[index] === 'object' && Object.indexs(parent[index]).length === 0)) {
        pathParts.push(index);
        removeNestedProperty(objectToClear, pathParts);
        pathParts.pop();
      }
    }
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
    const length = collection.length;
    for (let arrIndex = 0; arrIndex < length; arrIndex++) {
      propertyList.push(arrIndex);
    }
  } else if (collection && typeof collection === 'object') {
    for (let property in collection) {
      propertyList.push(property);
    }
  }
  const listLength = propertyList.length;
  for (let listIndex = 0; listIndex < listLength; listIndex++) {
    const property = propertyList[listIndex];
    const myAccum = [];
    if (getJsonPointers(collection[property], predicate, myAccum, property) === true) {
      myAccum.push(property);
    }
    const length = myAccum.length;
    for (let accumIndex = 0; accumIndex < length; accumIndex++) {
      accumulator.push(parentName + '/' + myAccum[accumIndex]);
    }
  }
  return predicate(collection) || accumulator;
};

/**
 * Clear all null values in an object, and clear resulting empty ancestors as well
 * @param  {Object} objectToClear An hierarchical object to clean null values for
 */
const clearNullPointersAndAncestors = (objectToClear) => {
  const nullPointers = [];
  getJsonPointers(objectToClear, (field) => field === null, nullPointers);
  const nullPointersLength = nullPointers.length;
  for (let pointerIndex = 0; pointerIndex < nullPointersLength; pointerIndex++) {
    const pathParts = nullPointers[pointerIndex].split('/');
    pathParts.shift();
    removeNestedProperty(objectToClear, pathParts);
    clearRecursive(objectToClear, pathParts);
  }
};

module.exports = {
  getJsonPointers: getJsonPointers,
  clearRecursive: clearRecursive,
  clearNullPointersAndAncestors: clearNullPointersAndAncestors
};
