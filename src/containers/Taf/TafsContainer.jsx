import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import produce from 'immer';
import Panel from '../../components/Panel';
import Taf from '../../components/Taf/Taf';
import ContainerHeader from '../../components/Taf/ContainerHeader';
import TafSelector from '../../components/Taf/TafSelector';
import FeedbackSection from '../../components/Taf/FeedbackSection';
import { INITIAL_STATE, LOCAL_ACTIONS, FEEDBACK_STATUSES, FEEDBACK_CATEGORIES, MODALS } from './TafActions';
import dispatch from './TafReducers';
import ConfirmationModal from '../../components/Taf/ConfirmationModal';

export default class TafsContainer extends Component {
  constructor (props) {
    super(props);
    this.localDispatch = this.localDispatch.bind(this);
    this.state = produce(INITIAL_STATE, draftState => { });
  }

  localDispatch (localAction) {
    dispatch(localAction, this);
  };

  componentDidMount () {
    this.localDispatch(LOCAL_ACTIONS.updateLocationsAction());
    this.localDispatch(LOCAL_ACTIONS.updateTimestampsAction());
  }

  render () {
    const { selectableTafs, selectedTaf, mode, abilitiesPerStatus, copiedTafRef, feedback, displayModal } = this.state;
    const tafToShow = selectedTaf && Array.isArray(selectedTaf) && selectedTaf.length === 1 ? selectedTaf[0] : null;
    const hasFollowUp = Array.isArray(selectableTafs) && !!tafToShow && selectableTafs.some((selectable) =>
      !!selectable.tafData.metadata.previousUuid && selectable.tafData.metadata.previousUuid === tafToShow.tafData.metadata.uuid);
    const lifecycleFeedback = feedback && feedback[FEEDBACK_CATEGORIES.LIFECYCLE];
    return (
      <Col className='TafsContainer'>
        <Panel className='Panel' title={<ContainerHeader />}>
          <Col>
            <TafSelector selectableTafs={selectableTafs} selectedTaf={selectedTaf}
              onChange={(tafSelection) => this.localDispatch(LOCAL_ACTIONS.selectTafAction(tafSelection))} />
            {tafToShow
              ? <Taf selectedTaf={tafToShow} urls={this.props.urls} dispatch={this.localDispatch} actions={LOCAL_ACTIONS}
                mode={mode} abilitiesPerStatus={abilitiesPerStatus} copiedTafRef={copiedTafRef} feedback={feedback} hasFollowUp={hasFollowUp} />
              : null
            }
            {lifecycleFeedback !== null && lifecycleFeedback !== undefined
              ? <FeedbackSection status={lifecycleFeedback.status ? lifecycleFeedback.status : FEEDBACK_STATUSES.INFO} category={FEEDBACK_CATEGORIES.LIFECYCLE}>
                {lifecycleFeedback.title
                  ? <span data-field='title'>{lifecycleFeedback.title}</span>
                  : null
                }
                {lifecycleFeedback.subTitle
                  ? <span data-field='subTitle'>{lifecycleFeedback.subTitle}</span>
                  : null
                }
              </FeedbackSection>
              : <Row className='TafFeedbackSection empty' />
            }
          </Col>
          <ConfirmationModal config={MODALS.CONFIRM_DELETE} openModal={displayModal} dispatch={this.localDispatch} actions={LOCAL_ACTIONS}
            identifier={tafToShow ? `the TAF for ${tafToShow.location} ${tafToShow.timestamp.format('HH:mm')}` : null} />
        </Panel>
      </Col>);
  }
}

TafsContainer.propTypes = {
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};
