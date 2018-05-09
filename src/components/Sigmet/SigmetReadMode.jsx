import React, { PureComponent } from 'react';
import { Button, Col } from 'reactstrap';
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import { READ_ABILITIES, byReadAbilities } from '../../containers/Sigmet/SigmetActions';
import WhatSection from './Sections/WhatSection';
import ValiditySection from './Sections/ValiditySection';
import ActionSection from './Sections/ActionSection';
import FirSection from './Sections/FirSection';

const DATE_TIME_FORMAT = 'DD MMM YYYY HH:mm UTC';

class SigmetReadMode extends PureComponent {
  render () {
    const { dispatch, actions, abilities, focus, uuid, phenomenon, isObserved, obsFcTime, validdate, validdate_end, firname, location_indicator_icao } = this.props;
    const abilityCtAs = []; // CtA = Call To Action
    if (focus) {
      Object.values(READ_ABILITIES).map((ability) => {
        if (abilities[ability.check] === true) {
          abilityCtAs.push(ability);
        }
      });
      abilityCtAs.sort(byReadAbilities);
    }
    console.log(validdate);
    return <Button tag='div' className={`Sigmet row${focus ? ' focus' : ''}`} onClick={!focus ? (evt) => dispatch(actions.focusSigmetAction(evt, uuid)) : null}>
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

        <ValiditySection>
          <Moment format={DATE_TIME_FORMAT} date={validdate} data-field='validdate' />
          <Moment format={DATE_TIME_FORMAT} date={validdate_end} data-field='validdate_end' />
        </ValiditySection>

        <FirSection>
          <span data-field='firname'>{firname}</span>
          <span data-field='location_indicator_icao'>{location_indicator_icao}</span>
        </FirSection>


        <ActionSection colSize={2}>
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
    deleteSigmetAction: PropTypes.func,
    focusSigmetAction: PropTypes.func
  }),
  abilities: PropTypes.shape(abilitiesPropTypes),
  focus: PropTypes.bool,
  uuid: PropTypes.string,
  phenomenon: PropTypes.string,
  isObserved: PropTypes.bool,
  obsFcTime: PropTypes.string,
  validdate: PropTypes.string,
  validdate_end: PropTypes.string
};

export default SigmetReadMode;
