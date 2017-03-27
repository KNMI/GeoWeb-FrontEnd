import IndexRoute from './IndexRoute';
import LocationRoute from './LocationRoute';
import ProgtempRoute from './ProgtempRoute';
import SigmetRoute from './SigmetRoute';

export default (store) => ({
  path: 'manage',
  indexRoute: IndexRoute(store),
  childRoutes: [
    LocationRoute(),
    ProgtempRoute(),
    SigmetRoute()
  ]
});
