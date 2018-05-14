import React, { PureComponent } from 'react';
import { Button, Col } from 'reactstrap';
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import { READ_ABILITIES, byReadAbilities } from '../../containers/Sigmet/SigmetActions';
import { UNITS_ALT, DIRECTIONS, CHANGES } from './SigmetTemplates';

import WhatSection from './Sections/WhatSection';
import ValiditySection from './Sections/ValiditySection';
import ActionSection from './Sections/ActionSection';
import FirSection from './Sections/FirSection';
import HeightSection from './Sections/HeightSection';
import MovementSection from './Sections/MovementSection';
import ChangeSection from './Sections/ChangeSection';
import IssueSection from './Sections/IssueSection';

const DATE_TIME_FORMAT = 'DD MMM YYYY HH:mm UTC';

class SigmetReadMode extends PureComponent {
  showLevels (level) {
    if (!level || !level.lev1) {
      return '';
    }
    let result = '';
    switch (level.lev1.unit) {
      case 'SFC':
        if (!level.lev2) {
          return '';
        }
        result = 'Between surface and ';
        if (level.lev2.unit === UNITS_ALT.FL) {
          result += UNITS_ALT.FL + level.lev2.value;
        } else {
          result += level.lev2.value + level.lev2.unit === UNITS_ALT.M ? 'm' : 'ft';
        }
        return result;
      case 'TOP':
        return 'Tops at FL' + level.lev1.value;
      case 'TOP_ABV':
        return 'Tops above FL' + level.lev1.value;
      case 'ABV':
        return 'Above FL' + level.lev1.value;
    }

    if (!level.lev2) {
      let result = 'At ';
      if (level.lev1.unit === UNITS_ALT.FL) {
        result += 'FL' + level.lev1.value;
      } else {
        result += level.lev1.value + level.lev1.unit === UNITS_ALT.M ? 'm' : 'ft';
      }
      return result;
    } else {
      let result = 'Between ';
      if (level.lev1.unit === UNITS_ALT.FL) {
        result += 'FL' + level.lev1.value + ' and FL' + level.lev2.value;
      } else if (level.lev1.unit === UNITS_ALT.M) {
        result += level.lev1.value + 'm and ' + level.lev2.value + 'm';
      } else {
        result += level.lev1.value + 'ft and ' + level.lev2.value + 'ft';
      }
      return result;
    }
  }
  render () {
    console.log('sigmetReadMode: ', this.props);
    const { dispatch, actions, abilities, focus, uuid, phenomenon, isObserved, obsFcTime, validdate, validdate_end, firname, location_indicator_icao, issuedate,
      location_indicator_mwo, level, movement, change, sequence } = this.props;
    const abilityCtAs = []; // CtA = Call To Action
    if (focus) {
      Object.values(READ_ABILITIES).map((ability) => {
        if (abilities[ability.check] === true) {
          abilityCtAs.push(ability);
        }
      });
      abilityCtAs.sort(byReadAbilities);
    }
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

        <HeightSection>
          <span data-field='level'>{this.showLevels(level)}</span>
        </HeightSection>

        {/* TODO: Can this be done better? */}
        {movement.stationary === false && movement.hasOwnProperty('speed') && movement.hasOwnProperty('dir')
          ? <MovementSection>
            <span data-field='movement'>Moving</span>
            <span data-field='speed'>{movement.speed}KT</span>
            <span data-field='direction'>{DIRECTIONS.find((obj) => obj.shortName === movement.dir).longName}</span>
          </MovementSection>
          : <MovementSection>
            <span data-field='movement'>{movement.stationary ? 'Stationary' : 'Movement is defined by area'}</span>
          </MovementSection>
        }

        <ChangeSection>
          <span data-field='change'>{CHANGES.find((obj) => obj.shortName === change).longName}</span>
        </ChangeSection>

        <IssueSection>
          <Moment format={DATE_TIME_FORMAT} date={issuedate} data-field='issuedate' />
          <span data-field='issueLocation'>{location_indicator_mwo}</span>
          <span data-field='sequence'>{sequence < 1 ? '(Not yet issued)' : sequence}</span>
        </IssueSection>

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
  issuedate: PropTypes.string,
  validdate: PropTypes.string,
  validdate_end: PropTypes.string,
  level: PropTypes.shape({
    lev1: PropTypes.shape({
      level: PropTypes.number,
      unit: PropTypes.string
    }).isRequired,
    lev2: PropTypes.shape({
      level: PropTypes.number,
      unit: PropTypes.string
    })
  }),
  movement: PropTypes.shape({
    stationary: PropTypes.bool.isRequired,
    speed: PropTypes.number,
    dir: PropTypes.string
  }),
  change: PropTypes.string,
  sequence: PropTypes.number,
  location_indicator_icao: PropTypes.string,
  location_indicator_mwo: PropTypes.string,
  firname: PropTypes.string
};

export default SigmetReadMode;
