import React, { Component } from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';
import produce from 'immer';
import Panel from '../../components/Panel';
import Taf from '../../components/Taf/Taf';
import ContainerHeader from '../../components/Taf/ContainerHeader';
import TafSelector from '../../components/Taf/TafSelector';
import { INITIAL_STATE, LOCAL_ACTIONS, MODES } from './TafActions';
import dispatch from './TafReducers';

export default class TafsContainer extends Component {
  constructor (props) {
    super(props);
    this.localDispatch = this.localDispatch.bind(this);
    this.state = produce(INITIAL_STATE, draftState => { });
    this.selectTaf = this.selectTaf.bind(this);
  }

  localDispatch (localAction) {
    dispatch(localAction, this);
  };

  selectTaf (tafSelection) {
    this.localDispatch(LOCAL_ACTIONS.selectTafAction(tafSelection));
  }

  componentDidMount () {
    this.localDispatch(LOCAL_ACTIONS.updateLocationsAction());
    this.localDispatch(LOCAL_ACTIONS.updateTimestampsAction());
  }

  render () {
    const { selectableTafs, selectedTaf, mode } = this.state;
    const tafToShow = selectedTaf && Array.isArray(selectedTaf) && selectedTaf.length === 1 ? selectedTaf[0] : null;
    return (
      <Col className='TafsContainer'>
        <Panel className='Panel' title={<ContainerHeader />}>
          <Col>
            <TafSelector selectableTafs={selectableTafs} selectedTaf={selectedTaf} onChange={this.selectTaf} />
            {selectedTaf
              ? <Taf selectableTaf={tafToShow} urls={this.props.urls} dispatch={this.localDispatch} actions={LOCAL_ACTIONS} editable={mode === MODES.EDIT} />
              : null
            }
          </Col>
        </Panel>
      </Col>);
  }
}

TafsContainer.propTypes = {
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};
