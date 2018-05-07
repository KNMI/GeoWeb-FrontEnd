import React, { PureComponent } from 'react';
import { Button, Col } from 'reactstrap';
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import WhatSection from './Sections/WhatSection';
import ActionSection from './Sections/ActionSection';

const DATE_TIME_FORMAT = 'DD MMM YYYY HH:mm UTC';

class SigmetReadMode extends PureComponent {
  render () {
    const { dispatch, actions, isCancelable, isEditable, uuid, phenomenon, isObserved, obsFcTime } = this.props;
    return <Button tag='div' className={'Sigmet row'}>
      <Col>
        <WhatSection>
          <span data-field='phenomenon'>{phenomenon}</span>
          <span data-field='obs_or_fcst'>{isObserved ? 'Observed' : 'Forecast'}</span>
          {obsFcTime
            ? <Moment format={DATE_TIME_FORMAT} date={obsFcTime} data-field='obsFcTime' />
            : <span data-field='obsFcTime'>
              {isObserved
                ? '(no observation time provided)'
                : '(no forecasted time provided)'
              }
            </span>
          }
        </WhatSection>
        <ActionSection>
          {isCancelable
            ? <Button data-field='cancel' color='primary' onClick={(evt) => dispatch(actions.cancelSigmetAction(evt, uuid))}>Cancel</Button>
            : null
          }
          {isEditable
            ? <Button data-field='edit' color='primary' onClick={(evt) => dispatch(actions.editSigmetAction(evt, uuid))}>Edit</Button>
            : null
          }
        </ActionSection>
      </Col>
    </Button>;
  }
}

SigmetReadMode.propTypes = {
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    editSigmetAction: PropTypes.func,
    publishSigmetAction: PropTypes.func,
    cancelSigmetAction: PropTypes.func,
    deleteSigmetAction: PropTypes.func
  }),
  isEditable: PropTypes.bool,
  isPublishable: PropTypes.bool,
  isCancelable: PropTypes.bool,
  isDeletable: PropTypes.bool,
  isCloneable: PropTypes.bool,
  uuid: PropTypes.string,
  phenomenon: PropTypes.string,
  isObserved: PropTypes.bool,
  obsFcTime: PropTypes.string
};

export default SigmetReadMode;
