import HomeRoute from './Home';
import CreateSigmetRoute from './CreateSigmet';

// Sync route definition
export default (store) => ({
  path: 'layouttest',
  title: 'Layout Test',
  indexRoute: HomeRoute(store),
  childRoutes: [
    CreateSigmetRoute()
  ]
});
