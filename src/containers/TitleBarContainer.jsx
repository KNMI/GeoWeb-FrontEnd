import React, { PureComponent } from 'react';
import { Icon } from 'react-fa';
import GeoWebLogo from '../components/assets/icon.svg';
import { CheckIfUserHasRole } from '../utils/user';
import { SaveURLPreset } from '../utils/URLPresets';
import { UserRoles } from '../constants/userroles';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
import { PROJECTIONS } from '../constants/projections';
import CopyToClipboard from 'react-copy-to-clipboard';
import axios from 'axios';
import uuidV4 from 'uuid/v4';
import {
  Alert, Navbar, NavbarBrand, Row, Col, Nav, NavLink,
  Breadcrumb, BreadcrumbItem, Label, ListGroup, ListGroupItem,
  ButtonGroup, InputGroupAddon, Modal, ModalHeader, ModalBody, ModalFooter, Button, InputGroup, Input, FormText
} from 'reactstrap';
import { AvForm, AvRadioGroup, AvRadio, AvField, AvGroup } from 'availity-reactstrap-validation';
import { Link, hashHistory } from 'react-router';
import PropTypes from 'prop-types';
import moment from 'moment';
import cloneDeep from 'lodash.clonedeep';
import { Typeahead } from 'react-bootstrap-typeahead';
import { GetServices } from '../utils/getServiceByName';
import { version } from '../../package.json';
import { WMJSGetServiceFromStore, WMJSLayer } from 'adaguc-webmapjs';
import { generateLayerId } from '../utils/ReactWMJSTools';
import produce from 'immer';

const timeFormat = 'ddd DD MMM YYYY HH:mm [UTC]';
const browserFullScreenRequests = [
  'mozRequestFullScreen',
  'msRequestFullscreen',
  'webkitRequestFullScreen'
];
const getOauth2LoginModal = (titleBarContiainer, loginModalOpen, loginModalMessage, toggleLoginModal, handleOnChange, handleKeyPressPassword) => {
  const { urls } = titleBarContiainer.props;
  if (loginModalOpen) {
    if (window && window.location) {
      window.location = urls.BACKEND_SERVER_URL + '/login';
    }
  }
  return null;
};

