import React, { PureComponent } from 'react';
import { Button, Col } from 'reactstrap';
import Moment from 'react-moment';
import moment from 'moment';
import PropTypes from 'prop-types';
import { READ_ABILITIES, byReadAbilities } from '../../containers/Sigmet/SigmetActions';
import { UNITS, UNITS_ALT, DIRECTIONS, CHANGES, MODES_LVL, MOVEMENT_TYPES, SIGMET_TYPES, DATETIME_LABEL_FORMAT_UTC } from './SigmetTemplates';

import HeaderSection from './Sections/HeaderSection';
import WhatSection from './Sections/WhatSection';
import ValiditySection from './Sections/ValiditySection';
import ActionSection from './Sections/ActionSection';
import FirSection from './Sections/FirSection';
import HeightSection from './Sections/HeightSection';
import ProgressSection from './Sections/ProgressSection';
import ChangeSection from './Sections/ChangeSection';
import IssueSection from './Sections/IssueSection';

class SigmetReadMode extends PureComponent {
  getUnitLabel (unitName) {
    return UNITS_ALT.find((unit) => unit.unit === unitName).label;
  };

  getValueLabel (value, unit) {
    if (typeof value !== 'number' || value === 0) {
      return null;
    }
    const valueAsString = value.toString();
    let minimalCharactersCount = 0;
    switch (unit) {
      case UNITS.FL:
        minimalCharactersCount = 3;
        break;
      case UNITS.M:
      case UNITS.FT:
        minimalCharactersCount = 4;
        break;
      default:
        break;
    }
    return valueAsString.padStart(minimalCharactersCount, '0');
  };

  showLevels (levelinfo) {
    if (!levelinfo) {
      return;
    }
    const level0 = levelinfo.levels[0];
    const level1 = levelinfo.levels[1];
    const is0FL = level0.unit === UNITS.FL;
    const is1FL = level1.unit === UNITS.FL;
    const value0Label = this.getValueLabel(level0.value, level0.unit);
    const unit0Label = this.getUnitLabel(level0.unit);
    const value1Label = this.getValueLabel(level1.value, level1.unit);
    const unit1Label = this.getUnitLabel(level1.unit);
    switch (levelinfo.mode) {
      case MODES_LVL.ABV:
        return unit0Label && value0Label
          ? `Above ${is0FL ? unit0Label : ''} ${value0Label} ${!is0FL ? unit0Label : ''}`
          : null;
      case MODES_LVL.AT:
        return unit0Label && value0Label
          ? `At ${is0FL ? unit0Label : ''} ${value0Label} ${!is0FL ? unit0Label : ''}`
          : null;
      case MODES_LVL.BETW:
        return unit0Label && value0Label && unit1Label && value1Label
          ? `Between ${is0FL ? unit0Label : ''} ${value0Label} ${!is0FL ? unit0Label : ''} and
            ${is1FL ? unit1Label : ''} ${value1Label} ${!is1FL ? unit1Label : ''}`
          : null;
      case MODES_LVL.BETW_SFC:
        return unit1Label && value1Label
          ? `Between surface and ${is1FL ? unit1Label : ''} ${value1Label} ${!is1FL ? unit1Label : ''}`
          : null;
      case MODES_LVL.TOPS:
        return unit0Label && value0Label
          ? `Tops at ${is0FL ? unit0Label : ''} ${value0Label} ${!is0FL ? unit0Label : ''}`
          : null;
      case MODES_LVL.TOPS_ABV:
        return unit0Label && value0Label
          ? `Tops above ${is0FL ? unit0Label : ''} ${value0Label} ${!is0FL ? unit0Label : ''}`
          : null;
      case MODES_LVL.TOPS_BLW:
        return unit0Label && value0Label
          ? `Tops below ${is0FL ? unit0Label : ''} ${value0Label} ${!is0FL ? unit0Label : ''}`
          : null;
      default:
        return '';
    }
  }

