import React, { PureComponent } from 'react';
import { Icon } from 'react-fa';
import GeoWebLogo from '../components/assets/icon.svg';
import { CheckIfUserHasRole } from '../utils/user';
import { SaveURLPreset } from '../utils/URLPresets';
import PromiseWithTimout from '../utils/PromiseWithTimout';
import { UserRoles } from '../constants/userroles';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
import { PROJECTIONS } from '../constants/projections';
import CopyToClipboard from 'react-copy-to-clipboard';
import axios from 'axios';
import uuidV4 from 'uuid/v4';
import { Alert, Navbar, NavbarBrand, Row, Col, Nav, NavLink, Breadcrumb, BreadcrumbItem, Collapse, Popover, Form, FormGroup, FormFeedback, Label, ListGroup, ListGroupItem, PopoverContent,
  PopoverTitle, ButtonGroup, InputGroupButton, Modal, ModalHeader, ModalBody, ModalFooter, Button, InputGroup, Input, FormText } from 'reactstrap';
import { AvForm, AvFeedback, AvField, AvGroup } from 'availity-reactstrap-validation';
import { Link, hashHistory } from 'react-router';
import PropTypes from 'prop-types';
import moment from 'moment';
import { addNotification } from 'reapop';
import { Typeahead } from 'react-bootstrap-typeahead';

const timeFormat = 'YYYY MMM DD - HH:mm';
const browserFullScreenRequests = [
  'mozRequestFullScreen',
  'msRequestFullscreen',
  'webkitRequestFullScreen'
];

