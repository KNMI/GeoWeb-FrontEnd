import React, { Component } from 'react';
import Icon from 'react-fa';
import GeoWebLogo from './assets/icon.svg';
import axios from 'axios';
import { Navbar, NavbarToggler, NavbarBrand, Collapse, Nav, NavItem, NavLink, Modal, ModalHeader, ModalBody, ModalFooter, Button, InputGroup, Input, FormText } from 'reactstrap';
import { BACKEND_SERVER_URL } from '../routes/ADAGUC/constants/backend';
var moment = require('moment');
class TitleBar extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.toggleLoginModal = this.toggleLoginModal.bind(this);
    this.setTime = this.setTime.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleKeyPressPassword = this.handleKeyPressPassword.bind(this);
    this.checkCredentials = this.checkCredentials.bind(this);
    this.getServices = this.getServices.bind(this);
    this.state = {
      currentTime: moment.utc().format('YYYY MMM DD - HH:mm:ss').toString(),
      isOpen: false,
      loginModal: false,
      loginModalMessage: ''
    };
    // TODO REMOVE THIS WHEN /getuser SERVLET IS IMPLEMENTED IN THE BACKEND
    this.inputfieldUserName = 'met1';
    this.inputfieldPassword = 'met1';
    this.timer;
  }
  toggle () {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  setTime () {
    const time = moment.utc().format('YYYY MMM DD - HH:mm:ss').toString();
    this.setState({ currentTime: time });
  }
  componentWillUnmount () {
    clearInterval(this.timer);
  }
  componentDidMount () {
    this.timer = setInterval(this.setTime, 1000);
    this.setState({ currentTime: moment.utc().format('YYYY MMM DD - HH:mm:ss').toString() });
  }

  getServices () {
    const { dispatch, actions } = this.props;
    axios.all(['getServices', 'getOverlayServices'].map((req) => axios.get(BACKEND_SERVER_URL + '/' + req, { withCredentials: true }))).then(
      axios.spread((services, overlays) => dispatch(actions.createMap(services.data, overlays.data[0])))
    );
  }

  checkCredentials () {
    console.log('checkCredentials');
    const { dispatch, actions } = this.props;
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
      const data = src.data;
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
    }).catch(error => {
      dispatch(actions.logout());
      console.log(error.response.data.error);
      console.log(error.response.data.message);
      console.log(error.response.status);
      console.log(error.response.headers);
      this.setState({
        loginModalMessage: error.response.data.message
      });
      this.getServices();
    });
  }

  doLogout () {
    const { dispatch, actions } = this.props;
    console.log('doLogout');
    this.inputfieldPassword = '';
    this.inputfieldUserName = '';
    axios({
      method: 'get',
      url: BACKEND_SERVER_URL + '/logout',
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      this.checkCredentials();
    }).catch(error => {
      this.setState({
        loginModalMessage: error.response.data.message
      });
      this.getServices();
    });
    dispatch(actions.logout());
  }

  doLogin () {
    const { adagucProperties } = this.props;
    const { loggedIn } = adagucProperties;
    if (!loggedIn) {
      axios({
        method: 'get',
        url: BACKEND_SERVER_URL + '/login?username=' + this.inputfieldUserName + '&password=' + this.inputfieldPassword,
        withCredentials: true,
        responseType: 'json'
      }).then(src => {
        this.checkCredentials();
      }).catch(error => {
        this.setState({
          loginModalMessage: error.response.data.message
        });
        this.getServices();
      });
    } else {
      this.doLogout();
    }
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
    const { adagucProperties } = this.props;
    const { loggedIn, username } = adagucProperties;
    return (
      <div id='gw-navbar'>
        <Navbar color='faded' light toggleable>
          <NavbarToggler right onClick={this.toggle} />
          <NavbarBrand href='/'>
            <img
              alt='This is a duck, because Redux!'
              className='duck'
              src={GeoWebLogo} width='32px' />
            <span>GeoWeb</span>
          </NavbarBrand>
          <Nav navbar style={{ width: '2000rem' }} >
            <NavItem className='mx-auto'>
              {this.state.currentTime} UTC
            </NavItem>
          </Nav>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className='ml-auto' navbar>
              <NavItem>
                <NavLink><Icon name='user' id='loginIcon' onClick={this.toggleLoginModal} />{loggedIn ? username : ''}</NavLink>
              </NavItem>
              <NavItem>
                <NavLink><Icon name='cog' /></NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        <Modal isOpen={this.state.loginModal} toggle={this.toggleLoginModal}>
          <ModalHeader toggle={this.toggleLoginModal}>{loggedIn ? 'You are signed in.' : 'Sign in'}</ModalHeader>
          <ModalBody>
            <Collapse isOpen={!loggedIn}>
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
            <Button color='primary' onClick={this.doLogin}>{loggedIn ? 'Sign out' : this.inputfieldUserName === 'met1' && this.inputfieldPassword === 'met1' ? 'Sign in with met1/met1' : 'Sign in'}</Button>{' '}
            <Button color='secondary' onClick={this.toggleLoginModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

TitleBar.propTypes = {
  adagucProperties: React.PropTypes.object,
  dispatch: React.PropTypes.func,
  actions: React.PropTypes.object
};

export default TitleBar;
