import IndexRoute from './IndexRoute';

export default store => ({
  path: 'checklist',
  indexRoute: IndexRoute(store)
});
