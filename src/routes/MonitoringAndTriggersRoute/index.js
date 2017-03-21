import IndexRoute from './IndexRoute';

export default (store) => ({
  path: 'monitoring_and_triggers',
  indexRoute: IndexRoute(store)
});