class TitleBarContainer extends PureComponent {
  constructor (props) {
    super(props);
    this.updateTime = this.updateTime.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
    this.savePreset = this.savePreset.bind(this);
    this.makePresetObj = this.makePresetObj.bind(this);
    this.sendFeedback = this.sendFeedback.bind(this);
    this.fetchPresets = this.fetchPresets.bind(this);
    this.toggleLoginModal = this.toggleLoginModal.bind(this);
    this.toggleFeedbackModal = this.toggleFeedbackModal.bind(this);
    this.toggleSharePresetModal = this.toggleSharePresetModal.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleOnFocus = this.handleOnFocus.bind(this);
    this.handleKeyPressPassword = this.handleKeyPressPassword.bind(this);
    this.checkCredentials = this.checkCredentials.bind(this);
    this.setLoggedOutCallback = this.setLoggedOutCallback.bind(this);
    this.checkCredentialsBadCallback = this.checkCredentialsBadCallback.bind(this);
    this.getServices = this.getServices.bind(this);
    this.fetchVersionInfo = this.fetchVersionInfo.bind(this);
    this.renderLoginModal = this.renderLoginModal.bind(this);
    this.checkSignInMethod = this.checkSignInMethod.bind(this);
    this.render = this.render.bind(this);
    this.inputfieldUserName = '';
    this.inputfieldPassword = '';
    this.timer = -1;
    this.inputRefs = {};
    this.state = {
      currentTime: this.props.currentTime || moment().utc().format(timeFormat).toString(),
      loginModal: this.props.loginModal,
      loginModalMessage: '',
      feedbackModalOpen: false,
      sharePresetModal: false,
      sharePresetName: '',
      fieldToFocus: null,
      versionInfo: {
        backend: '...',
        frontend: version
      },
      signInMethod: 'generic'
    };
  }
  getServices () {
    const { urls, dispatch, adagucActions } = this.props;
    GetServices(urls.BACKEND_SERVER_URL, urls.BACKEND_SERVER_XML2JSON).then((sources) => {
      dispatch(adagucActions.setSources(sources));
    });
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

  /* Updates the current time in the state */
  updateTime () {
    const time = moment().utc().format(timeFormat).toString();
    this.setState({ currentTime: time });
  }

  componentWillUnmount () {
    clearInterval(this.timer);
  }

  /**
   * This will check if the backend is running in traditional generic mode, or in keycloak/cognito OAuth2 mode.
   */
  checkSignInMethod () {
    const { urls } = this.props;
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: urls.BACKEND_SERVER_URL + '/login/options',
        withCredentials: true,
        responseType: 'json'
      }).then(src => {
        if (src.data.type && src.data.type === 'oauth2') {
          resolve('oauth2');
        } else {
          resolve('generic');
        }
      }).catch((e) => {
        resolve('generic');
      });
    });
  }

  componentDidMount () {
    this.timer = setInterval(() => {
      this.updateTime();
      this.checkCredentials();
    }, 15000);
    this.setState({ currentTime: this.props.currentTime || moment().utc().format(timeFormat).toString() });
    this.checkSignInMethod().then((signInMethod) => {
      this.setState({ signInMethod: signInMethod }, () => {
        this.checkCredentials();
      });
    });
    this.fieldToFocus = 'username';
    this.fetchVersionInfo();
  }

  componentDidUpdate () {
    if (this.inputRefs && this.state.loginModal === true && this.fieldToFocus && this.inputRefs[this.fieldToFocus] && this.focussedField !== this.fieldToFocus) {
      if (this.inputRefs[this.fieldToFocus].focus) {
        this.inputRefs[this.fieldToFocus].focus();
        this.focussedField = this.fieldToFocus;
      }
    }
  }

  doLogin () {
    const { user, urls } = this.props;
    const { isLoggedIn } = user;
    if (!isLoggedIn) {
      axios({
        method: 'get',
        url: urls.BACKEND_SERVER_URL + '/login?username=' + this.inputfieldUserName + '&password=' + this.inputfieldPassword,
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
    const { urls } = this.props;
    // if (this.state.signInMethod === 'oauth2') {
    //   window.location = urls.BACKEND_SERVER_URL + '/logout';
    //   return;
    // }
    console.log('Loggingout');
    this.toggleLoginModal();
    const url = urls.BACKEND_SERVER_URL + '/logout' + (this.state.signInMethod === 'oauth2' ? '/geoweb' : '');
    axios({
      method: 'get',
      url: url,
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      this.setLoggedOutCallback('Signed out');
      hashHistory.push('/');
    }).catch(error => {
      if (error.response && error.response.data) {
        this.setLoggedOutCallback(error.response.data.message);
      } else {
        this.setLoggedOutCallback('Signed out');
        hashHistory.push('/');
      }
    });
  }

  checkCredentials (callback) {
    const { dispatch } = this.props;
    const { urls } = this.props;

    try {
      this.setState({
        loginModalMessage: 'Checking...'
      });
    } catch (e) {
      console.error(e);
    }

    if (this.state.signInMethod === null || this.state.signInMethod === 'generic') {
      console.error(new Error('No authentication method found in /login/options'));
      this.setState({
        loginModalMessage: 'No authentication method found in /login/options'
      });
      this.getServices();
      return;
    }

    if (this.state.signInMethod === 'oauth2') {
      axios({
        method: 'get',
        url: urls.BACKEND_SERVER_URL + '/status',
        withCredentials: true,
        responseType: 'json'
      }).then(src => {
        if (src.data.userName && src.data.privileges) {
          this.setState({
            loginModal: false,
            loginModalMessage: 'Signed in as user ' + src.data.userName
          }, () => {
            dispatch(this.props.userActions.login({ username: src.data.userName, roles: src.data.privileges }));
            this.getServices();
          });
        } else {
          this.checkCredentialsBadCallback(new Error('Unable to get /status from backend'));
        }
        if (callback) callback();
      }).catch(error => {
        this.checkCredentialsBadCallback(error);
      });
    }
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
      loginModalMessage: ''
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

  handleOnFocus (event) {
    if (event && event.target && event.target.name) {
      this.setState({ fieldToFocus: event.target.name });
    } else {
      this.setState({ fieldToFocus: null });
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

  toggleFeedbackModal () {
    this.setState({ presetModal: false, loginModal: false, feedbackModalOpen: !this.state.feedbackModalOpen });
  }
  toggleSharePresetModal () {
    this.setState({ sharePresetModal: !this.state.sharePresetModal, loginModal: false, feedbackModalOpen: false, popoverOpen: false });
  }

  returnInputRef (ref) {
    this.input = ref;
  }

  renderLoginModal (loginModalOpen, loginModalMessage, toggleLoginModal, handleOnChange, handleKeyPressPassword) {
    const { urls, user } = this.props;
    const { isLoggedIn, username } = user;

    if (isLoggedIn) {
      return (<Modal isOpen={loginModalOpen} toggle={toggleLoginModal}>
        <ModalHeader toggle={toggleLoginModal}>Hi {username}</ModalHeader>
        <ModalBody>
          <b>Version information</b>
          <ul>
            <li>Frontend: {this.state.versionInfo.frontend}</li>
            <li>Backend: {this.state.versionInfo.backend}</li>
          </ul>
          <FormText color='muted'>
            {loginModalMessage ? null : 'Backend: ' + urls.BACKEND_SERVER_URL}
          </FormText>
          <FormText color='muted'>
            {loginModalMessage}
          </FormText>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' onClick={this.doLogout} className='signInOut'>
            <Icon className='icon' name='sign-out' />
            Sign out
          </Button>
        </ModalFooter>
      </Modal>);
    } else {
      if (this.state.signInMethod === 'oauth2') {
        return getOauth2LoginModal(this, loginModalOpen, loginModalMessage, toggleLoginModal, handleOnChange, handleKeyPressPassword);
      } else {
        return null;
      }
    }
  }

  sendFeedback (e, formValues) {
    const flattenLayers = (state) => {
      const stateCpy = cloneDeep(state);
      stateCpy.panelsProperties.panels.forEach((panel) => {
        panel.baselayers.forEach((layer) => {
          Object.keys(layer).forEach((k) => {
            if (!['service', 'name'].includes(k)) {
              delete layer[k];
            }
          });
        });
        panel.layers.forEach((layer) => {
          Object.keys(layer).forEach((k) => {
            if (!['service', 'name'].includes(k)) {
              delete layer[k];
            }
          });
        });
      });
      return stateCpy;
    };
    const numLogs = myLogs.length;
    const { urls } = this.props;

    const feedbackObj = {
      state: flattenLayers(this.props.fullState),
      url: window.location.href,
      config: { version: version, backend_url: urls.BACKEND_SERVER_URL },
      userAgent: navigator.userAgent,
      descriptions: { ...formValues },
      latestLogs: myLogs.slice(Math.max(0, numLogs - 100)).reverse()
    };
    axios({
      method: 'post',
      url: urls.BACKEND_SERVER_URL + '/admin/receiveFeedback',
      data: feedbackObj
    }).then((res) => { this.setState({ feedbackModalOpen: false }); })
      .catch((error) => { console.error('Send feedback failed: ', error); });
  }

  renderFeedbackModal (feedbackModalOpen, toggle) {
    return (<Modal isOpen={feedbackModalOpen} toggle={toggle}>
      <ModalHeader>Tell us what happened</ModalHeader>
      <ModalBody>
        <AvForm onValidSubmit={this.sendFeedback}>
          <AvGroup>
            <Label for='problemSummary'>What is the problem? *</Label>
            <AvField validate={{ required: { value: true, errorMessage: 'A problem summary is required.' } }}
              type='text' name='problemSummary' placeholder="Summarize the problem, e.g. 'Progtemp is broken'." />
          </AvGroup>
          <AvGroup>
            <Label for='problemDescription'>What happened? *</Label>
            <AvField validate={{ required: { value: true, errorMessage: 'A more detailed problem description is required.' } }} type='textarea'
              name='problemDescription' placeholder='Describe what you were doing, what went wrong, and what do you think that should have happened instead.' />
          </AvGroup>
          <AvGroup>
            <Label for='role'>What are you? *</Label>
            <AvRadioGroup name='role' required>
              <Row>
                <Col>
                  <AvRadio label='Meteorologist' value='Meteorologist' id='meteoRole' />
                  <AvRadio label='Administrator' value='Administrator' id='adminRole' />
                </Col><Col>
                  <AvRadio label='Process operator' value='Process operator' id='operatorRole' />
                  <AvRadio label='Researcher' value='Researcher' id='researchRole' />
                </Col>
              </Row>
            </AvRadioGroup>
          </AvGroup>
          <AvGroup>
            <Label for='feedbackName'>Who are you? (optional)
              <br />
              <Alert style={{ 'color': '#818182', 'padding': 0, 'marginBottom': 0 }} color='light'>
                Someone from GeoWeb might contact you to help us solve the issue.
              </Alert>
            </Label>
            <AvField type='text' name='feedbackName' placeholder='Your name' />
          </AvGroup>
          <Row style={{ width: '100%' }}>
            <Col />
            <Col xs='auto' style={{ marginRight: '0.4rem' }}>
              <Button color='primary' className='signInOut'>
                <Icon className='icon' name='paper-plane' />
                Send to developers
              </Button>
            </Col>
            <Col xs='auto'>
              <Button color='secondary' onClick={toggle}>Cancel</Button>
            </Col>
          </Row>
        </AvForm>
      </ModalBody>
      <ModalFooter style={{ flexDirection: 'column' }}>
        <Row style={{ width: '100%' }}>
          <Alert style={{ 'color': '#818182', 'padding': 0 }} color='light'>
            Technical diagnostics will be sent with your error report to help us debug the problem. An asterisk (*) indicates a required field.
          </Alert>
        </Row>
      </ModalFooter>
    </Modal>);
  }
  fetchVersionInfo () {
    axios.get(this.props.urls.BACKEND_SERVER_URL + '/versioninfo/version', { withCredentials: true }).then((res) => {
      this.setState({ versionInfo: {
        ...this.state.versionInfo,
        backend: res.data.backend
      } });
    }).catch((error) => {
      console.error(error);
    });
  }
  fetchPresets () {
    axios.get(this.props.urls.BACKEND_SERVER_URL + '/preset/getpresets', { withCredentials: true }).then((res) => {
      this.setState({ presets: res.data });
    }).catch((error) => {
      console.error(error);
    });
  }
  componentWillUpdate (nextprops) {
    if (!this.state.presets || this.props.user.username !== nextprops.user.username) {
      this.fetchPresets();
    }
  }

  makePresetObj (presetName, saveLayers, savePanelLayout, saveBoundingBox, role) {
    const { panelsProperties } = this.props;
    const { panelLayout } = panelsProperties;
    let numPanels;
    if (/quad/.test(panelLayout)) {
      numPanels = 4;
    } else if (/triple/.test(panelLayout)) {
      numPanels = 3;
    } else if (/dual/.test(panelLayout)) {
      numPanels = 2;
    } else {
      numPanels = 1;
    }

    const displayObj = {
      type: panelLayout,
      npanels: numPanels
    };
    const bbox = {
      left: this.props.mapProperties.boundingBox.bbox[0],
      bottom: this.props.mapProperties.boundingBox.bbox[1],
      right: this.props.mapProperties.boundingBox.bbox[2],
      top: this.props.mapProperties.boundingBox.bbox[3],
      crs: this.props.mapProperties.projection.code
    };
    let layerConfig = [];
    this.props.panelsProperties.panels.forEach((panel, i) => {
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
      panel.baselayers.filter((layer) => (layer.keepOnTop === true)).forEach((layer) => {
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

  savePreset (presetName) {
    // Save all by default now
    const saveLayers = true; // document.getElementsByName('layerCheckbox')[0].checked;
    const savePanelLayout = true; // document.getElementsByName('panelCheckbox')[0].checked;
    const saveBoundingBox = true; // document.getElementsByName('viewCheckbox')[0].checked;
    const role = document.getElementsByName('roleSelect');
    const dataToSend = this.makePresetObj(presetName, saveLayers, savePanelLayout, saveBoundingBox, role);
    let url = this.props.urls.BACKEND_SERVER_URL + '/preset/';
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
        url += 'putrolespreset';
        params['roles'] = selectedRole;
      }
    }

    return axios({
      method: 'post',
      url: url,
      params: params,
      withCredentials: true,
      data: dataToSend
    });
    // this.togglePresetModal();
  }

  render () {
    const { user, routes } = this.props;
    const { isLoggedIn, username } = user;
    const hasRoleADMIN = CheckIfUserHasRole(user.roles, UserRoles.ADMIN);
    let cumulativePath = '';
    return (
      <Navbar className='test navbar-inverse'>
        <Row className='no-gutters'>
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
            <span className='navbar-text mx-auto'>{this.state.currentTime}</span>
          </Col>
          <Col xs='auto'>
            <Nav>
              {
                this.state.signInMethod === null &&
                (<NavLink className='active'><Icon name='user' id='loginIcon' />{isLoggedIn ? ' ' + username : ' ...'}</NavLink>)
              }
              {
                this.state.signInMethod &&
                (<NavLink className='active' onClick={this.toggleLoginModal} ><Icon name='user' id='loginIcon' />{isLoggedIn ? ' ' + username : ' Sign in'}</NavLink>)
              }
              {hasRoleADMIN ? <Link to='manage' className='active nav-link'><Icon name='cog' /></Link> : ''}
              <NavLink className='deactivated' onClick={this.toggleFeedbackModal}><Icon name='exclamation-triangle' /> Report problem</NavLink>
              <LayoutDropDown panelsProperties={this.props.panelsProperties} savePreset={this.savePreset}
                fetchNewPresets={this.fetchPresets} mapActions={this.props.mapActions} presets={this.state.presets} onChangeServices={this.getServices}
                urls={this.props.urls} panelsActions={this.props.panelsActions} mapProperties={this.props.mapProperties} dispatch={this.props.dispatch} />
              <NavLink className='active' onClick={this.toggleFullscreen} ><Icon name='expand' /></NavLink>
              { this.renderLoginModal(this.state.loginModal, this.state.loginModalMessage, this.toggleLoginModal, this.handleOnChange, this.handleKeyPressPassword) }
              {this.renderFeedbackModal(this.state.feedbackModalOpen, this.toggleFeedbackModal)}
            </Nav>
          </Col>
        </Row>
      </Navbar>

    );
  }
}

class LayoutDropDown extends PureComponent {
  constructor () {
    super();
    this.makePresetObj = this.makePresetObj.bind(this);
    this.postLayout = this.postLayout.bind(this);
    this.removeCustomSource = this.removeCustomSource.bind(this);
    this.handleAddSource = this.handleAddSource.bind(this);
    this.setBBOX = this.setBBOX.bind(this);
    this.setPreset = this.setPreset.bind(this);
    this.setProjection = this.setProjection.bind(this);
    this.sharePreset = this.sharePreset.bind(this);
    this.renderSharePresetModal = this.renderSharePresetModal.bind(this);
    this.state = {
      popoverOpen: false
    };
  }

  removeCustomSource (sourceIdx) {
    const urls = JSON.parse(localStorage.getItem('geoweb')).personal_urls;
    urls.splice(sourceIdx, 1);
    const newItem = { personal_urls: urls };
    localStorage.setItem('geoweb', JSON.stringify(newItem));
    document.getElementById('sourceurlinput').value = '';
    this.setState({ urls: urls });
    this.props.onChangeServices();
  }
  postLayout (layout) {
    this.props.dispatch(this.props.panelsActions.setPanelLayout(layout));
  }
  handleAddSource (e) {
    var url = document.querySelector('#sourceurlinput').value;
    let items = JSON.parse(localStorage.getItem('geoweb'));
    var getCap = WMJSGetServiceFromStore(url, this.props.urls.BACKEND_SERVER_XML2JSON);
    this.setState({ getCapBusy: true });
    getCap.getCapabilities((e) => {
      this.setState({ getCapBusy: false });
      const newServiceObj = {
        name: getCap.name ? getCap.name : getCap.title,
        title: getCap.title,
        service: getCap.service,
        abstract: getCap.abstract
      };
      if (!items['personal_urls']) {
        items['personal_urls'] = [newServiceObj];
      } else {
        items['personal_urls'].push(newServiceObj);
      }
      localStorage.setItem('geoweb', JSON.stringify(items));
      document.getElementById('sourceurlinput').value = '';
      this.setState({ urls: localStorage.getItem('geoweb').personal_urls });
      this.props.onChangeServices();
    }, (error) => {
      this.setState({ getCapBusy: false });
      console.error('error: ', error);
      console.warn('Source could not be added. Probably not valid WMS url.');
    });
  }

  printBBOX (bbox) {
    return bbox.map((item) => item.toFixed(2)).join(', ');
  }

  setBBOX (bbox) {
    if (bbox && bbox.length > 0) {
      this.props.dispatch(this.props.mapActions.setCut(bbox[0]));
    }
  }

  setProjection (projection) {
    if (projection && projection.length > 0) {
      this.props.dispatch(this.props.mapActions.setProjection(projection[0]));
    }
  }

  setPreset (preset) {
    const { dispatch, panelsActions, mapActions } = this.props;
    const thePreset = preset[0];
    if (!thePreset) {
      return;
    }
    if (thePreset.area) {
      if (thePreset.crs || thePreset.area.crs) {
        dispatch(mapActions.setCut({
          name: 'Custom',
          bbox: [thePreset.area.left || 570875, thePreset.area.bottom, thePreset.area.right || 570875, thePreset.area.top],
          projection: { code: thePreset.crs || thePreset.area.crs || 'EPSG:3857', name: 'Mercator' }
        }));
      } else {
        // Default to the netherlands
        dispatch(mapActions.setCut({ name: 'Custom', bbox: [thePreset.area.left || 570875, thePreset.area.bottom, thePreset.area.right || 570875, thePreset.area.top] }));
      }
    }
    if (thePreset.display) {
      dispatch(panelsActions.setPanelLayout(thePreset.display.type));
    }
    if (thePreset.layers) {
      // This is tricky because all layers need to be restored in the correct order
      // So first create all panels as null....
      const newPanels = [null, null, null, null];
      const promises = [];
      thePreset.layers.forEach((panel, panelIdx) => {
        // Then for each panel initialize it to this object where layers is an empty array with the
        // length of the layers in the panel, as it needs to be inserted in a certain order. For the baselayers
        // this is irrelevant because the order of overlays is not relevant
        newPanels[panelIdx] = { 'layers': new Array(panel.length), 'baselayers': [] };
        panel.forEach((layer, i) => {
          // Create a Promise for parsing all WMJSlayers because we can only do something when ALL layers have been parsed
          promises.push(new Promise((resolve, reject) => {
            const wmjsLayer = new WMJSLayer(layer);
            wmjsLayer.parseLayer((newLayer) => {
              newLayer.keepOnTop = (layer.overlay || layer.keepOnTop);
              const skeletonLayer = produce(newLayer, draft => {
                draft.id = generateLayerId();
              });
              return resolve({ layer: skeletonLayer, panelIdx: panelIdx, index: i });
            });
          }));
        });
      });

      // Once that happens, insert the layer in the appropriate place in the appropriate panel
      Promise.all(promises).then((layers) => {
        layers.forEach((layerDescription) => {
          const { layer, panelIdx, index } = layerDescription;
          if (layer.keepOnTop === true) {
            layer.keepOnTop = true;
            newPanels[panelIdx].baselayers.push(layer);
          } else {
            const skeletonLayer = produce(layer, draft => {
              draft.id = generateLayerId();
            });
            newPanels[panelIdx].layers[index] = skeletonLayer;
          }
        });
        // Beware: a layer can still contain null values because a layer might have been a null value
        // also, panels may have had no layers in them
        dispatch(panelsActions.setPresetLayers(newPanels));
      });
    }
  }

  sharePreset () {
    this.setState({ popoverOpen: false });
    const presetName = uuidV4();
    const dataToSend = this.makePresetObj(presetName, true, true, true, '');
    SaveURLPreset(presetName, dataToSend, `${this.props.urls.BACKEND_SERVER_URL}/preset/putsharedpreset`, (message) => {
      console.log('Message status ' + message.status);
      if (message.status === 'ok') {
        this.setState({
          sharePresetModal: true,
          sharePresetName: location.protocol + '//' + location.host + location.pathname + '?presetid=' + presetName + location.hash
        });
      } else {
        console.warn('sharePreset failed');
      }
    });
  }

  makePresetObj (presetName, saveLayers, savePanelLayout, saveBoundingBox, role) {
    const { panelsProperties } = this.props;
    const { panelLayout } = panelsProperties;
    let numPanels;
    if (/quad/.test(panelLayout)) {
      numPanels = 4;
    } else if (/triple/.test(panelLayout)) {
      numPanels = 3;
    } else if (/dual/.test(panelLayout)) {
      numPanels = 2;
    } else {
      numPanels = 1;
    }

    const displayObj = {
      type: panelLayout,
      npanels: numPanels
    };
    const bbox = {
      left: this.props.mapProperties.boundingBox.bbox[0],
      bottom: this.props.mapProperties.boundingBox.bbox[1],
      right: this.props.mapProperties.boundingBox.bbox[2],
      top: this.props.mapProperties.boundingBox.bbox[3],
      crs: this.props.mapProperties.projection.code
    };
    let layerConfig = [];
    this.props.panelsProperties.panels.forEach((panel, i) => {
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
      panel.baselayers.filter((layer) => (layer.keepOnTop === true)).forEach((layer) => {
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

  render () {
    const togglePreset = () => this.setState({ popoverOpen: !this.state.popoverOpen });
    const { panelsProperties, mapProperties } = this.props;
    const isActive = (layout) => panelsProperties && panelsProperties.panelLayout === layout;
    const stored = JSON.parse(localStorage.getItem('geoweb'));
    if (!stored) {
      localStorage.setItem('geoweb', JSON.stringify({ personal_urls: [] }));
    }
    const urls = JSON.parse(localStorage.getItem('geoweb')).personal_urls;
    return <NavLink className='active' onClick={togglePreset}>
      <Icon id='layoutbutton' name='sliders' />
      {this.renderSharePresetModal(this.state.sharePresetModal, () => { this.setState({ sharePresetModal: !this.state.sharePresetModal }); }, this.state.sharePresetName)}
      <Modal isOpen={this.state.popoverOpen} toggle={togglePreset} style={{ width: '40rem', minWidth: '40rem' }}>
        <ModalHeader>Presets</ModalHeader>
        <ModalBody id='layoutmodal'>
          <Row>
            <Col>
              <Row>
                <h5>Panel layout</h5>
              </Row>
              <Row>
                <ButtonGroup>
                  <Button id='singleLayoutButton' onClick={() => this.postLayout('single')} active={isActive('single')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/single.svg')} />
                  </Button>
                  <Button id='dualLayoutButton' onClick={() => this.postLayout('dual')} active={isActive('dual')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/dual_column.svg')} />
                  </Button>
                  <Button id='tripleColumnLayoutButton' onClick={() => this.postLayout('triplecolumn')} active={isActive('triplecolumn')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/three_columns.svg')} />
                  </Button>
                  <Button id='tripleUnevenLayoutButton' onClick={() => this.postLayout('tripleuneven')} active={isActive('tripleuneven')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/uneven_triple.svg')} />
                  </Button>
                  <Button id='quadUnevenLayoutButton' onClick={() => this.postLayout('quaduneven')} active={isActive('quaduneven')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/uneven_quad.svg')} />
                  </Button>
                  <Button id='quadColLayoutButton' onClick={() => this.postLayout('quadcol')} active={isActive('quadcol')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/four_columns.svg')} />
                  </Button>
                  <Button id='quadLayoutButton' onClick={() => this.postLayout('quad')} active={isActive('quad')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/square.svg')} />
                  </Button>
                </ButtonGroup>
              </Row>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col>
              <Row>
                <h5>Layers</h5>
              </Row>
              <Row>
                <InputGroup>
                  <Input id='sourceurlinput' ref={ref => { this._urlinput = ref; }} placeholder='Add your own source' disabled={this.state.getCapBusy} />
                  <InputGroupAddon addonType='append'>
                    <Button color='primary' onClick={this.handleAddSource} disabled={this.state.getCapBusy}>Add</Button>
                  </InputGroupAddon>
                </InputGroup>
                <ListGroup>
                  {
                    urls.length === 0
                      ? <h6 style={{ fontStyle: 'italic', marginTop: '1rem' }}>You currently have not added custom sources</h6>
                      : <div style={{ marginTop: '1rem' }}>
                        <h6 style={{ fontStyle: 'italic' }}>Current sources</h6>
                        {urls.map((source, i) => <ListGroupItem key={i}>
                          <Icon onClick={() => this.removeCustomSource(i)} name='times' style={{ paddingLeft: 0, paddingRight: '1rem' }} />{source.name}
                        </ListGroupItem>)}
                      </div>
                  }
                </ListGroup>
              </Row>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col>
              <Row>
                <h5>Location & zoom level</h5>
              </Row>
              <Row>
                {mapProperties.boundingBox.title
                  ? <Col xs='6'>
                    <h6 style={{ lineHeight: '20px', padding: '0.5rem 0.75rem 0.5rem 0', margin: 0 }}>Current Location: {mapProperties.boundingBox.title}</h6>
                  </Col>
                  : <Col xs='auto' />}
                <Col xs='auto'>
                  <Typeahead onChange={(bbox) => this.setBBOX(bbox)} options={BOUNDING_BOXES} labelKey='title' placeholder={'Choose a new bounding box'} />
                </Col>
                <Col />
              </Row>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col>
              <Row>
                <h5>Projection</h5>
              </Row>
              <Row>
                <Col xs='6'>
                  <h6 style={{ lineHeight: '20px', padding: '0.5rem 0.75rem 0.5rem 0', margin: 0 }}>Current Projection: {mapProperties.projection.name}</h6>
                </Col>
                <Col xs='auto'>
                  <Typeahead onChange={(projection) => this.setProjection(projection)} labelKey={'title'} filterBy={['title', 'code']} options={PROJECTIONS} placeholder={'Choose a new projection'} />
                </Col>
                <Col />
              </Row>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col xs='4' style={{ paddingLeft: 0, marginRight: '0rem', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
              <Row>
                <h5>Load preset</h5>
              </Row>
              {this.props.presets
                ? <Row style={{ marginTop: '0.5rem' }}>
                  <Typeahead align='justify' filterBy={['name', 'keywords']} labelKey='name' options={this.props.presets} placeholder={'Type the preset name'} onChange={(ph) => this.setPreset(ph)} />
                </Row>
                : null
              }
            </Col>
            <Col xs='8' style={{ paddingLeft: '1rem' }}>
              <Row>
                <h5>Save preset</h5>
              </Row>
              <Row style={{ marginTop: '0.5rem' }}>
                <InputGroup>
                  <input className='form-control' ref={(ref) => { this.presetNameInput = ref; }} placeholder='Preset name' />
                  <InputGroupAddon addonType='append'>
                    <Button style={{ minWidth: '9.25rem' }} onClick={() => {
                      this.props.savePreset(this.presetNameInput.value)
                        .then(() => { this.presetNameInput.value = 'Saved preset'; this.props.fetchNewPresets(); })
                        .catch(() => { this.presetNameInput.value = 'Error saving preset'; });
                    }} color='primary'><Icon name='star' /> Save preset</Button>
                  </InputGroupAddon>
                </InputGroup>
              </Row>
            </Col>

          </Row>
          <Row style={{ marginTop: '0.5rem' }}>
            <Col />
            <Col xs='auto'>
              <Button onClick={this.sharePreset} color='primary'><Icon name='share-alt' /> Share preset</Button>
            </Col>

          </Row>
        </ModalBody>
        <ModalFooter>
          <Button onClick={togglePreset} color='secondary'>Exit</Button>
        </ModalFooter>
      </Modal>
    </NavLink>;
  }
}

LayoutDropDown.propTypes = {
  dispatch: PropTypes.func.isRequired,
  mapActions: PropTypes.object,
  mapProperties: PropTypes.object,
  onChangeServices: PropTypes.func,
  savePreset: PropTypes.func,
  fetchNewPresets: PropTypes.func,
  presets: PropTypes.array,
  panelsActions: PropTypes.object,
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string,
    BACKEND_SERVER_XML2JSON: PropTypes.string
  }),
  panelsProperties: PropTypes.shape({
    panels: PropTypes.array
  })
};

TitleBarContainer.propTypes = {
  loginModal: PropTypes.bool,
  routes: PropTypes.array,
  dispatch: PropTypes.func,
  panelsProperties: PropTypes.object,
  user: PropTypes.object,
  userActions: PropTypes.object,
  mapProperties: PropTypes.object,
  mapActions: PropTypes.object,
  panelsActions: PropTypes.object,
  adagucActions: PropTypes.object,
  bbox: PropTypes.array,
  fullState: PropTypes.object,
  urls: PropTypes.object,
  currentTime: PropTypes.string
};

TitleBarContainer.defaultProps = {
  isLoggedIn: false,
  loginModal: false,
  userName: '',
  roles: []
};

export default TitleBarContainer;
