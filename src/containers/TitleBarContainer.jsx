import React, { Component } from 'react';
import Icon from 'react-fa';
import GeoWebLogo from '../components/assets/icon.svg';
import { CheckIfUserHasRole } from '../utils/user';
import { SaveURLPreset } from '../utils/URLPresets';
import { UserRoles } from '../constants/userroles';
import CopyToClipboard from 'react-copy-to-clipboard';
import axios from 'axios';
import uuidV4 from 'uuid/v4';
import { Navbar, NavbarBrand, Row, Col, Nav, NavLink, Breadcrumb, BreadcrumbItem, Collapse,
ButtonGroup, Popover, Form,
FormGroup,
Label,
PopoverContent, PopoverTitle, InputGroupButton,
  Modal, ModalHeader, ModalBody, ModalFooter, Button, InputGroup, Input, FormText } from 'reactstrap';
import { Link, hashHistory } from 'react-router';
import { BACKEND_SERVER_URL } from '../constants/backend';
import PropTypes from 'prop-types';
import moment from 'moment';
import { addNotification } from 'reapop';

const timeFormat = 'YYYY MMM DD - HH:mm';
const browserFullScreenRequests = [
  'mozRequestFullScreen',
  'msRequestFullscreen',
  'webkitRequestFullScreen'
];

class TitleBarContainer extends Component {
  constructor (props) {
    super(props);
    this.setTime = this.setTime.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
    this.triggerService = this.triggerService.bind(this);
    this.retrieveTriggers = this.retrieveTriggers.bind(this);
    this.gotTriggersCallback = this.gotTriggersCallback.bind(this);
    this.errorTriggersCallback = this.errorTriggersCallback.bind(this);
    this.toggleLoginModal = this.toggleLoginModal.bind(this);
    this.togglePresetModal = this.togglePresetModal.bind(this);
    this.toggleSharePresetModal = this.toggleSharePresetModal.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleKeyPressPassword = this.handleKeyPressPassword.bind(this);
    this.checkCredentials = this.checkCredentials.bind(this);
    this.setLoggedOutCallback = this.setLoggedOutCallback.bind(this);
    this.checkCredentialsOKCallback = this.checkCredentialsOKCallback.bind(this);
    this.checkCredentialsBadCallback = this.checkCredentialsBadCallback.bind(this);
    this.getServices = this.getServices.bind(this);
    this.render = this.render.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.inputfieldUserName = '';
    this.inputfieldPassword = '';
    this.timer = -1;
    this.savePreset = this.savePreset.bind(this);
    this.sharePreset = this.sharePreset.bind(this);
    this.makePresetObj = this.makePresetObj.bind(this);
    this.state = {
      currentTime: moment().utc().format(timeFormat).toString(),
      loginModal: this.props.loginModal,
      loginModalMessage: '',
      presetModal: false,
      sharePresetModal: false,
      sharePresetName: ''
    };
  }

  triggerService () {
    if (!this.triggerIntervalId) {
      this.retrieveTriggers();
      this.triggerIntervalId = setInterval(this.retrieveTriggers, moment.duration(2, 'minute').asMilliseconds());
    }
  }

  retrieveTriggers () {
    axios({
      method: 'get',
      url: BACKEND_SERVER_URL + '/triggers/gettriggers?startdate=' + moment().subtract(1, 'hours').utc().format() + '&duration=3600',
      withCredentials: true,
      responseType: 'json'
    }).then(this.gotTriggersCallback)
    .catch(this.errorTriggersCallback);
  }

  getTriggerTitle (trigger) {
    return trigger.phenomenon.parameter + ' (' + trigger.phenomenon.source + ')';
  }
  getTriggerMessage (trigger) {
    let retStr = '';
    const { phenomenon, triggerdate } = trigger;
    const { parameter, operator, threshold, units } = phenomenon;
    const formattedDate = moment.utc(triggerdate).format('HH:mm');
    if (phenomenon.source === 'OBS') {
      retStr = `${parameter} of ${operator}${threshold} ${units} observed at ${formattedDate}`;
    }

    return retStr;
  }

  seen (notification) {
    if (!this.props.recentTriggers) {
      return false;
    }
    return this.props.recentTriggers.some((trigger) => trigger.uuid === notification.uuid);
  }

  handleTriggerClick (locations) {
    if (locations !== this.props.adagucProperties.triggerLocations) {
      this.props.dispatch(this.props.actions.setTriggerLocations(locations));
    } else {
      this.props.dispatch(this.props.actions.setTriggerLocations([]));
    }
  }

