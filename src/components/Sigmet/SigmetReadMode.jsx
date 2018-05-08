import React, { PureComponent } from 'react';
import { Button, Col } from 'reactstrap';
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import { READ_ABILITIES, byReadAbilities } from '../../containers/Sigmet/SigmetActions';
import WhatSection from './Sections/WhatSection';
import ActionSection from './Sections/ActionSection';

const DATE_TIME_FORMAT = 'DD MMM YYYY HH:mm UTC';

class SigmetReadMode extends PureComponent {
  render () {
    const { dispatch, actions, abilities, uuid, phenomenon, isObserved, obsFcTime } = this.props;
    const abilityCtAs = []; // CtA = Call To Action
    Object.values(READ_ABILITIES).map((ability) => {
      if (abilities[ability.check] === true) {
        abilityCtAs.push(ability);
      }
    });
    abilityCtAs.sort(byReadAbilities);
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
          {abilityCtAs.map((ability) =>
            <Button key={`action-${ability.dataField}`}
              data-field={ability.dataField}
              color='primary'
              onClick={(evt) => dispatch(actions[ability.action](evt, uuid))}>
              {ability.label}
            </Button>
          )}
        </ActionSection>
      </Col>
    </Button>;
  }
}

const abilitiesPropTypes = {};
Object.values(READ_ABILITIES).map(ability => {
  abilitiesPropTypes[ability.check] = PropTypes.bool;
});

SigmetReadMode.propTypes = {
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    editSigmetAction: PropTypes.func,
    publishSigmetAction: PropTypes.func,
    cancelSigmetAction: PropTypes.func,
    deleteSigmetAction: PropTypes.func
  }),
  abilities: PropTypes.shape(abilitiesPropTypes),
  uuid: PropTypes.string,
  phenomenon: PropTypes.string,
  isObserved: PropTypes.bool,
  obsFcTime: PropTypes.string
};

export default SigmetReadMode;
