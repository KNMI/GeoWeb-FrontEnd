import IndexRoute from './IndexRoute';
import ProgtempRoute from './ProgtempRoute';
import SigmetRoute from './SigmetRoute';

export default (store) => ({
  path: 'products',
  indexRoute: IndexRoute(store),
  childRoutes: [
    ProgtempRoute(),
    SigmetRoute()
  ]
});
