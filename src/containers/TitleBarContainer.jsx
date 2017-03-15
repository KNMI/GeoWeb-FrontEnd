import React, { Component, PropTypes } from 'react';
import Icon from 'react-fa';
import GeoWebLogo from '../components/assets/icon.svg';
import axios from 'axios';
import { Navbar, NavbarBrand, Row, Col, Nav, NavLink, Breadcrumb, BreadcrumbItem, Collapse, Modal, ModalHeader, ModalBody, ModalFooter, Button, InputGroup, Input, FormText } from 'reactstrap';
import { Link } from 'react-router';
import { BACKEND_SERVER_URL } from '../routes/ADAGUC/constants/backend';
let moment = require('moment');

const timeFormat = 'YYYY MMM DD - HH:mm';

class TitleBarContainer extends Component {
  constructor (props) {
    super(props);
    this.setTime = this.setTime.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
    this.toggleLoginModal = this.toggleLoginModal.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleKeyPressPassword = this.handleKeyPressPassword.bind(this);
    this.checkCredentials = this.checkCredentials.bind(this);
    this.getServices = this.getServices.bind(this);
    this.setLoggedOutCallback = this.setLoggedOutCallback.bind(this);
    this.checkCredentialsOKCallback = this.checkCredentialsOKCallback.bind(this);
    this.checkCredentialsBadCallback = this.checkCredentialsBadCallback.bind(this);

    // TODO REMOVE THIS WHEN /getuser SERVLET IS IMPLEMENTED IN THE BACKEND
    this.inputfieldUserName = 'met1';
    this.inputfieldPassword = 'met1';
    this.timer = -1;

    this.state = {
      currentTime: moment.utc().format(timeFormat).toString(),
      loginModal: this.props.loginModal,
      loginModalMessage: ''
    };
    console.log('this.state.loginModal == ' + this.state.loginModal);
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

  getServices () {
    const { dispatch, actions } = this.props;
    axios.all(['getServices', 'getOverlayServices'].map((req) => axios.get(BACKEND_SERVER_URL + '/' + req, { withCredentials: true }))).then(
      axios.spread((services, overlays) => dispatch(actions.createMap(services.data, overlays.data[0])))
    );
  }

  doLogin () {
    const { isLoggedIn } = this.props;
    if (!isLoggedIn) {
      axios({
        method: 'get',
        url: BACKEND_SERVER_URL + '/login?username=' + this.inputfieldUserName + '&password=' + this.inputfieldPassword,
        withCredentials: true,
        responseType: 'json'
      }).then(src => {
        this.checkCredentials();
      }).catch(error => {
        this.checkCredentialsBadCallback(error);
      });
    } else {
      this.doLogout();
    }
  }

  doLogout () {
    this.setLoggedOutCallback('Signing out');
    axios({
      method: 'get',
      url: BACKEND_SERVER_URL + '/logout',
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      this.setLoggedOutCallback('Signed out');
    }).catch(error => {
      this.setLoggedOutCallback(error.response.data.message);
    });
  }

  checkCredentials () {
    if (this.inputfieldUserName === '') return;
    this.setState({
      loginModalMessage: 'Checking...'
    });

    // TODO make use of /getuser instead of /login when available
    axios({
      method: 'get',
      url: BACKEND_SERVER_URL + '/login?type=checklogin&username=' + this.inputfieldUserName + '&password=' + this.inputfieldPassword,
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      this.checkCredentialsOKCallback(src.data);
    }).catch(error => {
      this.checkCredentialsBadCallback(error);
    });
  }

  setLoggedOutCallback (message) {
    this.inputfieldPassword = '';
    this.inputfieldUserName = '';
    const { dispatch, actions } = this.props;
    this.checkCredentials();
    this.setState({
      loginModalMessage: message
    });
    dispatch(actions.logout());
  };

  checkCredentialsOKCallback (data) {
    const { dispatch, actions } = this.props;
    const username = data.username ? data.username : data.userName;
    if (username && username.length > 0) {
      dispatch(actions.login(username));
      this.setState({
        loginModal: false,
        loginModalMessage: 'Signed in as user ' + username
      });
    } else {
      this.setState({
        loginModalMessage: (this.inputfieldUserName && this.inputfieldUserName.length > 0) ? 'Unauthorized' : ''
      });
    }
    this.getServices();
  }

  checkCredentialsBadCallback (error) {
    const { dispatch, actions } = this.props;
    dispatch(actions.logout());
    this.setState({
      loginModalMessage: error.response.data.message
    });
    this.getServices();
  }

  toggleLoginModal () {
    this.setState({
      loginModal: !this.state.loginModal
    });
  }

  handleKeyPressPassword (target) {
    if (target.charCode === 13) {
      this.doLogin();
    }
  }

  handleOnChange (event) {
    if (event.target.name === 'password') {
      this.inputfieldPassword = event.target.value;
    }
    if (event.target.name === 'username') {
      this.inputfieldUserName = event.target.value;
    }
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
              <NavLink className='active' onClick={this.toggleLoginModal} ><Icon name='user' id='loginIcon' />{isLoggedIn ? ' ' + userName : ' Sign in'}</NavLink>
              <NavLink><Icon name='cog' /></NavLink>
            </Nav>
          </Col>
        </Row>
        <Modal isOpen={this.state.loginModal} toggle={this.toggleLoginModal}>
          <ModalHeader toggle={this.toggleLoginModal}>{isLoggedIn ? 'You are signed in.' : 'Sign out'}</ModalHeader>
          <ModalBody>
            <Collapse isOpen={!isLoggedIn}>
              <InputGroup>
                <Input placeholder='username' name='username' onChange={this.handleOnChange} />
                <Input type='password' name='password' id='examplePassword' placeholder='password'
                  onKeyPress={this.handleKeyPressPassword} onChange={this.handleOnChange}
                />
              </InputGroup>
            </Collapse>
            <FormText color='muted'>
              { this.state.loginModalMessage }
            </FormText>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onClick={this.doLogin} className='signInOut'>
              {isLoggedIn ? 'Sign out' : 'Sign in'}
            </Button>{' '}
            <Button color='secondary' onClick={this.toggleLoginModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Navbar>

    );
  }
}

TitleBarContainer.propTypes = {
  isLoggedIn: PropTypes.bool,
  loginModal: PropTypes.bool,
  userName: PropTypes.string,
  routes: PropTypes.array,
  dispatch: PropTypes.func,
  actions: PropTypes.object
};

TitleBarContainer.defaultProps = {
  isLoggedIn: false,
  loginModal: false,
  userName: ''
};

export default TitleBarContainer;
