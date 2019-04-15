import React, { PureComponent } from 'react';
import { Button, Col } from 'reactstrap';
import Moment from 'react-moment';
import moment from 'moment';
import produce from 'immer';
import PropTypes from 'prop-types';
import { READ_ABILITIES, byReadAbilities, MODALS, MODAL_TYPES } from '../../containers/Sigmet/SigmetActions';
import { UNITS, UNITS_ALT, DIRECTIONS, MODES_LVL, CHANGE_OPTIONS, MOVEMENT_TYPES, SIGMET_TYPES, dateRanges } from './SigmetTemplates';
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
        return sLevelsInfoMissed;
    }
  };

  showProgress () {
    const { movement_type: movementType } = this.props.sigmet;
    switch (movementType) {
      case MOVEMENT_TYPES.STATIONARY:
        return 'Stationary';
      case MOVEMENT_TYPES.MOVEMENT:
        return 'Moving';
      case MOVEMENT_TYPES.FORECAST_POSITION:
        return 'Movement is defined by area';
      default:
        return '(movement type is not (properly) set)';
    }
  };

  /**
   * Compose the specific configuration for the confirmation modal
   * @param {string} displayModal The name of the modal to display
   * @param {string} uuid The identifier for the focussed SIGMET
   * @param {boolean} isVolcanicAsh Whether or not the focussed SIGMET describes a VA
   * @param {string[]} adjacentFirs A list of identifiers for the adjacent FIRs
   * @returns {Object} The configuration for the confirmation modal
   */
  getModalConfig (displayModal, uuid, isVolcanicAsh, adjacentFirs, moveTo) {
    const modalEntries = Object.entries(MODALS).filter((modalEntry) => modalEntry[1].type === displayModal);
    return Array.isArray(modalEntries) && modalEntries.length > 0 ? produce(modalEntries[0][1], draftState => {
      if (draftState.button) draftState.button.arguments = uuid; /* Used in action dispatch with right arguments */
      if (isVolcanicAsh && draftState && draftState.type === MODAL_TYPES.TYPE_CONFIRM_CANCEL && draftState.optional && Array.isArray(adjacentFirs)) {
        if (Array.isArray(draftState.optional.options)) {
          draftState.optional.options.push(...adjacentFirs.map((firCode) => ({
            optionId: firCode, label: firCode, disabled: false
          })));
        }
        if (Array.isArray(draftState.optional.parameters)) {
          draftState.optional.parameters.push(uuid);
          draftState.optional.parameters.push('va_extra_fields.move_to');
        }
        if (Array.isArray(moveTo) && moveTo.length > 0) {
          draftState.optional.selectedOption = moveTo[0];
        }
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
    const { levelinfo } = this.props.sigmet;
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
    const { hasEndCoordinates, hasEndIntersectionCoordinates } = this.props;
    const { movement_type: movementType, movement } = this.props.sigmet;
    switch (movementType) {
      case MOVEMENT_TYPES.STATIONARY:
        return true;
      case MOVEMENT_TYPES.MOVEMENT:
        return movement && typeof movement.speed === 'number' &&
        typeof movement.dir === 'string' && movement.dir.length > 0;
      case MOVEMENT_TYPES.FORECAST_POSITION:
        return hasEndCoordinates && hasEndIntersectionCoordinates;
      default:
        return false;
    }
  }

  /**
   * Check whether or not the basic values for this specific Sigmet are valid
   * @returns {boolean} Whether or not the basic values in this specific Sigmet are valid
   */
  isValid () {
    const { maxHoursInAdvance, maxHoursDuration, hasStartCoordinates, hasStartIntersectionCoordinates } = this.props;
    const { validdate, validdate_end: validdateEnd, phenomenon, firname, change, type: distributionType } = this.props.sigmet;
    const now = moment.utc();
    const startTimestamp = moment.utc(validdate);
    const endTimestamp = moment.utc(validdateEnd);
    const dateLimits = dateRanges(now, startTimestamp, endTimestamp, maxHoursInAdvance, maxHoursDuration);
    const isStartValid = dateLimits.validDate.min.isSameOrBefore(startTimestamp) &&
      dateLimits.validDate.max.isSameOrAfter(startTimestamp);
    const isEndValid = dateLimits.validDateEnd.min.isSameOrBefore(endTimestamp) &&
      dateLimits.validDateEnd.max.isSameOrAfter(endTimestamp);
    const hasPhenomenon = typeof phenomenon === 'string' && phenomenon.length > 0;
    const hasFir = typeof firname === 'string' && firname.length > 0;
    const hasChange = typeof change === 'string' && change.length > 0;
    const hasType = typeof distributionType === 'string' && distributionType.length > 0;
    return isStartValid && isEndValid && hasStartCoordinates && hasStartIntersectionCoordinates &&
      hasPhenomenon && hasFir && hasChange && hasType && this.isLevelInfoValid() && this.isMovementValid();
  };

  /**
  * Add disabled flag to abilities
  * @param {object} ability The ability to provide the flag for
  * @param {boolean} isInValidityPeriod Whether or not the referred Sigmet is active
  * @returns {boolean} Whether or not is should be disabled
  */
  getDisabledFlag (abilityRef, isInValidityPeriod) {
    const { copiedSigmetRef } = this.props;
    const { uuid } = this.props.sigmet;
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
    const { abilities, isCancelFor } = this.props;
    const { validdate_end: validdateEnd } = this.props.sigmet;
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
    const { dispatch, actions, sigmet, focus, isCancelFor, displayModal, isVolcanicAsh, volcanoCoordinates, adjacentFirs } = this.props;
    const { phenomenon, uuid, type: distributionType, validdate, validdate_end: validdateEnd,
      location_indicator_icao: locationIndicatorIcao, location_indicator_mwo: locationIndicatorMwo,
      levelinfo, movement_type: movementType, movement, change, tac, va_extra_fields: vaExtraFields, obs_or_forecast: obsOrForecast,
      issuedate, sequence, firname } = sigmet;

    const { no_va_expected: isNoVolcanicAshExpected, volcano } = vaExtraFields;
    const volcanoName = volcano.name || null;
    const obsFcTime = obsOrForecast ? obsOrForecast.obsFcTime : null;
    const isObserved = obsOrForecast ? obsOrForecast.obs : null;
    const moveTo = vaExtraFields.move_to;

    const abilityCtAs = this.reduceAbilities(); // CtA = Call To Action
    const selectedDirection = movement && DIRECTIONS.find((obj) => obj.shortName === movement.dir);
    const directionLongName = selectedDirection ? selectedDirection.longName : null;
    const selectedChange = typeof change === 'string' && CHANGE_OPTIONS.find((option) => option.optionId === change);
    const selectedChangeLabel = selectedChange ? selectedChange.label : null;
    const modalConfig = this.getModalConfig(displayModal, uuid, isVolcanicAsh, adjacentFirs, moveTo);
    return <Button tag='div' className={`Sigmet row${focus ? ' focus' : ''}`} onClick={(evt) => dispatch(actions.focusSigmetAction(evt, uuid))}>
      <Col>
        <HeaderSection isCancelFor={isCancelFor} label={'SIGMET'} />
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

        <ProgressSection>
          <span data-field='movement'>
            {this.showProgress()}
          </span>
          {isVolcanicAsh && isNoVolcanicAshExpected
            ? <span data-field='no_va_expected'>No volcanic ash is expected at the end.</span>
            : null
          }
          {isVolcanicAsh && Array.isArray(moveTo) && moveTo.length > 0 && typeof moveTo[0] === 'string' && moveTo[0].length > 0
            ? <span data-field='move_to_fir'>{`Moving to ${moveTo[0]} FIR`}</span>
            : null
          }
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
          identifier={`this${modalConfig.type === MODAL_TYPES.TYPE_CONFIRM_PUBLISH ? ` [ ${distributionType.toLowerCase()} ] -` : ''} SIGMET for ${phenomenon}`} />
        : null
      }
    </Button>;
  }
}

const abilitiesPropTypes = {};
Object.values(READ_ABILITIES).forEach(ability => {
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
  copiedSigmetRef: PropTypes.string,
  maxHoursInAdvance: PropTypes.number,
  maxHoursDuration: PropTypes.number,
  hasStartCoordinates: PropTypes.bool,
  hasStartIntersectionCoordinates: PropTypes.bool,
  hasEndCoordinates: PropTypes.bool,
  hasEndIntersectionCoordinates: PropTypes.bool,
  isCancelFor: PropTypes.number,
  volcanoCoordinates: PropTypes.arrayOf(PropTypes.number),
  isVolcanicAsh: PropTypes.bool,
  displayModal: PropTypes.string,
  adjacentFirs: PropTypes.arrayOf(PropTypes.string),
  sigmet: SIGMET_TYPES.SIGMET
};

export default SigmetReadMode;
