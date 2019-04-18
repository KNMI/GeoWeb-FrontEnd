import React, { PureComponent } from 'react';
import { Button, Col } from 'reactstrap';
import Moment from 'react-moment';
import moment from 'moment';
import produce from 'immer';
import PropTypes from 'prop-types';
import { READ_ABILITIES, byReadAbilities, MODALS, MODAL_TYPES } from '../../containers/Airmet/AirmetActions';
import { UNITS, UNITS_LABELED, DIRECTIONS, MODES_LVL, CHANGE_OPTIONS, MOVEMENT_TYPES, AIRMET_TYPES, dateRanges } from './AirmetTemplates';
import { DATETIME_LABEL_FORMAT_UTC } from '../../config/DayTimeConfig';

import HeaderSection from '../SectionTemplates/HeaderSection';
import WhatSection from '../SectionTemplates/WhatSection';
import ValiditySection from '../SectionTemplates/ValiditySection';
import ActionSection from '../SectionTemplates/ActionSection';
import FirSection from '../SectionTemplates/FirSection';
import HeightSection from '../SectionTemplates/HeightSection';
import ProgressSection from '../SectionTemplates/ProgressSection';
import ChangeSection from '../SectionTemplates/ChangeSection';
import IssueSection from '../SectionTemplates/IssueSection';
import ConfirmationModal from '../ConfirmationModal';
import MovementSection from '../SectionTemplates/MovementSection';
import CompactedHeightsSection from '../SectionTemplates/CompactedHeightsSection';

class AirmetReadMode extends PureComponent {
  getUnitLabel (unitName) {
    const unit = UNITS_LABELED.find((unit) => unit.unit === unitName);
    return typeof unit !== 'undefined'
      ? unit.label
      : '';
  };

  getValueLabel (value, unit, showZero = false) {
    if (typeof value !== 'number' || (value === 0 && showZero !== true)) {
      return null;
    }
    const valueAsString = value.toString();
    let minimalCharactersCount = 0;
    switch (unit) {
      case UNITS.FL:
      case UNITS.DEGREES:
        minimalCharactersCount = 3;
        break;
      case UNITS.M:
      case UNITS.FT:
        minimalCharactersCount = 4;
        break;
      case UNITS.KT:
      case UNITS.MPS:
        minimalCharactersCount = 2;
        break;
      default:
        break;
    }
    return valueAsString.padStart(minimalCharactersCount, '0');
  };

  showCloudLevels (cloudLevels) {
    const hasValues = cloudLevels.upper && Number.isInteger(cloudLevels.upper.val) &&
      cloudLevels.upper.val > 0 && typeof cloudLevels.upper.unit === 'string' && cloudLevels.lower &&
      ((Number.isInteger(cloudLevels.lower.val) && cloudLevels.lower.val > 0) || cloudLevels.lower.surface === true) &&
      typeof cloudLevels.lower.unit === 'string';
    const above = cloudLevels.upper && cloudLevels.upper.above === true ? 'above' : '';
    return !hasValues
      ? '(no complete cloud levels provided)'
      : `Between   ${cloudLevels.lower.surface === true
        ? 'surface'
        : `${this.getValueLabel(cloudLevels.lower.val, cloudLevels.lower.unit)} ${this.getUnitLabel(cloudLevels.lower.unit)}`}
        and ${above} ${this.getValueLabel(cloudLevels.upper.val, cloudLevels.upper.unit)} ${this.getUnitLabel(cloudLevels.upper.unit)}`;
  };

