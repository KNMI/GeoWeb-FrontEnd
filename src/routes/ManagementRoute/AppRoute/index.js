import IndexRoute from './IndexRoute'
import LocationRoute from './LocationRoute'

export default (store) => ({
  path: 'app',
  indexRoute: IndexRoute(store),
  childRoutes: [
    LocationRoute()
  ]
})
