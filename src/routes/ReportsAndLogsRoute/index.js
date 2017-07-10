import IndexRoute from './IndexRoute';

export default store => ({
  path: 'reports_and_logs',
  indexRoute: IndexRoute(store)
});