  /**
   * Check whether or not the basic values for this specific Sigmet are valid
   * @returns {boolean} Whether or not the basic values in this specific Sigmet are valid
   */
  isValid () {
    const { validdate, validdateEnd, maxHoursInAdvance, maxHoursDuration, hasStartCoordinates, hasStartIntersectionCoordinates } = this.props;
    const now = moment.utc();
    const startTimeStamp = moment.utc(validdate);
    const isStartValid = now.clone().subtract(1, 'day').isSameOrBefore(startTimeStamp) &&
      now.clone().add(maxHoursInAdvance, 'hour').isSameOrAfter(startTimeStamp);
    const isEndValid = startTimeStamp.isSameOrBefore(validdateEnd) &&
      startTimeStamp.clone().add(maxHoursDuration, 'hour').isSameOrAfter(validdateEnd);
    return isStartValid && isEndValid && hasStartCoordinates && hasStartIntersectionCoordinates;
  };

  /**
  * Add disabled flag to abilities
  * @param {object} ability The ability to provide the flag for
  * @param {boolean} isInValidityPeriod Whether or not the referred Sigmet is active
  * @returns {boolean} Whether or not is should be disabled
  */
  getDisabledFlag (abilityRef, isInValidityPeriod) {
    const { uuid, copiedSigmetRef } = this.props;
    if (!abilityRef) {
      return false;
    }
    switch (abilityRef) {
      case READ_ABILITIES.COPY['dataField']:
        return copiedSigmetRef === uuid;
      case READ_ABILITIES.PUBLISH['dataField']:
        return !this.isValid();
      case READ_ABILITIES.CANCEL['dataField']:
        return !isInValidityPeriod;
      default:
        return false;
    }
  }

  /**
   * Reduce the available abilities for this specific Sigmet
   * @returns {array} The remaining abilities for this specific Sigmet
   */
  reduceAbilities () {
    const { abilities, validdate, validdateEnd, isCancelFor } = this.props;
    const abilitiesCtAs = []; // CtA = Call To Action
    const now = moment.utc();
    const isInValidityPeriod = !now.isBefore(validdate) && !now.isAfter(validdateEnd);
    if (focus) {
      Object.values(READ_ABILITIES).map((ability) => {
        if (abilities[ability.check] === true && (ability.dataField !== 'cancel' || !isCancelFor)) {
          ability.disabled = this.getDisabledFlag(ability.dataField, isInValidityPeriod);
          abilitiesCtAs.push(ability);
        }
      });
      abilitiesCtAs.sort(byReadAbilities);
    }
    return abilitiesCtAs;
  }

