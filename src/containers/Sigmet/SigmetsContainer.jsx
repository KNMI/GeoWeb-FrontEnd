import React, { Component } from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';
import produce from 'immer';
import axios from 'axios';
import moment from 'moment';
import Panel from '../../components/Panel';
import CollapseOmni from '../../components/CollapseOmni';
import { INITIAL_STATE, SIGMET_STATES, LOCAL_ACTION_TYPES, LOCAL_ACTIONS } from './SigmetActions';
import { SIGMET_TEMPLATES } from '../../components/Sigmet/SigmetTemplates';
import ContainerHeader from '../../components/Sigmet/ContainerHeader';
import SigmetsCategory from '../../components/Sigmet/SigmetsCategory';
import MinifiedCategory from '../../components/Sigmet/MinifiedCategory';

const ERROR_MSG = {
  RETRIEVE_SIGMETS: 'Could not retrieve SIGMETs:',
  RETRIEVE_PARAMS: 'Could not retrieve SIGMET parameters',
  RETRIEVE_PHENOMENA: 'Could not retrieve SIGMET phenomena'
};

const WARN_MSG = {
  PREREQUISITES_NOT_MET: 'Not all prerequisites are met:'
};

/**
* Generate a 'next-half-hour-rounded now Moment object
* @return {moment} Moment-object with the current now in UTC rounded to the next half hour
*/
const getRoundedNow = () => {
  return moment().utc().minutes() < 30 ? moment().utc().startOf('hour').minutes(30) : moment().utc().startOf('hour').add(1, 'hour');
};

class SigmetsContainer extends Component {
  constructor (props) {
    super(props);
    this.localDispatch = this.localDispatch.bind(this);
    this.retrieveSigmets = this.retrieveSigmets.bind(this);
    this.receivedSigmetsCallback = this.receivedSigmetsCallback.bind(this);
    this.retrieveParameters = this.retrieveParameters.bind(this);
    this.receivedParametersCallback = this.receivedParametersCallback.bind(this);
    this.retrievePhenomena = this.retrievePhenomena.bind(this);
    this.receivedPhenomenaCallback = this.receivedPhenomenaCallback.bind(this);
    this.toggleContainer = this.toggleContainer.bind(this);
    this.toggleCategory = this.toggleCategory.bind(this);
    this.addSigmet = this.addSigmet.bind(this);
    this.state = produce(INITIAL_STATE, draftState => {});
  }

  /**
   * SigmetsContainer has its own state, this is the dispatch for updating the state
   * @param {object} localAction Action-object containing the type and additional, action specific, parameters
   */
  localDispatch (localAction) {
    switch (localAction.type) {
      case LOCAL_ACTION_TYPES.TOGGLE_CONTAINER:
        this.toggleContainer(localAction.event);
        break;
      case LOCAL_ACTION_TYPES.TOGGLE_CATEGORY:
        this.toggleCategory(localAction.event, localAction.ref);
        break;
      case LOCAL_ACTION_TYPES.ADD_SIGMET:
        this.addSigmet(localAction.ref);
        break;
    }
  }

  retrieveSigmets () {
    const endpoint = `${this.props.urls.BACKEND_SERVER_URL}/sigmet/getsigmetlist`;

    let sigmets = [
      { ref: 'active-sigmets', urlSuffix: '?active=true' },
      { ref: 'concept-sigmets', urlSuffix: '?active=false&status=PRODUCTION' },
      { ref: 'archived-sigmets', urlSuffix: '?active=false&status=CANCELLED' }
    ];
    sigmets.forEach((sigmet) => {
      axios({
        method: 'get',
        url: `${endpoint}${sigmet.urlSuffix}`,
        withCredentials: true,
        responseType: 'json'
      }).then(response => {
        this.receivedSigmetsCallback(sigmet.ref, response);
      }).catch(error => {
        console.error(ERROR_MSG.RETRIEVE_SIGMETS, sigmet.ref, error);
      });
    });
  }

  receivedSigmetsCallback (ref, response) {
    if (response.status === 200 && response.data) {
      if (response.data.nsigmets === 0 || !response.data.sigmets) {
        response.data.sigmets = [];
      }
      this.setState(produce(this.state, draftState => {
        const categoryIndex = draftState.categories.findIndex((category) => category.ref === ref);
        if (!isNaN(categoryIndex) && categoryIndex > 0) {
          draftState.categories[categoryIndex].sigmets.length = 0;
          draftState.categories[categoryIndex].sigmets.push(...response.data.sigmets);
        }
      }));
    } else {
      console.error(ERROR_MSG.RETRIEVE_SIGMETS, ref, response.status, response.data);
    }
  }

