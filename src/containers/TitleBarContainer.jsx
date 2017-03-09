import React, { Component, PropTypes } from 'react';
import Icon from 'react-fa';
import GeoWebLogo from '../components/assets/icon.svg';
import axios from 'axios';
import { Navbar, NavbarBrand, Row, Col, Nav, NavLink, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Link } from 'react-router';
let moment = require('moment');

const timeFormat = 'YYYY MMM DD - HH:mm';

class TitleBarContainer extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.setTime = this.setTime.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.state = {
      currentTime: moment.utc().format(timeFormat).toString(),
      isOpen: false
    };
    this.timer = -1;
  }
  getTitleForRoute (routeItem) {
    return (routeItem.indexRoute ? routeItem.indexRoute.title : routeItem.title) || 'Untitled';
  }
  isRouteEnd (routes, index) {
    const lastIndex = routes.length - 1;
    if (index === lastIndex) {
      return true;
    }
    if (index === lastIndex - 1 && routes[index].indexRoute &&
        routes[index].indexRoute === routes[index + 1]) {
      return true;
    }
    return false;
  }
  toggle () {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  setTime () {
    const time = moment.utc().format(timeFormat).toString();
    this.setState({ currentTime: time });
  }
  componentWillUnmount () {
    clearInterval(this.timer);
  }
  componentDidMount () {
    this.timer = setInterval(this.setTime, 15000);
    this.setState({ currentTime: moment.utc().format(timeFormat).toString() });
  }

  doLogin () {
    const rootURL = 'http://birdexp07.knmi.nl:8080';
    const { dispatch, actions } = this.props;
    axios.get(rootURL + '/login?username=met1&password=met1', { withCredentials: true }).then(src => {
      const data = src.data;
      if (data.userName !== null) {
        dispatch(actions.login(data.userName));
        axios.all(['getServices', 'getOverlayServices'].map((req) => axios.get(rootURL + '/' + req, { withCredentials: true }))).then(
          axios.spread((services, overlays) => dispatch(actions.createMap(services.data, overlays.data[0])))
        );
      }
    });
  }
  render () {
    const { isLoggedIn, userName, routes } = this.props;
    let cumulativePath = '';
    return (
      <Navbar inverse className='test'>
        <Row>
          <Col xs='auto'>
            <NavbarBrand tag='div'>
              <Link activeClassName='breadcrumb-active' to={routes[0].path}>
                <img alt='Home of GeoWeb' className='logo' src={GeoWebLogo} />
                <span>{this.getTitleForRoute(routes[0])}</span>
              </Link>
            </NavbarBrand>
          </Col>
          <Col xs='auto'>
            <Breadcrumb tag='nav'>
              {routes.map((item, index) => {
                // Skip first one (already in NavbarBrand) and IndexRoutes
                if (index > 0 && item.path) {
                  cumulativePath += '/' + item.path;
                  return (<BreadcrumbItem key={index}>
                    <Link activeClassName='breadcrumb-active' to={this.isRouteEnd(routes, index) ? '' : cumulativePath || ''}>
                      {this.getTitleForRoute(item)}
                    </Link>
                  </BreadcrumbItem>);
                }
                return '';
              })}
            </Breadcrumb>
          </Col>
          <Col>
            <span className='navbar-text mx-auto'>
              {this.state.currentTime} UTC
            </span>
          </Col>
          <Col xs='auto'>
            <Nav>
              <NavLink className='active' onClick={this.doLogin}><Icon name='user' id='loginIcon' /> {isLoggedIn ? userName : 'Login'}</NavLink>
              <NavLink><Icon name='cog' /></NavLink>
            </Nav>
          </Col>
        </Row>
      </Navbar>
    );
  }
}

TitleBarContainer.propTypes = {
  isLoggedIn: PropTypes.bool,
  userName: PropTypes.string,
  routes: PropTypes.array,
  dispatch: PropTypes.func,
  actions: PropTypes.object
};

export default TitleBarContainer;
