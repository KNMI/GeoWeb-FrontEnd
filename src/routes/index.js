// We only need to import the modules necessary for initial render
import BaseLayout from '../layouts/BaseLayout';
import HomeRoute from './Home';
import ADAGUC from './ADAGUC';
import ApiDemo from './ApiDemo';
import FileNotFoundRoute from './FileNotFound';
import TitleBar from '../components/TitleBar';
import React from 'react';
import { Route } from 'react-router';
import { connect } from 'react-redux';

/*  Note: Instead of using JSX, we recommend using react-router
    PlainRoute objects to build route definitions.   */

// export const createRoutes = (store) => ({
//   path        : '/',
//   component: BaseLayout,
//   indexRoute  : HomeRoute(store),
//   childRoutes : [
//     ADAGUC(store),
//     ApiDemo(),
//     FileNotFoundRoute()
//   ]
// });

// export const createRoutes = (store) => (
//   <Route component={BaseLayout}>
//     <Route path='/' components={{ header: connect(mapStateToProps)(TitleBar) }} />
//   </Route>
// );

export const createRoutes = (store) => ({
  path: '/',
  component: BaseLayout,
  indexRoute: HomeRoute(store),
  childRoutes: [
    ADAGUC(store),
    ApiDemo(),
    FileNotFoundRoute()
  ]
});

/*  Note: childRoutes can be chunked or otherwise loaded programmatically
    using getChildRoutes with the following signature:

    getChildRoutes (location, cb) {
      require.ensure([], (require) => {
        cb(null, [
          // Remove imports!
          require('./Counter').default(store)
        ])
      })
    }

    However, this is not necessary for code-splitting! It simply provides
    an API for async route definitions. Your code splitting should occur
    inside the route `getComponent` function, since it is only invoked
    when the route exists and matches.
*/

export default createRoutes;