  retrieveParameters () {
    const endpoint = `${this.props.urls.BACKEND_SERVER_URL}/sigmet/getsigmetparameters`;

    axios({
      method: 'get',
      url: endpoint,
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      this.receivedParametersCallback(response);
    }).catch(error => {
      console.error(ERROR_MSG.RETRIEVE_PARAMS, error);
    });
  }

  receivedParametersCallback (response) {
    if (response.status === 200 && response.data) {
      this.setState(produce(this.state, draftState => {
        Object.assign(draftState.parameters, response.data);
      }));
      this.localDispatch({ type: LOCAL_ACTION_TYPES.ADD_SIGMET, ref: 'add-sigmet' });
    } else {
      console.error(ERROR_MSG.RETRIEVE_PARAMS, response.status, response.data);
    }
  }

  retrievePhenomena () {
    const endpoint = `${this.props.urls.BACKEND_SERVER_URL}/sigmet/getsigmetphenomena`;

    axios({
      method: 'get',
      url: endpoint,
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      this.receivedPhenomenaCallback(response);
    }).catch(error => {
      console.error(ERROR_MSG.RETRIEVE_PHENOMENA, error);
    });
  }

  receivedPhenomenaCallback (response) {
    if (response.status === 200 && response.data) {
      this.setState(produce(this.state, draftState => {
        draftState.phenomena.length = 0;
        draftState.phenomena.push(...response.data);
      }));
      this.localDispatch({ type: LOCAL_ACTION_TYPES.ADD_SIGMET, ref: 'add-sigmet' });
    } else {
      console.error(ERROR_MSG.RETRIEVE_PARAMS, response.status, response.data);
    }
  }

  addSigmet (ref) {
    if (this.state.parameters && Array.isArray(this.state.phenomena) && this.state.phenomena.length > 0) {
      this.setState(produce(this.state, draftState => {
        const newSigmet = produce(SIGMET_TEMPLATES.SIGMET, draftState => {
          draftState.validdate = getRoundedNow().format();
          draftState.validdate_end = getRoundedNow().add(this.state.parameters.maxhoursofvalidity, 'hour').format();
          draftState.location_indicator_mwo = this.state.parameters.location_indicator_mwo;
          draftState.location_indicator_icao = this.state.parameters.firareas[0].location_indicator_icao;
          draftState.firname = this.state.parameters.firareas[0].firname;
          draftState.change = this.state.parameters.change;
        });
        const categoryIndex = draftState.categories.findIndex((category) => category.ref === ref);
        if (!isNaN(categoryIndex) && categoryIndex > 0) {
          draftState.categories[categoryIndex].sigmets.push(newSigmet);
        }
      }));
    } else {
      console.warn(WARN_MSG.PREREQUISITES_NOT_MET, 'parameters:', this.state.parameters, 'phenomena:', this.state.phenomena);
    }
  }

  editSigmet (uuid) {
    this.setState(produce(this.state, draftState => {
      draftState.focussedSigmet.uuid = uuid;
      draftState.focussedSigmet.state = SIGMET_STATES.EDIT;
    }));
  }

  toggleContainer (evt) {
    evt.preventDefault();
    this.setState(produce(this.state, draftState => {
      draftState.isContainerOpen = !draftState.isContainerOpen;
    }));
  }

  toggleCategory (evt, ref) {
    evt.preventDefault();
    this.setState(produce(this.state, draftState => {
      draftState.focussedCategoryRef = (draftState.focussedCategoryRef === ref)
        ? ''
        : ref;
    }));
  }

  componentDidMount () {
    this.retrieveParameters();
    this.retrievePhenomena();
    this.retrieveSigmets();
  }

  render () {
    const maxSize = 520;
    const header = <ContainerHeader isContainerOpen={this.state.isContainerOpen} dispatch={this.localDispatch} actions={LOCAL_ACTIONS} />;
    return (
      <Col className='SigmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isContainerOpen} isHorizontal minSize={64} maxSize={maxSize}>
          <Panel className='Panel' title={header}>
            <Col xs='auto' className='accordionsWrapper' style={{ minWidth: this.state.isContainerOpen ? maxSize - 32 : 'unset' }}>
              {this.state.categories.map((category) => {
                return this.state.isContainerOpen
                  ? <SigmetsCategory key={category.ref}
                    typeRef={category.ref}
                    title={category.title}
                    icon={category.icon}
                    isOpen={this.state.focussedCategoryRef === category.ref}
                    stageActions={category.stageActions}
                    sigmets={category.sigmets}
                    focussedSigmet={this.state.focussedSigmet}
                    dispatch={this.localDispatch}
                    actions={LOCAL_ACTIONS} />
                  : <MinifiedCategory key={category.ref}
                    icon={category.icon}
                    sigmetCount={(category.ref === 'add-sigmet') ? 0 : category.sigmets.length} />;
              })}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

SigmetsContainer.propTypes = {
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};

export default SigmetsContainer;