  showLevels (levelinfo) {
    const sLevelsInfoMissed = '(no complete levels info provided)';
    if (!levelinfo) {
      return sLevelsInfoMissed;
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
          : sLevelsInfoMissed;
      case MODES_LVL.AT:
        return unit0Label && value0Label
          ? `At ${is0FL ? unit0Label : ''} ${value0Label} ${!is0FL ? unit0Label : ''}`
          : sLevelsInfoMissed;
      case MODES_LVL.BETW:
        return unit0Label && value0Label && unit1Label && value1Label
          ? `Between ${is0FL ? unit0Label : ''} ${value0Label} ${!is0FL ? unit0Label : ''} and
            ${is1FL ? unit1Label : ''} ${value1Label} ${!is1FL ? unit1Label : ''}`
          : sLevelsInfoMissed;
      case MODES_LVL.BETW_SFC:
        return unit1Label && value1Label
          ? `Between surface and ${is1FL ? unit1Label : ''} ${value1Label} ${!is1FL ? unit1Label : ''}`
          : sLevelsInfoMissed;
      case MODES_LVL.TOPS:
        return unit0Label && value0Label
          ? `Tops at ${is0FL ? unit0Label : ''} ${value0Label} ${!is0FL ? unit0Label : ''}`
          : sLevelsInfoMissed;
      case MODES_LVL.TOPS_ABV:
        return unit0Label && value0Label
          ? `Tops above ${is0FL ? unit0Label : ''} ${value0Label} ${!is0FL ? unit0Label : ''}`
          : sLevelsInfoMissed;
      case MODES_LVL.TOPS_BLW:
        return unit0Label && value0Label
          ? `Tops below ${is0FL ? unit0Label : ''} ${value0Label} ${!is0FL ? unit0Label : ''}`
          : sLevelsInfoMissed;
      default:
        return '';
    }
  };

  showProgress () {
    const { movement_type: movementType } = this.props.airmet;
    switch (movementType) {
      case MOVEMENT_TYPES.STATIONARY:
        return 'Stationary';
      case MOVEMENT_TYPES.MOVEMENT:
        return 'Moving';
      default:
        return '(movement type is not (properly) set)';
    }
  };

  /**
   * Compose the specific configuration for the confirmation modal
   * @param {string} displayModal The name of the modal to display
   * @param {string} uuid The identifier for the focussed AIRMET
   * @param {string[]} adjacentFirs A list of identifiers for the adjacent FIRs
   * @returns {Object} The configuration for the confirmation modal
   */
  getModalConfig (displayModal, uuid, adjacentFirs, moveTo) {
    const modalEntries = Object.entries(MODALS).filter((modalEntry) => modalEntry[1].type === displayModal);
    return Array.isArray(modalEntries) && modalEntries.length > 0 ? produce(modalEntries[0][1], draftState => {
      if (draftState.button) {
        draftState.button.arguments = uuid; /* Used in action dispatch with right arguments */
      }
    }) : null;
  }

  /*
   * Checks whether or not an individual level is valid
   * @param {object} level The level to check for validity
   * @returns {boolean} The result
   */
  isLevelValid (level) {
    return typeof level === 'object' &&
      typeof level.unit === 'string' && level.unit.length > 0 &&
      typeof level.value === 'number' && !isNaN(level.value) && level.value !== 0;
  }

  /**
   * Checks whether or not the levels information section is valid
   * @returns {boolean} The result
   */
  isLevelInfoValid () {
    const { levelinfo } = this.props.airmet;
    switch (levelinfo.mode) {
      case MODES_LVL.ABV:
      case MODES_LVL.AT:
      case MODES_LVL.TOPS:
      case MODES_LVL.TOPS_ABV:
      case MODES_LVL.TOPS_BLW:
        return Array.isArray(levelinfo.levels) && levelinfo.levels.length > 0 &&
          this.isLevelValid(levelinfo.levels[0]);
      case MODES_LVL.BETW:
        return Array.isArray(levelinfo.levels) && levelinfo.levels.length > 1 &&
          this.isLevelValid(levelinfo.levels[0]) &&
          this.isLevelValid(levelinfo.levels[1]);
      case MODES_LVL.BETW_SFC:
        return Array.isArray(levelinfo.levels) && levelinfo.levels.length > 0 &&
          this.isLevelValid(levelinfo.levels[1]);
      default:
        return false;
    }
  }

