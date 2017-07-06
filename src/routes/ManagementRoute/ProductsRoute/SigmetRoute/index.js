import IndexRoute from './IndexRoute'
import ParameterRoute from './ParameterRoute'
import PhenomenaRoute from './PhenomenaRoute'

export default (store) => ({
  path: 'sigmet',
  indexRoute: IndexRoute(store),
  childRoutes: [
    ParameterRoute(),
    PhenomenaRoute()
  ]
})
