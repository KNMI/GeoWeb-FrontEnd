import HomeRoute from './Home';
import CreateSigmetRoute from './CreateSigmet';

// Sync route definition
export default (store) => ({
  path: 'layout_test',
  indexRoute: HomeRoute(store),
  childRoutes: [
    CreateSigmetRoute()
  ]
});