  /**
   * Checks whether or not the movement section is valid
   * @returns {boolean} The result
   */
  isMovementValid () {
    const { movement_type: movementType, movement } = this.props.airmet;
    switch (movementType) {
      case MOVEMENT_TYPES.STATIONARY:
        return true;
      case MOVEMENT_TYPES.MOVEMENT:
        return movement && typeof movement.speed === 'number' &&
          typeof movement.dir === 'string' && movement.dir.length > 0;
      default:
        return false;
    }
  }

  /**
   * Check whether or not the basic values for this specific Airmet are valid
   * @returns {boolean} Whether or not the basic values in this specific Airmet are valid
   */
  isValid () {
    const { maxHoursInAdvance, maxHoursDuration, hasStartCoordinates, hasStartIntersectionCoordinates,
      isWindNeeded, isCloudLevelsNeeded, isObscuringNeeded, isLevelFieldNeeded } = this.props;
    const { validdate, validdate_end: validdateEnd, phenomenon, firname, change, type: distributionType,
      wind, cloudLevels, obscuring, visibility } = this.props.airmet;
    const now = moment.utc();
    const startTimestamp = moment.utc(validdate);
    const endTimestamp = moment.utc(validdateEnd);
    const dateLimits = dateRanges(now, startTimestamp, endTimestamp, maxHoursInAdvance, maxHoursDuration);
    const isStartValid = dateLimits.validDate.min.isSameOrBefore(startTimestamp) &&
      dateLimits.validDate.max.isSameOrAfter(startTimestamp);
    const isEndValid = dateLimits.validDateEnd.min.isSameOrBefore(endTimestamp) &&
      dateLimits.validDateEnd.max.isSameOrAfter(endTimestamp);
    const isWindValid = !isWindNeeded || (wind && wind.speed && typeof wind.speed.unit === 'string' && wind.speed.unit.length > 0 &&
      typeof wind.speed.val === 'number' && wind.direction && typeof wind.direction.val === 'number');
    const isCloudLevelsValid = !isCloudLevelsNeeded || (cloudLevels && cloudLevels.lower && cloudLevels.upper &&
      typeof cloudLevels.lower.surface === 'boolean' && (cloudLevels.lower.surface ||
        (typeof cloudLevels.lower.unit === 'string' && cloudLevels.lower.unit.length > 0 &&
      typeof cloudLevels.lower.val === 'number' && cloudLevels.lower.val !== 0)) &&
      typeof cloudLevels.upper.above === 'boolean' && typeof cloudLevels.upper.unit === 'string' && cloudLevels.upper.unit.length > 0 &&
      typeof cloudLevels.upper.val === 'number' && cloudLevels.upper.val !== 0);
    const isObscuringValid = !isObscuringNeeded || (Array.isArray(obscuring) && obscuring.length > 0 &&
      typeof obscuring[0].name === 'string' && obscuring[0].name.length > 0 &&
      typeof obscuring[0].code === 'string' && obscuring[0].code.length > 0 &&
      visibility && typeof visibility.val === 'number');
    const isLevelFieldValid = !isLevelFieldNeeded || this.isLevelInfoValid();
    const hasPhenomenon = typeof phenomenon === 'string' && phenomenon.length > 0;
    const hasFir = typeof firname === 'string' && firname.length > 0;
    const hasChange = typeof change === 'string' && change.length > 0;
    const hasType = typeof distributionType === 'string' && distributionType.length > 0;
    return isStartValid && isEndValid && hasStartCoordinates && hasStartIntersectionCoordinates &&
      hasPhenomenon && hasFir && hasChange && hasType && this.isMovementValid() &&
      isWindValid && isCloudLevelsValid && isObscuringValid && isLevelFieldValid;
  };