  diffWrtNow (adate, bdate) {
    const adiff = moment.utc().diff(moment.utc(adate), 'seconds');
    const bdiff = moment.utc().diff(moment.utc(bdate), 'seconds');
    return adiff - bdiff;
  }

  gotTriggersCallback (result) {
    if (result.data.length > 0) {
      result.data.filter((notification) => !this.seen(notification)).filter((trigger) =>
        !this.props.notifications.some((not) => not.id === trigger.uuid)).sort((a, b) => this.diffWrtNow(a.triggerdate, b.triggerdate)).slice(0, 3).forEach((trigger, i) => {
          this.props.dispatch(addNotification({
            title: this.getTriggerTitle(trigger),
            message: this.getTriggerMessage(trigger),
            position: 'bl',
            id: trigger.uuid,
            raw: trigger,
            status: 'error',
            buttons: [
              {
                name: 'Discard',
                primary: true
              }, {
                name: 'Where',
                onClick: (e) => { e.stopPropagation(); this.handleTriggerClick(trigger.locations); }
              }
            ],
            dismissible: false,
            dismissAfter: 0,
            allowHTML: true
          }));
        });
    }
  }

  errorTriggersCallback (error) {
    console.error('Error occurred while retrieving triggers', error);
  }

  getServices () {
    const { dispatch, mapActions, adagucActions } = this.props;
    const defaultURLs = ['getServices', 'getOverlayServices'].map((url) => BACKEND_SERVER_URL + '/' + url);
    const allURLs = [...defaultURLs];
    axios.all(allURLs.map((req) => axios.get(req, { withCredentials: true }))).then(
      axios.spread((services, overlays) => {
        dispatch(mapActions.createMap());
        dispatch(adagucActions.setSources([...services.data, ...JSON.parse(localStorage.getItem('geoweb')).personal_urls, overlays.data[0]]));
      })
    ).catch((e) => console.log('Error!: ', e));
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
    const time = moment().utc().format(timeFormat).toString();
    this.setState({ currentTime: time });
  }

  componentWillUnmount () {
    clearInterval(this.timer);
    clearInterval(this.triggerIntervalId);
  }

  componentDidMount () {
    this.triggerService();
    this.timer = setInterval(this.setTime, 15000);
    this.setState({ currentTime: moment().utc().format(timeFormat).toString() });
    this.checkCredentials();
  }

  componentDidUpdate () {
    if (this.userNameInputRef && this.state.loginModal === true) {
      this.userNameInputRef.focus();
    }
  }

  doLogin () {
    const { user } = this.props;
    const { isLoggedIn } = user;
    if (!isLoggedIn) {
      axios({
        method: 'get',
        url: BACKEND_SERVER_URL + '/login?username=' + this.inputfieldUserName + '&password=' + this.inputfieldPassword,
        withCredentials: true,
        responseType: 'json'
      }).then(src => {
        this.checkCredentials(() => {
          // When signed in as admin, jump to admin manage page
          if (CheckIfUserHasRole(user.roles, UserRoles.ADMIN)) {
            hashHistory.push('/manage/app');
          }
        });
      }).catch(error => {
        this.checkCredentialsBadCallback(error);
      });
    } else {
      this.doLogout();
    }
  }

  doLogout () {
    this.toggleLoginModal();
    axios({
      method: 'get',
      url: BACKEND_SERVER_URL + '/logout',
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      this.setLoggedOutCallback('Signed out');
      hashHistory.push('/');
    }).catch(error => {
      this.setLoggedOutCallback(error.response.data.message);
    });
  }

  checkCredentials (callback) {
    try {
      this.setState({
        loginModalMessage: 'Checking...'
      });
    } catch (e) {
      console.error(e);
    }
    axios({
      method: 'get',
      url: BACKEND_SERVER_URL + '/getuser',
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      this.checkCredentialsOKCallback(src.data);
      if (callback)callback();
    }).catch(error => {
      this.checkCredentialsBadCallback(error);
    });
  }

  setLoggedOutCallback (message) {
    this.inputfieldPassword = '';
    this.inputfieldUserName = '';
    const { dispatch, userActions } = this.props;
    this.checkCredentials();
    this.setState({
      loginModalMessage: message
    });
    dispatch(userActions.logout());
    this.getServices();
  };

