import React, { Component } from 'react';
import Icon from 'react-fa';
import GeoWebLogo from './assets/icon.svg';
import { Navbar, NavbarToggler, NavbarBrand, Collapse, Nav, NavItem, NavLink, Popover, PopoverTitle, PopoverContent } from 'reactstrap';
var moment = require('moment');
class TitleBar extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.setTime = this.setTime.bind(this);
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
    var currentTime = setInterval(this.setTime, 1000);
    this.setState({ currentTime: currentTime });
  }

  render () {
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
                <NavLink><Icon name='user' /></NavLink>
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

export default TitleBar;