class TitleBarContainer extends PureComponent {
  constructor (props) {
    super(props);
    this.setTime = this.setTime.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
    this.sendFeedback = this.sendFeedback.bind(this);
    this.triggerService = this.triggerService.bind(this);
    this.retrieveTriggers = this.retrieveTriggers.bind(this);
    this.gotTriggersCallback = this.gotTriggersCallback.bind(this);
    this.errorTriggersCallback = this.errorTriggersCallback.bind(this);
    this.toggleLoginModal = this.toggleLoginModal.bind(this);
    this.togglePresetModal = this.togglePresetModal.bind(this);
    this.toggleFeedbackModal = this.toggleFeedbackModal.bind(this);
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
      feedbackModalOpen: false,
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
    const { urls } = this.props;
    axios({
      method: 'get',
      url: urls.BACKEND_SERVER_URL + '/triggers/gettriggers?startdate=' + moment().subtract(1, 'hours').utc().format() + '&duration=3600',
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
    const { urls } = this.props;
    const { dispatch, mapActions, adagucActions } = this.props;
    const defaultURLs = ['getServices', 'getOverlayServices'].map((url) => urls.BACKEND_SERVER_URL + '/' + url);
    const allURLs = [...defaultURLs];
    let personalUrls = {};
    if (localStorage) {
      personalUrls = JSON.parse(localStorage.getItem('geoweb')).personal_urls;
    }

    // Ensures Promise.all works even when some promises don't resolve
    const reflect = (promise) => {
      return promise.then(
        (v) => { return { 'data':v, 'status': 'resolved' }; },
        (e) => { return { 'error':e, 'status': 'rejected' }; }
      );
    };
    axios.all(allURLs.map((req) => axios.get(req, { withCredentials: true }))).then(
      axios.spread((services, overlays) => {
        const sort = (obj) => Object.keys(obj).sort().reduce((acc, c) => { acc[c] = obj[c]; return acc; }, {});
        dispatch(mapActions.createMap());
        const allSources = [...services.data, ...personalUrls, overlays.data[0]];
        const disabledSources = {};
        allSources.map((source) => {
          disabledSources[source.name] = {};
        });
        dispatch(adagucActions.setSources(sort(disabledSources)));
        const promises = [];
        for (var i = allSources.length - 1; i >= 0; i--) {
          const source = allSources[i];
          var r = new Promise((resolve, reject) => {
            if (!source) {
              reject(new Error('Source is not working'));
            }
            if (!source.name) {
              reject(new Error('Source has no name'));
            }
            // eslint-disable-next-line no-undef
            const service = WMJSgetServiceFromStore(source.service);
            if (!service) {
              resolve(new Error('Cannot get service from store'));
            }
            service.getLayerObjectsFlat((layers) => { resolve({ layers, source }); });
          });
          promises.push(new PromiseWithTimout(r, moment.duration(3000, 'milliseconds').asMilliseconds()));
        }

        Promise.all(promises.map(reflect)).then((res) => {
          const sourcesDic = {};
          res.map((promise) => {
            if (promise.status === 'resolved') {
              const { layers, source } = promise.data;
              sourcesDic[source.name] = { layers, source };
            } else {
              console.error(promise);
            }
          });
          dispatch(adagucActions.setSources(sort(sourcesDic)));
        });
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
    this.toggleLoginModal();
    axios({
      method: 'get',
      url: urls.BACKEND_SERVER_URL + '/logout',
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
    const { urls } = this.props;

    try {
      this.setState({
        loginModalMessage: 'Checking...'
      });
    } catch (e) {
      console.error(e);
    }
    axios({
      method: 'get',
      url: urls.BACKEND_SERVER_URL + '/getuser',
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
    this.setState({ presetModal: !this.state.presetModal, loginModal: false, feedbackModalOpen: false });
  }
  toggleFeedbackModal () {
    this.setState({ presetModal: false, loginModal: false, feedbackModalOpen: !this.state.feedbackModalOpen });
  }
  toggleSharePresetModal () {
    this.setState({ sharePresetModal: !this.state.sharePresetModal, loginModal: false, feedbackModalOpen: false });
  }

  sharePreset () {
    this.setState({ loginModal: false });
    const presetName = uuidV4();
    const dataToSend = this.makePresetObj(presetName, true, true, true, '');
    SaveURLPreset(presetName, dataToSend, `${this.props.urls.BACKEND_SERVER_URL}/store/create`, (message) => {
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
    const { mapProperties } = this.props;
    const { layout } = mapProperties;
    let numPanels;
    if (/quad/.test(layout)) {
      numPanels = 4;
    } else if (/triple/.test(layout)) {
      numPanels = 3;
    } else if (/dual/.test(layout)) {
      numPanels = 2;
    } else {
      numPanels = 1;
    }

    const displayObj = {
      type: layout,
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
        url += 'putsrolespreset';
        params['roles'] = selectedRole;
      }
    }
    // console.log(dataToSend, url);
    return axios({
      method: 'post',
      url: url,
      params: params,
      withCredentials: true,
      data: dataToSend
    });
    // this.togglePresetModal();
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

  sendFeedback () {
    const numLogs = myLogs.length;
    const { urls } = this.props;

    const feedbackObj = {
      state: this.props.fullState,
      url: window.location.href,
      config: { ...require('config'), backend_url: urls.BACKEND_SERVER_URL },
      userAgent: navigator.userAgent,
      descriptions: {
        short: this.state.shortDescription,
        long: this.state.longDescription,
        name: this.state.feedbackSender
      },
      latestLogs: myLogs.slice(Math.max(0, numLogs - 100)).reverse()
    };
    axios({
      method: 'post',
      url: urls.WEBSERVER_URL + '/admin/receiveFeedback',
      data: feedbackObj
    }).then((res) => { this.setState({ feedbackModalOpen: false }); });
  }

  renderFeedbackModal (feedbackModalOpen, toggle) {
    return (<Modal isOpen={feedbackModalOpen} toggle={toggle}>
      <ModalHeader>Tell us what happened</ModalHeader>
      <ModalBody>
        <AvForm onValidSubmit={this.sendFeedback}>
          <AvGroup>
            <Label for='activity'>What is the problem? *</Label>
            <AvField validate={{ required: { value: true, errorMessage: 'A problem summary is required.' } }}
              onChange={(evt) => { this.setState({ shortDescription: evt.target.value }); }} type='text' name='activity' placeholder='Summarize the problem, e.g. "Progtemp is broken".' />
          </AvGroup>
          <AvGroup>
            <Label for='description'>What happened? *</Label>
            <AvField validate={{ required: { value: true, errorMessage: 'A more detailed problem description is required.' } }}
              onChange={(evt) => { this.setState({ longDescription: evt.target.value }); }} type='textarea'
              name='description' placeholder='Describe what you were doing, what went wrong, and what do you think that should have happened instead.' />
          </AvGroup>
          <AvGroup>
            <Label for='description'>Who are you? (optional)
              <br />
              <Alert style={{ 'color': '#818182', 'padding': 0, 'marginBottom': 0 }} color='light'>
                Someone from GeoWeb might contact you to help us solve the issue.
              </Alert>
            </Label>
            <AvField onChange={(evt) => { this.setState({ feedbackSender: evt.target.value }); }}
              type='text' name='feedbackName' placeholder='Your name' />
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
  componentWillUpdate (nextprops) {
    if (!this.state.presets || this.props.user.username !== nextprops.user.username) {
      axios.get(this.props.urls.BACKEND_SERVER_URL + '/preset/getpresets', { withCredentials: true }).then((res) => {
        this.setState({ presets: res.data });
      }).catch((error) => {
        console.error(error);
      });
    }
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
              {hasRoleADMIN ? <Link to='manage' className='active nav-link'><Icon name='cog' /></Link> : '' }
              <NavLink className='active' onClick={this.toggleFeedbackModal}><Icon name='exclamation-triangle' /> Report problem</NavLink>
              <LayoutDropDown savePreset={this.savePreset} mapActions={this.props.mapActions} presets={this.state.presets} onChangeServices={this.getServices}
                layerActions={this.props.layerActions} mapProperties={this.props.mapProperties} dispatch={this.props.dispatch} />
              <NavLink className='active' onClick={this.toggleFullscreen} ><Icon name='expand' /></NavLink>
              {isLoggedIn
                ? this.renderLoggedInPopover(this.state.loginModal, this.toggleLoginModal, username)
                : this.renderLoginModal(this.state.loginModal,
                  this.state.loginModalMessage, this.toggleLoginModal, this.handleOnChange, this.handleKeyPressPassword)
              }
              {this.renderFeedbackModal(this.state.feedbackModalOpen, this.toggleFeedbackModal)}
              {this.renderPresetModal(this.state.presetModal, this.togglePresetModal, hasRoleADMIN)}
              {this.renderSharePresetModal(this.state.sharePresetModal, this.toggleSharePresetModal, this.state.sharePresetName)}
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
    this.postLayout = this.postLayout.bind(this);
    this.removeCustomSource = this.removeCustomSource.bind(this);
    this.handleAddSource = this.handleAddSource.bind(this);
    this.setBBOX = this.setBBOX.bind(this);
    this.setPreset = this.setPreset.bind(this);
    this.setProjection = this.setProjection.bind(this);
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
    this.props.dispatch(this.props.mapActions.setLayout(layout));
  }
  handleAddSource (e) {
    var url = document.querySelector('#sourceurlinput').value;
    let items = JSON.parse(localStorage.getItem('geoweb'));
    // eslint-disable-next-line no-undef
    var getCap = WMJSgetServiceFromStore(url);
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
      alert('Source could not be added. Is it a valid WMS url?');
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
    const { dispatch, layerActions, mapActions } = this.props;
    const thePreset = preset[0];
    if (thePreset.area) {
      if (thePreset.crs || thePreset.area.crs) {
        dispatch(mapActions.setCut({
          name: 'Custom',
          bbox: [thePreset.area.left, thePreset.area.bottom, thePreset.area.right, thePreset.area.top],
          projection: { code: thePreset.crs || thePreset.area.crs || 'EPSG:3857', name: 'Mercator' }
        }));
      } else {
        dispatch(mapActions.setCut({ name: 'Custom', bbox: [thePreset.area.left, thePreset.area.bottom, thePreset.area.right, thePreset.area.top] }));
      }
    }
    if (thePreset.display) {
      dispatch(mapActions.setLayout(thePreset.display.type));
    }
    if (thePreset.layers) {
      dispatch(layerActions.setPreset(thePreset.layers));
    }
  }

  render () {
    const togglePreset = () => this.setState({ popoverOpen: !this.state.popoverOpen });
    const { mapProperties } = this.props;
    const isActive = (layout) => mapProperties && mapProperties.layout === layout;
    const stored = JSON.parse(localStorage.getItem('geoweb'));
    if (!stored) {
      localStorage.setItem('geoweb', JSON.stringify({ personal_urls: [] }));
    }
    const urls = JSON.parse(localStorage.getItem('geoweb')).personal_urls;
    return <NavLink className='active' onClick={togglePreset}>
      <Icon id='layoutbutton' name='sliders' />
      <Modal isOpen={this.state.popoverOpen} toggle={togglePreset} style={{ width: '40rem', minWidth: '40rem' }}>
        <ModalHeader>Presets</ModalHeader>
        <ModalBody>
          <Row>
            <Col>
              <Row>
                <h5>Panel layout</h5>
              </Row>
              <Row>
                <ButtonGroup>
                  <Button onClick={() => this.postLayout('single')} active={isActive('single')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/single.svg')} />
                  </Button>
                  <Button onClick={() => this.postLayout('dual')} active={isActive('dual')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/dual_column.svg')} />
                  </Button>
                  <Button onClick={() => this.postLayout('triplecolumn')} active={isActive('triplecolumn')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/three_columns.svg')} />
                  </Button>
                  <Button onClick={() => this.postLayout('tripleuneven')} active={isActive('tripleuneven')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/uneven_triple.svg')} />
                  </Button>
                  <Button onClick={() => this.postLayout('quaduneven')} active={isActive('quaduneven')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/uneven_quad.svg')} />
                  </Button>
                  <Button onClick={() => this.postLayout('quadcol')} active={isActive('quadcol')} size='sm' color='primary'>
                    <img className={'panelSelectionImage'} src={require('../static/icons/four_columns.svg')} />
                  </Button>
                  <Button onClick={() => this.postLayout('quad')} active={isActive('quad')} size='sm' color='primary'>
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
                  <InputGroupButton>
                    <Button color='primary' onClick={this.handleAddSource} disabled={this.state.getCapBusy}>Add</Button>
                  </InputGroupButton>
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
          <Row style={{ flexDirection: 'column' }}>
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
              <Row style={{ marginTop: '0.5rem' }}>
                <Typeahead align='justify' filterBy={['name', 'keywords']} labelKey='name' options={this.props.presets} placeholder={'Type the preset name'} onChange={(ph) => this.setPreset(ph)} />
              </Row>
            </Col>
            <Col xs='8' style={{ paddingLeft: '1rem' }}>
              <Row>
                <h5>Save preset</h5>
              </Row>
              <Row style={{ marginTop: '0.5rem' }}>
                <InputGroup>
                  <input className='form-control' ref={(ref) => { this.presetNameInput = ref; }} placeholder='Preset name' />
                  <InputGroupButton onClick={() => {
                    this.props.savePreset(this.presetNameInput.value)
                      .then(() => { this.presetNameInput.value = 'Saved preset'; })
                      .catch(() => { this.presetNameInput.value = 'Error saving preset'; });
                  }} color='primary'>Save preset</InputGroupButton>
                </InputGroup>
              </Row>
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
  presets: PropTypes.array,
  layerActions: PropTypes.object
};

TitleBarContainer.propTypes = {
  adagucProperties: PropTypes.object,
  recentTriggers: PropTypes.array,
  notifications: PropTypes.array,
  loginModal: PropTypes.bool,
  routes: PropTypes.array,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
  layers: PropTypes.object,
  user: PropTypes.object,
  userActions: PropTypes.object,
  mapProperties: PropTypes.object,
  mapActions: PropTypes.object,
  layerActions: PropTypes.object,
  adagucActions: PropTypes.object,
  bbox: PropTypes.array,
  fullState: PropTypes.object,
  urls: PropTypes.object
};

TitleBarContainer.defaultProps = {
  isLoggedIn: false,
  loginModal: false,
  userName: '',
  roles: []
};

export default TitleBarContainer;
