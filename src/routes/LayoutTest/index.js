import HomeRoute from './Home';
import CreateSigmetRoute from './CreateSigmet';

// Sync route definition
export default (store) => ({
  path: 'layouttest',
  indexRoute: HomeRoute(store),
  childRoutes: [
    CreateSigmetRoute()
  ]
});
