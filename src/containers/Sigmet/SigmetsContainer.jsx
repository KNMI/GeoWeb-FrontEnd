import React, { Component } from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';
import produce from 'immer';
import axios from 'axios';
import Panel from '../../components/Panel';
import CollapseOmni from '../../components/CollapseOmni';
import { INITIAL_STATE, LOCAL_ACTION_TYPES, LOCAL_ACTIONS } from './SigmetActions';
import ContainerHeader from './ContainerHeader';
import SigmetsCategory from '../../components/Sigmet/SigmetsCategory';
import MinifiedCategory from '../../components/Sigmet/MinifiedCategory';

const ERROR_MSG = {
  RETRIEVE_SIGMETS: 'Could not retrieve SIGMETs:'
};

class SigmetsContainer extends Component {
  constructor (props) {
    super(props);
    this.localDispatch = this.localDispatch.bind(this);
    this.retrieveSigmets = this.retrieveSigmets.bind(this);
    this.receivedSigmetsCallback = this.receivedSigmetsCallback.bind(this);
    this.toggleContainer = this.toggleContainer.bind(this);
    this.toggleCategory = this.toggleCategory.bind(this);
    this.state = INITIAL_STATE;
  }

  localDispatch (localAction) {
    switch (localAction.type) {
      case LOCAL_ACTION_TYPES.TOGGLE_CONTAINER:
        this.toggleContainer(localAction.event);
        break;
      case LOCAL_ACTION_TYPES.TOGGLE_CATEGORY:
        this.toggleCategory(localAction.event, localAction.ref);
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
        draftState.categories[categoryIndex].sigmets.length = 0;
        draftState.categories[categoryIndex].sigmets.push(...response.data.sigmets);
      }));
    } else {
      console.error(ERROR_MSG.RETRIEVE_SIGMETS, ref, response.status, response.data);
    }
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
                    sigmets={category.sigmets}
                    dispatch={this.localDispatch}
                    actions={LOCAL_ACTIONS} />
                  : <MinifiedCategory key={category.ref}
                    icon={category.icon}
                    sigmetCount={category.sigmets.length} />;
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
