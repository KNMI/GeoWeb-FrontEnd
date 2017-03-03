import React, { Component } from 'react';
import Icon from 'react-fa';
import GeoWebLogo from './assets/icon.svg';
import axios from 'axios';
import { Navbar, NavbarToggler, NavbarBrand, Collapse, Nav, NavItem, NavLink } from 'reactstrap';
var moment = require('moment');
class TitleBar extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.setTime = this.setTime.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.state = {
      currentTime: moment.utc().format('YYYY MMM DD - HH:mm:ss').toString(),
      isOpen: false
    };
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
    clearInterval(this.state.currentTime);
  }
  componentDidMount () {
    setInterval(this.setTime, 1000);
    this.setState({ currentTime: moment.utc().format('YYYY MMM DD - HH:mm:ss').toString() });
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
                <NavLink><Icon name='user' id='loginIcon' onClick={this.doLogin} />{loggedIn ? username : ''}</NavLink>
              </NavItem>
              <NavItem>
                <NavLink><Icon name='cog' /></NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
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
