const whitespaceRegEx = /[\11\12\14\15\40]/;

/**
 * Utility function to determine whether or not a class name is included
 * @param {string} classNames The space separated (list of) class names
 * @param {string} classToCheck The class name to check for
 * @returns {bool} True when classToCheck is included, False otherwise
 */
const hasClass = (classNames, classToCheck) => {
  if (typeof classNames === 'string' && typeof classToCheck === 'string') {
    const classSet = new Set(classNames.trim().split(whitespaceRegEx));
    return classSet.has(classToCheck);
  }
  return false;
};

export default hasClass;
