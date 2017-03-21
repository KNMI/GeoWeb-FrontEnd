import IndexRoute from './IndexRoute';

export default (store) => ({
  path: 'full_screen',
  indexRoute: IndexRoute(store)
});