  checkCredentialsOKCallback (data) {
    const { dispatch } = this.props;
    const username = data.username ? data.username : data.userName;
    const roles = data.roles;
    if (username && username.length > 0) {
      if (username === 'guest') {
        if (this.inputfieldUserName !== '' && this.inputfieldUserName !== 'guest') {
          // User has entered something else than 'guest', so the backend does not return the new user.
          // This is probably causes by cookies not being saved.
          this.checkCredentialsBadCallback({ response: { data: {
            message:'Your browser is probably blocking cookies. We need cookies to keep your credentials. Please contact your administrator.'
          } } });
        } else {
          this.checkCredentialsBadCallback({ response: { data: { message:'guest' } } });
        }
        return;
      }
      this.getServices();
      dispatch(this.props.userActions.login({ username:username, roles:roles }));

      this.setState({
        loginModal: false,
        loginModalMessage: 'Signed in as user ' + username
      });
    } else {
      this.getServices();
      this.setState({
        loginModalMessage: (this.inputfieldUserName && this.inputfieldUserName.length > 0) ? 'Unauthorized' : ''
      });
    }
  }

  checkCredentialsBadCallback (error) {
    let errormsg = '';
    try {
      if (error.response && error.response.data) {
        errormsg = error.response.data.message;
      } else {
        errormsg = error.message;
      }
    } catch (e) {
      console.error(e);
    }
    const { dispatch, userActions } = this.props;
    dispatch(userActions.logout());
    this.setState({
      loginModalMessage: errormsg === 'guest' ? '' : errormsg
    });
    this.getServices();
  }

  toggleLoginModal () {
    this.setState({
      loginModal: !this.state.loginModal,
      loginModalMessage:''
    });
  }