  /**
  * Add disabled flag to abilities
  * @param {object} ability The ability to provide the flag for
  * @param {boolean} isInValidityPeriod Whether or not the referred Airmet is active
  * @returns {boolean} Whether or not is should be disabled
  */
  getDisabledFlag (abilityRef, isInValidityPeriod) {
    const { copiedAirmetRef } = this.props;
    const { uuid } = this.props.airmet;
    if (!abilityRef) {
      return false;
    }
    switch (abilityRef) {
      case READ_ABILITIES.COPY['dataField']:
        return copiedAirmetRef === uuid;
      case READ_ABILITIES.PUBLISH['dataField']:
        return !this.isValid();
      case READ_ABILITIES.CANCEL['dataField']:
        return !isInValidityPeriod;
      default:
        return false;
    }
  }

  /**
   * Reduce the available abilities for this specific Airmet
   * @returns {array} The remaining abilities for this specific Airmet
   */
  reduceAbilities () {
    const { abilities, isCancelFor } = this.props;
    const { validdate_end: validdateEnd } = this.props.airmet;
    const abilitiesCtAs = []; // CtA = Call To Action
    const now = moment.utc();
    const isInValidityPeriod = !now.isAfter(validdateEnd);
    if (focus) {
      Object.values(READ_ABILITIES).forEach((ability) => {
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
    const { dispatch, actions, airmet, focus, isCancelFor, isWindNeeded, isCloudLevelsNeeded, isObscuringNeeded, isLevelFieldNeeded,
      displayModal, adjacentFirs } = this.props;
    const { phenomenon, uuid, type: distributionType, validdate, validdate_end: validdateEnd,
      location_indicator_icao: locationIndicatorIcao, location_indicator_mwo: locationIndicatorMwo,
      levelinfo, movement_type: movementType, movement, change, tac, obs_or_forecast: obsOrForecast,
      issuedate, sequence, firname, wind, cloudLevels, obscuring, visibility } = airmet;

    const selectedObscuringPhenomenon = Array.isArray(obscuring) && obscuring.length > 0 ? obscuring[0] : null;
    const obsFcTime = obsOrForecast ? obsOrForecast.obsFcTime : null;
    const isObserved = obsOrForecast ? obsOrForecast.obs : null;
    const abilityCtAs = this.reduceAbilities(); // CtA = Call To Action
    const selectedDirection = movement && DIRECTIONS.find((obj) => obj.shortName === movement.dir);
    const directionLongName = selectedDirection ? selectedDirection.longName : null;
    const selectedChange = typeof change === 'string' && CHANGE_OPTIONS.find((option) => option.optionId === change);
    const selectedChangeLabel = selectedChange ? selectedChange.label : null;
    const modalConfig = this.getModalConfig(displayModal, uuid, adjacentFirs, moveTo);
    return <Button tag='div' className={`Airmet row${focus ? ' focus' : ''}`} onClick={(evt) => dispatch(actions.focusAirmetAction(evt, uuid))}>
      <Col>
        <HeaderSection isCancelFor={isCancelFor} label={'AIRMET'} />
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
          {isWindNeeded
            ? <span data-field='wind_direction'>
              {wind && wind.direction && Number.isInteger(wind.direction.val)
                ? `${this.getValueLabel(wind.direction.val, wind.direction.unit, true)} ${this.getUnitLabel(wind.direction.unit)}`
                : '(no direction provided)'
              }
            </span>
            : null
          }
          {isWindNeeded
            ? <span data-field='wind_speed'>
              {wind && wind.speed && Number.isInteger(wind.speed.val) &&
                typeof wind.speed.unit === 'string'
                ? `${this.getValueLabel(wind.speed.val, wind.speed.unit, true)} ${this.getUnitLabel(wind.speed.unit)}`
                : '(no speed provided)'
              }
            </span>
            : null
          }
          {isObscuringNeeded
            ? <span data-field='visibility'>
              {visibility && Number.isInteger(visibility.val)
                ? `${this.getValueLabel(visibility.val, visibility.unit, true)} ${this.getUnitLabel(visibility.unit)}`
                : '(no visibility provided)'
              }
            </span>
            : null
          }
          {isObscuringNeeded
            ? <span data-field='obscuring'>
              {selectedObscuringPhenomenon && typeof selectedObscuringPhenomenon.code === 'string'
                ? selectedObscuringPhenomenon.code
                : '(no cause provided)'
              }
            </span>
            : null
          }
          {isCloudLevelsNeeded
            ? cloudLevels
              ? <CompactedHeightsSection data-field='cloud_levels'>
                <span data-field='complete'>{this.showCloudLevels(cloudLevels)}</span>
              </CompactedHeightsSection>
              : <CompactedHeightsSection data-field='cloud_levels'>
                <span data-field='complete'>{'(no cloud levels provided)'}</span>
              </CompactedHeightsSection>
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

        {isLevelFieldNeeded
          ? <HeightSection>
            <span data-field='level'>{this.showLevels(levelinfo)}</span>
          </HeightSection>
          : null
        }

        <ProgressSection>
          <span data-field='movement'>
            {this.showProgress()}
          </span>
        </ProgressSection>
        {movementType === MOVEMENT_TYPES.MOVEMENT
          ? <MovementSection>
            <span data-field='speed' >{movement.speed}KT</span>
            <span data-field='direction'>{directionLongName}</span>
          </MovementSection>
          : null
        }
        <ChangeSection>
          <span data-field='change_type'>
            {selectedChangeLabel || '(no change assigned yet)'}
          </span>
        </ChangeSection>

        <IssueSection>
          {issuedate
            ? <Moment format={DATETIME_LABEL_FORMAT_UTC} date={issuedate} data-field='issuedate' utc />
            : <span data-field='issuedate'>(not yet issued)</span>
          }
          <span data-field='issueLocation'>{locationIndicatorMwo}</span>
          <span data-field='sequence'>{sequence < 1 ? '(not yet issued)' : sequence}</span>
          <span className='tac' data-field='tac' title={tac}>{tac}</span>
          <span data-field='distribution_type'>
            {typeof distributionType === 'string' && distributionType.length > 0
              ? distributionType
              : '(no type assigned yet)'}
          </span>
        </IssueSection>

        <ActionSection colSize={2}>
          {abilityCtAs.map((ability) =>
            <Button key={`action-${ability.dataField}`}
              data-field={ability.dataField}
              color='primary'
              disabled={ability.disabled}
              onClick={(evt) => dispatch(actions[ability.action](evt, uuid, ability.parameter))}>
              {ability.label}
            </Button>
          )}
        </ActionSection>
      </Col>
      {modalConfig
        ? <ConfirmationModal config={modalConfig} dispatch={dispatch} actions={actions}
          identifier={`this${modalConfig.type === MODAL_TYPES.TYPE_CONFIRM_PUBLISH ? ` [ ${distributionType.toLowerCase()} ] -` : ''} AIRMET for ${phenomenon}`} />
        : null
      }
    </Button>;
  }
}

const abilitiesPropTypes = {};
Object.values(READ_ABILITIES).forEach(ability => {
  abilitiesPropTypes[ability.check] = PropTypes.bool;
});

AirmetReadMode.propTypes = {
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    editAirmetAction: PropTypes.func,
    publishAirmetAction: PropTypes.func,
    cancelAirmetAction: PropTypes.func,
    deleteAirmetAction: PropTypes.func,
    focusAirmetAction: PropTypes.func
  }),
  abilities: PropTypes.shape(abilitiesPropTypes),
  focus: PropTypes.bool,
  copiedAirmetRef: PropTypes.string,
  maxHoursInAdvance: PropTypes.number,
  maxHoursDuration: PropTypes.number,
  hasStartCoordinates: PropTypes.bool,
  hasStartIntersectionCoordinates: PropTypes.bool,
  isCancelFor: PropTypes.number,
  displayModal: PropTypes.string,
  adjacentFirs: PropTypes.arrayOf(PropTypes.string),
  airmet: AIRMET_TYPES.AIRMET,
  isWindNeeded: PropTypes.bool,
  isCloudLevelsNeeded: PropTypes.bool,
  isObscuringNeeded: PropTypes.bool,
  isLevelFieldNeeded: PropTypes.bool
};

export default AirmetReadMode;
