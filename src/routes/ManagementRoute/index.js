import IndexRoute from './IndexRoute';
import AppRoute from './AppRoute';
import ProductsRoute from './ProductsRoute';

export default (store) => ({
  path: 'manage',
  indexRoute: IndexRoute(store),
  childRoutes: [
    AppRoute(),
    ProductsRoute()
  ]
});