  toggleFullscreen () {
    const elmt = document.querySelector('body');
    let requestFullScreenFunc = elmt.requestFullscreen;
    if (!requestFullScreenFunc) {
      browserFullScreenRequests.forEach((request) => {
        requestFullScreenFunc = requestFullScreenFunc || elmt[request];
      });
    }
    if (typeof requestFullScreenFunc !== 'undefined') {
      requestFullScreenFunc.call(elmt);
    }
    setTimeout(() => hashHistory.push('/full_screen'), 100);
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

  togglePresetModal () {
    this.setState({ presetModal: !this.state.presetModal, loginModal: false });
  }
  toggleSharePresetModal () {
    this.setState({ sharePresetModal: !this.state.sharePresetModal, loginModal: false });
  }

  sharePreset () {
    this.setState({ loginModal: false });
    const presetName = uuidV4();
    const dataToSend = this.makePresetObj(presetName, true, true, true, '');
    SaveURLPreset(presetName, dataToSend, (message) => {
      if (message.status === 'ok') {
        this.setState({
          sharePresetModal: true,
          sharePresetName: location.protocol + '//' + location.host + location.pathname + '?presetid=' + presetName + location.hash
        });
      } else {
        alert('failed');
      }
    });
  }

  makePresetObj (presetName, saveLayers, savePanelLayout, saveBoundingBox, role) {
    let numPanels;
    if (/quad/.test(this.props.layout)) {
      numPanels = 4;
    } else if (/triple/.test(this.props.layout)) {
      numPanels = 3;
    } else if (/dual/.test(this.props.layout)) {
      numPanels = 2;
    } else {
      numPanels = 1;
    }

    const displayObj = {
      type: this.props.layout,
      npanels: numPanels
    };
    const bbox = {
      top: this.props.bbox[3],
      bottom: this.props.bbox[1],
      crs: this.props.projectionName
    };
    let layerConfig = [];
    this.props.layers.panels.forEach((panel, i) => {
      if (i >= numPanels) {
        return;
      }
      let panelArr = [];
      panel.layers.forEach((layer) => {
        panelArr.push({
          active: true,
          dimensions: {},
          service: layer.service,
          name: layer.name,
          opacity: layer.opacity,
          overlay: false
        });
      });
      panel.overlays.forEach((layer) => {
        panelArr.push({
          active: true,
          dimensions: {},
          service: layer.service,
          name: layer.name,
          opacity: 1,
          overlay: true
        });
      });
      layerConfig.push(panelArr);
    });

    const dataToSend = {
      area: saveBoundingBox ? bbox : null,
      display: savePanelLayout ? displayObj : null,
      layers: saveLayers ? layerConfig : null,
      name: presetName,
      keywords: []
    };
    return dataToSend;
  }

  savePreset () {
    const presetName = document.getElementById('presetname').value;
    const saveLayers = document.getElementsByName('layerCheckbox')[0].checked;
    const savePanelLayout = document.getElementsByName('panelCheckbox')[0].checked;
    const saveBoundingBox = document.getElementsByName('viewCheckbox')[0].checked;
    const role = document.getElementsByName('roleSelect');
    const dataToSend = this.makePresetObj(presetName, saveLayers, savePanelLayout, saveBoundingBox, role);

    let url = BACKEND_SERVER_URL + '/preset/';
    let params = {
      name: presetName
    };
    if (role.length === 0) {
      url += 'putuserpreset';
    } else {
      const selectedRole = role[0].options[role[0].selectedIndex].value;
      if (selectedRole === 'system') {
        url += 'putsystempreset';
      } else if (selectedRole === 'user') {
        url += 'putuserpreset';
      } else {
        url += 'putsrolespreset';
        params['roles'] = selectedRole;
      }
    }

    axios({
      method: 'post',
      url: url,
      params: params,
      withCredentials: true,
      data: dataToSend
    });
    this.togglePresetModal();
  }
  returnInputRef (ref) {
    this.input = ref;
  }

  renderSharePresetModal (sharePresetModelOpen, toggleSharePresetModal, sharePresetName) {
    return (<Modal isOpen={sharePresetModelOpen} toggle={toggleSharePresetModal}>
      <ModalHeader toggle={toggleSharePresetModal}> Share preset URL</ModalHeader>
      <ModalBody >
        <CopyToClipboard text={sharePresetName} onCopy={toggleSharePresetModal}>
          <Button color='primary'>
            <Icon className='icon' name='share-alt' />
           Copy link to Clipboard
          </Button>
        </CopyToClipboard><br /><hr />
        <p>The link URL is:</p>
        <a target='_blank' href={sharePresetName}>{sharePresetName}</a><br />
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={toggleSharePresetModal}>Cancel</Button>
      </ModalFooter>
    </Modal>);
  };

  renderPresetModal (presetModalOpen, togglePresetModal, hasRoleADMIN) {
    return (<Modal isOpen={presetModalOpen} toggle={togglePresetModal}>
      <ModalHeader toggle={togglePresetModal}>Save preset</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <InputGroup>
              <Input id='presetname' placeholder='Preset name' />
              <InputGroupButton><Button color='primary' onClick={this.savePreset}><Icon className='icon' name='cloud' />Save</Button></InputGroupButton>
            </InputGroup>
          </FormGroup>
          <FormGroup tag='fieldset' row>
            <Row>
              <Col xs='6'>
                <FormGroup check>
                  <Label check>
                    <Input type='checkbox' name='layerCheckbox' />{' '}
                    Layers
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input type='checkbox' name='panelCheckbox' />{' '}
                    Panel setting
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input type='checkbox' name='viewCheckbox' />{' '}
                    View
                  </Label>
                </FormGroup>
              </Col>
              {hasRoleADMIN
               ? <Col xs='6'>
                 <FormGroup>
                   <Label for='roleSelect'>Save for</Label>
                   <Input type='select' name='roleSelect' id='roleSelect'>
                     <option value='user' >Me</option>
                     <option value='MET'>Role Meteorologist</option>
                     <option value='system'>System wide</option>
                   </Input>
                 </FormGroup>
               </Col>
               : ''}
            </Row>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color='primary' onClick={this.savePreset}>
          <Icon className='icon' name='cloud' />
         Save
        </Button>
        <Button color='secondary' onClick={togglePresetModal}>Cancel</Button>
      </ModalFooter>
    </Modal>);
  }
  renderLoginModal (loginModalOpen, loginModalMessage, toggleLoginModal, handleOnChange, handleKeyPressPassword) {
    return (<Modal isOpen={loginModalOpen} toggle={toggleLoginModal}>
      <ModalHeader toggle={toggleLoginModal}>Sign in</ModalHeader>
      <ModalBody>
        <Collapse isOpen>
          <InputGroup>
            <input ref={(input) => { this.userNameInputRef = input; }} className='form-control' tabIndex={0} placeholder='username' name='username' onChange={this.handleOnChange} />
            <Input type='password' name='password' id='examplePassword' placeholder='password'
              onKeyPress={handleKeyPressPassword} onChange={handleOnChange} />
          </InputGroup>
        </Collapse>
        <FormText color='muted'>
          {loginModalMessage}
        </FormText>
      </ModalBody>
      <ModalFooter>
        <Button color='primary' onClick={this.doLogin} className='signInOut'>
          <Icon className='icon' name='sign-in' />
         Sign in
        </Button>
        <Button color='secondary' onClick={this.toggleLoginModal}>Cancel</Button>
      </ModalFooter>
    </Modal>);
  }
  renderLoggedInPopover (loginModal, toggle, userName) {
    return (
      <Popover placement='bottom' isOpen={loginModal} target='loginIcon' toggle={toggle}>
        <PopoverTitle>Hi {userName}</PopoverTitle>
        <PopoverContent>
          <ButtonGroup vertical style={{ padding: '0.5rem' }}>
            <Button onClick={this.togglePresetModal} >
              <Icon className='icon' name='floppy-o' />
              Save preset
            </Button>
            <Button onClick={this.sharePreset} >
              <Icon className='icon' name='share-alt' />
              Share preset
            </Button>
            <Button onClick={this.doLogout} className='signInOut'>
              <Icon className='icon' name='sign-out' />
             Sign out
            </Button>
          </ButtonGroup>
        </PopoverContent>
      </Popover>

    );
  }
  render () {
    const { user, routes } = this.props;
    const { isLoggedIn, username } = user;
    const hasRoleADMIN = CheckIfUserHasRole(user.roles, UserRoles.ADMIN);
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
            <span className='navbar-text mx-auto'>{this.state.currentTime} UTC</span>
          </Col>
          <Col xs='auto'>
            <Nav>
              <NavLink className='active' onClick={this.toggleLoginModal} ><Icon name='user' id='loginIcon' />{isLoggedIn ? ' ' + username : ' Sign in'}</NavLink>
              {hasRoleADMIN ? <Link to='manage/app' className='active nav-link'><Icon name='cog' /></Link> : '' }
              <LayoutDropDown dispatch={this.props.dispatch} mapActions={this.props.mapActions} />
              <NavLink className='active' onClick={this.toggleFullscreen} ><Icon name='expand' /></NavLink>
              {isLoggedIn
                ? this.renderLoggedInPopover(this.state.loginModal, this.toggleLoginModal, username)
                : this.renderLoginModal(this.state.loginModal,
                  this.state.loginModalMessage, this.toggleLoginModal, this.handleOnChange, this.handleKeyPressPassword)
              }
              {this.renderPresetModal(this.state.presetModal, this.togglePresetModal, hasRoleADMIN)}
              {this.renderSharePresetModal(this.state.sharePresetModal, this.toggleSharePresetModal, this.state.sharePresetName)}
            </Nav>
          </Col>
        </Row>
      </Navbar>

    );
  }
}

