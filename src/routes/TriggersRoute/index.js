import IndexRoute from './IndexRoute';
// import TriggersRoute from './TriggersRoute';

// Sync route definition
export default (store) => ({
  path: 'triggers',
  indexRoute: IndexRoute(store)
  // childRoutes: [
  //   TriggersRoute()
  // ]
});
