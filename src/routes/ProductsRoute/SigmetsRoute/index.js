import IndexRoute from './IndexRoute';
import CreateSigmetRoute from './CreateSigmetRoute';

// Sync route definition
export default store => ({
  path: 'sigmets',
  indexRoute: IndexRoute(store),
  childRoutes: [
    CreateSigmetRoute()
  ]
});