class LayoutDropDown extends Component {
  constructor () {
    super();
    this.postLayout = this.postLayout.bind(this);
    this.state = {
      popoverOpen: false
    };
  }
  postLayout (layout) {
    this.props.dispatch(this.props.mapActions.setLayout(layout));
    this.setState({ popoverOpen: false });
  }
  render () {
    return <NavLink className='active' onClick={() => this.setState({ popoverOpen: !this.state.popoverOpen })} >
      <Icon id='layoutbutton' name='desktop' />
      <Popover isOpen={this.state.popoverOpen} target='layoutbutton'>
        <PopoverContent>
          <ButtonGroup vertical>
            <Button onClick={() => this.postLayout('single')}>Single</Button>
            <Button onClick={() => this.postLayout('dual')}>Dual column</Button>
            <Button onClick={() => this.postLayout('quaduneven')}>Uneven quad</Button>
            <Button onClick={() => this.postLayout('tripleuneven')}>Uneven triple</Button>
            <Button onClick={() => this.postLayout('quadcol')}>Four columns</Button>
            <Button onClick={() => this.postLayout('quad')}>Square</Button>
          </ButtonGroup>

        </PopoverContent>
      </Popover>
    </NavLink>;
  }
}

LayoutDropDown.propTypes = {
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};

TitleBarContainer.propTypes = {
  adagucProperties: PropTypes.object,
  recentTriggers: PropTypes.array,
  notifications: PropTypes.array,
  isLoggedIn: PropTypes.bool,
  loginModal: PropTypes.bool,
  userName: PropTypes.string,
  roles: PropTypes.array,
  routes: PropTypes.array,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
  layout: PropTypes.string,
  layers: PropTypes.object,
  bbox: PropTypes.array,
  projectionName: PropTypes.string
};

TitleBarContainer.defaultProps = {
  isLoggedIn: false,
  loginModal: false,
  userName: '',
  roles: []
};

export default TitleBarContainer;
