import IndexRoute from './IndexRoute';
import SigmetsRoute from './SigmetsRoute';

// Sync route definition
export default store => ({
  path: 'products',
  indexRoute: IndexRoute(store),
  childRoutes: [
    SigmetsRoute()
  ]
});
