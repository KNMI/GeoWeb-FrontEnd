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
    clearInterval(this.state.currentTime);
  }
  componentDidMount () {
    setInterval(this.setTime, 15000);
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
    const depth = routes.length;
    return (
      <Navbar inverse>
        <Row>
          <Col xs='auto'>
            <NavbarBrand href='/#/layouttest'>
              <img
                alt='Home of GeoWeb'
                className='logo'
                src={GeoWebLogo} />
              <span>GeoWeb</span>
            </NavbarBrand>
          </Col>
          <Col>
            <Breadcrumb tag='nav'>
              {routes.map((item, index) =>
                <BreadcrumbItem key={index}>
                  <Link onlyActiveOnIndex activeClassName='breadcrumb-active' to={item.path || ''}>
                    {item.title}
                  </Link>
                </BreadcrumbItem>
              )}
            </Breadcrumb>
          </Col>
          <Col>
            <span className='navbar-text mx-auto'>
              {this.state.currentTime} UTC
            </span>
          </Col>
          <Col xs='auto'>
            <Nav>
              <NavLink><Icon name='user' id='loginIcon' onClick={this.doLogin} /> {isLoggedIn ? userName : 'Login'}</NavLink>
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
