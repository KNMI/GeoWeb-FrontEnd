export const debounce = function (func, threshold, execAsap) {
  let timeout; // handle to setTimeout async task (detection period)

  // return the new debounced function which executes the original function only once
  // until the detection period expires
  return function debounced () {
    const obj = this; // reference to original context object
    const args = arguments; // arguments at execution time
    // this is the detection function. it will be executed if/when the threshold expires
    function delayed () {
      // if we're executing at the end of the detection period
      if (!execAsap) {
        func.apply(obj, args); // execute now
      }
      // clear timeout handle
      timeout = null;
    };
    // stop any current detection period
    if (timeout) {
      clearTimeout(timeout);
    } else {
    // otherwise, if we're not already waiting and we're executing at the beginning of the detection period
      if (execAsap) {
        func.apply(obj, args); // execute now
      }
    }
    // reset the detection period
    timeout = setTimeout(delayed, threshold || 100);
  };
};