  render () {
    const { dispatch, actions, focus, uuid, phenomenon, isObserved, obsFcTime, validdate, validdateEnd, firname, locationIndicatorIcao, issuedate,
      locationIndicatorMwo, levelinfo, movement, movementType, change, sequence, tac, isCancelFor, volcanoName, volcanoCoordinates, isVolcanicAsh } = this.props;
    const abilityCtAs = this.reduceAbilities(); // CtA = Call To Action
    const selectedDirection = movement && DIRECTIONS.find((obj) => obj.shortName === movement.dir);
    const directionLongName = selectedDirection ? selectedDirection.longName : null;
    return <Button tag='div' className={`Sigmet row${focus ? ' focus' : ''}`} onClick={(evt) => dispatch(actions.focusSigmetAction(evt, uuid))}>
      <Col>
        <HeaderSection isCancelFor={isCancelFor} />
        <WhatSection>
          <span data-field='phenomenon'>{phenomenon}</span>
          <span data-field='obs_or_fcst'>{isObserved ? 'Observed' : 'Forecast'}</span>
          {obsFcTime
            ? <Moment format={DATETIME_LABEL_FORMAT_UTC} date={obsFcTime} data-field='obsFcTime' utc />
            : <span data-field='obsFcTime'>
              {isObserved
                ? '(no observation time provided)'
                : '(no forecasted time provided)'
              }
            </span>
          }
          {isVolcanicAsh
            ? <span data-field='volcano_name'>{volcanoName}</span>
            : null
          }
          {isVolcanicAsh
            ? <span data-field='volcano_coordinates_lat'>{Array.isArray(volcanoCoordinates) && volcanoCoordinates.length > 1 ? volcanoCoordinates[0] : null}</span>
            : null
          }
          {isVolcanicAsh
            ? <span data-field='volcano_coordinates_lon'>{Array.isArray(volcanoCoordinates) && volcanoCoordinates.length > 1 ? volcanoCoordinates[1] : null}</span>
            : null
          }
        </WhatSection>

        <ValiditySection>
          <Moment format={DATETIME_LABEL_FORMAT_UTC} date={validdate} data-field='validdate' utc />
          <Moment format={DATETIME_LABEL_FORMAT_UTC} date={validdateEnd} data-field='validdate_end' utc />
        </ValiditySection>

        <FirSection>
          <span data-field='firname'>{firname}</span>
          <span data-field='location_indicator_icao'>{locationIndicatorIcao}</span>
        </FirSection>

        <HeightSection>
          <span data-field='level'>{this.showLevels(levelinfo)}</span>
        </HeightSection>

        {movementType === MOVEMENT_TYPES.MOVEMENT
          ? <ProgressSection>
            <span data-field='movement'>Moving</span>
            <span data-field='speed'>{movement.speed}KT</span>
            <span data-field='direction'>{directionLongName}</span>
          </ProgressSection>
          : <ProgressSection>
            <span data-field='movement'>
              {movementType === MOVEMENT_TYPES.STATIONARY
                ? 'Stationary'
                : movementType === MOVEMENT_TYPES.FORECAST_POSITION
                  ? 'Movement is defined by area'
                  : '(movement type is not (properly) set)'
              }
            </span>
          </ProgressSection>
        }

        <ChangeSection>
          <span data-field='change'>{change && CHANGES.find((obj) => obj.shortName === change).longName}</span>
        </ChangeSection>

        <IssueSection>
          {issuedate
            ? <Moment format={DATETIME_LABEL_FORMAT_UTC} date={issuedate} data-field='issuedate' utc />
            : <span data-field='issuedate'>(not yet issued)</span>
          }
          <span data-field='issueLocation'>{locationIndicatorMwo}</span>
          <span data-field='sequence'>{sequence < 1 ? '(not yet issued)' : sequence}</span>
          <span className='tac' data-field='tac' title={tac && tac.code}>{tac && tac.code}</span>
        </IssueSection>

        <ActionSection colSize={2}>
          {abilityCtAs.map((ability) =>
            <Button key={`action-${ability.dataField}`}
              data-field={ability.dataField}
              color='primary'
              disabled={ability.disabled}
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
  tac: PropTypes.shape({
    uuid: PropTypes.string,
    code: PropTypes.string
  }),
  copiedSigmetRef: PropTypes.string,
  phenomenon: PropTypes.string,
  isObserved: PropTypes.bool,
  obsFcTime: PropTypes.string,
  issuedate: PropTypes.string,
  validdate: PropTypes.string,
  validdateEnd: PropTypes.string,
  levelinfo: PropTypes.shape({
    mode: PropTypes.string,
    levels: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.number,
      unit: PropTypes.string
    }))
  }),
  movementType: SIGMET_TYPES.MOVEMENT_TYPE,
  movement: SIGMET_TYPES.MOVEMENT,
  change: PropTypes.string,
  sequence: PropTypes.number,
  locationIndicatorIcao: PropTypes.string,
  locationIndicatorMwo: PropTypes.string,
  firname: PropTypes.string,
  maxHoursInAdvance: PropTypes.number,
  maxHoursDuration: PropTypes.number,
  hasStartCoordinates: PropTypes.bool,
  hasStartIntersectionCoordinates: PropTypes.bool,
  isCancelFor: PropTypes.number,
  volcanoName: PropTypes.string,
  volcanoCoordinates: PropTypes.arrayOf(PropTypes.number),
  isVolcanicAsh: PropTypes.bool
};

export default SigmetReadMode;
