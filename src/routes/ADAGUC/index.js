import { injectReducer } from '../../store/reducers';

export default (store) => ({
  // path : 'adaguc',
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
          dependencies for bundling   */
      const Adaguc = require('./containers/AdagucContainer').default;
      const reducer = require('./modules/adaguc').default;

      /*  Add the reducer to the store on key 'counter'  */
      injectReducer(store, { key: 'adagucProperties', reducer });

      /*  Return getComponent   */
      cb(null, Adaguc);

    /* Webpack named bundle   */
    }, 'adaguc');
  }
});
