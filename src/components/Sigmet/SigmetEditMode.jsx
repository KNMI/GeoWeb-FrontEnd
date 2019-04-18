import React, { PureComponent } from 'react';
import {
  Button, Col, InputGroup, InputGroupAddon, Input, ButtonDropdown,
  DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import TimePicker from '../Basis/DateTimePicker';
import produce from 'immer';
import moment from 'moment';
import classNames from 'classnames';
import cloneDeep from 'lodash.clonedeep';
import PropTypes from 'prop-types';
import { EDIT_ABILITIES, byEditAbilities, MODALS } from '../../containers/Sigmet/SigmetActions';
import Icon from 'react-fa';
import Checkbox from '../Basis/Checkbox';
import RadioGroup from '../Basis/RadioGroup';
import Switch from '../Basis/Switch';
import HeaderSection from '../SectionTemplates/HeaderSection';
import WhatSection from '../SectionTemplates/WhatSection';
import ValiditySection from '../SectionTemplates/ValiditySection';
import ActionSection from '../SectionTemplates/ActionSection';
import FirSection from '../SectionTemplates/FirSection';
import DrawSection from '../SectionTemplates/DrawSection';
import ProgressSection from '../SectionTemplates/ProgressSection';
import MovementSection from '../SectionTemplates/MovementSection';
import IssueSection from '../SectionTemplates/IssueSection';
import ConfirmationModal from '../ConfirmationModal';
import ChangeSection from '../SectionTemplates/ChangeSection';
import HeightsSection from '../SectionTemplates/HeightsSection';
import {
  DIRECTIONS, UNITS_ALT, UNITS, MODES_LVL, MODES_LVL_OPTIONS, CHANGE_OPTIONS, MOVEMENT_TYPES, MOVEMENT_OPTIONS, SIGMET_TYPES,
  DISTRIBUTION_OPTIONS, dateRanges } from './SigmetTemplates';
import { DATETIME_FORMAT } from '../../config/DayTimeConfig';
import EndPositionSection from '../SectionTemplates/EndPositionSection';

const DROP_DOWN_NAMES = {
  AT_OR_ABOVE: 'atOrAbove',
  BETWEEN_LOWER: 'betweenLower',
  BETWEEN_UPPER: 'betweenUpper'
};

class SigmetEditMode extends PureComponent {
  constructor (props) {
    super(props);
    this.toggleDropDown = this.toggleDropDown.bind(this);
    this.setMode = this.setMode.bind(this);
    this.getMode = this.getMode.bind(this);
    this.getUnitLabel = this.getUnitLabel.bind(this);
    this.maxLevelPerUnit = this.maxLevelPerUnit.bind(this);
    this.stepLevelPerUnit = this.stepLevelPerUnit.bind(this);
    this.formatLevelPerUnit = this.formatLevelPerUnit.bind(this);
    this.state = {
      isAtOrAboveDropDownOpen: false,
      isBetweenLowerDropDownOpen: false,
      isBetweenUpperDropDownOpen: false
    };
  }

  toggleDropDown (dropDownName) {
    let flag = null;
    switch (dropDownName) {
      case DROP_DOWN_NAMES.AT_OR_ABOVE:
        flag = 'isAtOrAboveDropDownOpen';
        break;
      case DROP_DOWN_NAMES.BETWEEN_LOWER:
        flag = 'isBetweenLowerDropDownOpen';
        break;
      case DROP_DOWN_NAMES.BETWEEN_UPPER:
        flag = 'isBetweenUpperDropDownOpen';
        break;
    }
    if (flag) {
      this.setState({
        [flag]: !this.state[flag]
      });
    }
  }

  setMode (evt, selectedOption = null) {
    const { dispatch, actions } = this.props;
    const { uuid } = this.props.sigmet;
    const currentMode = this.getMode();
    if (!evt || !evt.target) {
      return;
    }
    let newMode = null;
    if (evt.target.dataset.field === 'level-mode-toggle' && [MODES_LVL.BETW, MODES_LVL.AT, MODES_LVL.ABV, MODES_LVL.BLW].includes(selectedOption)) {
      newMode = produce(currentMode, (draftState) => { draftState.extent = selectedOption; });
    } else if (evt.target.dataset.field === 'tops-toggle') {
      newMode = produce(currentMode, (draftState) => { draftState.hasTops = !!evt.target.checked; });
    } else if (evt.target.dataset.field === 'between-lev-1') {
      newMode = produce(currentMode, (draftState) => { draftState.hasSurface = !evt.target.checked; });
    }
    if (newMode !== null) {
      let result = null;
      if (newMode.extent === MODES_LVL.BETW) {
        result = newMode.hasSurface ? MODES_LVL.BETW_SFC : MODES_LVL.BETW;
      } else if (!newMode.hasTops) {
        result = newMode.extent;
      } else {
        switch (newMode.extent) {
          case MODES_LVL.AT:
            result = MODES_LVL.TOPS;
            break;
          case MODES_LVL.ABV:
            result = MODES_LVL.TOPS_ABV;
            break;
          case MODES_LVL.BLW:
            result = MODES_LVL.TOPS_BLW;
            break;
          default:
            console.warn('Set level mode called with not supported extent:', newMode.extent);
            return;
        }
      }
      dispatch(actions.updateSigmetAction(uuid, 'levelinfo.mode', result));
    }
  };

  getMode () {
    const { levelinfo } = this.props.sigmet;
    const result = {
      extent: MODES_LVL.AT,
      hasTops: false,
      hasSurface: false
    };
    if ([MODES_LVL.BETW, MODES_LVL.BETW_SFC].includes(levelinfo.mode)) {
      result.extent = MODES_LVL.BETW;
    }
    if ([MODES_LVL.ABV, MODES_LVL.TOPS_ABV].includes(levelinfo.mode)) {
      result.extent = MODES_LVL.ABV;
    }
    if ([MODES_LVL.BLW, MODES_LVL.TOPS_BLW].includes(levelinfo.mode)) {
      result.extent = MODES_LVL.BLW;
    }
    if ([MODES_LVL.TOPS_BLW, MODES_LVL.TOPS, MODES_LVL.TOPS_ABV].includes(levelinfo.mode)) {
      result.hasTops = true;
    }
    if ([MODES_LVL.BETW_SFC].includes(levelinfo.mode)) {
      result.hasSurface = true;
    }
    return result;
  }

  getUnitLabel (unitName) {
    return UNITS_ALT.find((unit) => unit.unit === unitName).label;
  };

  maxLevelPerUnit (unit) {
    switch (unit) {
      case UNITS.FL:
        return 999;
      case UNITS.M:
        return 9999;
      case UNITS.FT:
        return 99999;
      default:
        return null;
    }
  };

  stepLevelPerUnit (unit) {
    switch (unit) {
      case UNITS.FL:
        return 10;
      case UNITS.M:
      case UNITS.FT:
        return 100;
      default:
        return null;
    }
  };

  formatLevelPerUnit (value, unit) {
    if (typeof value !== 'number') {
      return value;
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

  /**
 * Compose the specific configuration for the confirmation modal
 * @param {string} displayModal The name of the modal to display
 * @param {string} uuid The identifier for the focussed SIGMET
 * @returns {Object} The configuration for the confirmation modal
 */
  getModalConfig (displayModal, uuid) {
    const modalEntries = Object.entries(MODALS).filter((modalEntry) => modalEntry[1].type === displayModal);
    return Array.isArray(modalEntries) && modalEntries.length > 0 ? produce(modalEntries[0][1], draftState => {
      if (draftState.button) {
        draftState.button.arguments = uuid; /* Used in action dispatch with right arguments */
      }
    }) : null;
  }

  /**
* Add disabled flag to abilities
* @param {object} ability The ability to provide the flag for
* @param {boolean} isInValidityPeriod Whether or not the referred Sigmet is active
* @param {string} selectedPhenomenon The phenomenon which is selected
* @returns {object} Object with {boolean} property disable, indicating whether or not is should be disabled
*          and {string} property message to explain why...
*/
  getDisabledFlag (abilityRef, isInValidityPeriod, selectedPhenomenon) {
    const { copiedSigmetRef, hasEdits } = this.props;
    const { validdate, validdate_end: validdateEnd, obs_or_forecast: obsOrForecast } = this.props.sigmet;
    const obsFcTime = obsOrForecast ? obsOrForecast.obsFcTime : null;
    if (!abilityRef) {
      return false;
    }
    switch (abilityRef) {
      case EDIT_ABILITIES.PASTE['dataField']:
        return !copiedSigmetRef;
      case EDIT_ABILITIES.DISCARD['dataField']:
        return !hasEdits;
      case EDIT_ABILITIES.SAVE['dataField']:
        return !hasEdits || !selectedPhenomenon || (obsFcTime !== null && !moment(obsFcTime, DATETIME_FORMAT).isValid()) ||
          !moment(validdate, DATETIME_FORMAT).isValid() || !moment(validdateEnd, DATETIME_FORMAT).isValid();
      default:
        return false;
    }
  }

  /**
   * Reduce the available abilities for this specific Sigmet
   * @param {string} selectedPhenomenon The selectedPhenomenon
   * @returns {array} The remaining abilities for this specific Sigmet
   */
  reduceAbilities (selectedPhenomenon) {
    const { abilities } = this.props;
    const { validdate, validdate_end: validdateEnd } = this.props.sigmet;
    const abilitiesCtAs = []; // CtA = Call To Action
    const now = moment.utc();
    const isInValidityPeriod = !now.isBefore(validdate) && !now.isAfter(validdateEnd);
    if (focus) {
      Object.values(EDIT_ABILITIES).forEach((ability) => {
        if (abilities[ability.check] === true) {
          ability.disabled = this.getDisabledFlag(ability.dataField, isInValidityPeriod, selectedPhenomenon);
          abilitiesCtAs.push(ability);
        }
      });
      abilitiesCtAs.sort(byEditAbilities);
    }
    return abilitiesCtAs;
  }

  render () {
    const { dispatch, actions, sigmet, displayModal, availablePhenomena, hasStartCoordinates, hasEndCoordinates, feedbackStart, feedbackEnd,
      availableFirs, focus, isVolcanicAsh, volcanoCoordinates, maxHoursInAdvance, maxHoursDuration } = this.props;
    const { isAtOrAboveDropDownOpen, isBetweenLowerDropDownOpen, isBetweenUpperDropDownOpen } = this.state;

    const { phenomenon, uuid, type: distributionType, validdate, validdate_end: validdateEnd,
      location_indicator_icao: locationIndicatorIcao, location_indicator_mwo: locationIndicatorMwo,
      levelinfo, movement_type: movementType, movement, change, tac, va_extra_fields: vaExtraFields, obs_or_forecast: obsOrForecast } = sigmet;
    const { no_va_expected: isNoVolcanicAshExpected, volcano } = vaExtraFields;
    const volcanoName = volcano.name || null;
    const obsFcTime = obsOrForecast ? obsOrForecast.obsFcTime : null;
    const isObserved = obsOrForecast ? obsOrForecast.obs : null;

    const now = moment.utc();
    const dateLimits = dateRanges(now, validdate, validdateEnd, maxHoursInAdvance, maxHoursDuration);
    const selectedPhenomenon = availablePhenomena.find((ph) => ph.code === phenomenon);
    const selectedFir = availableFirs.find((fir) => fir.location_indicator_icao === locationIndicatorIcao);
    const selectedDirection = movement && movement.dir ? DIRECTIONS.find((dir) => dir.shortName === movement.dir) : null;
    const levelMode = this.getMode();
    const isLevelBetween = levelMode.extent === MODES_LVL.BETW;
    const atOrAboveOption = MODES_LVL_OPTIONS.find((option) => option.optionId === levelMode.extent && option.optionId !== MODES_LVL.BETW);
    const atOrAboveLabel = atOrAboveOption ? atOrAboveOption.label : '';
    const movementOptions = cloneDeep(MOVEMENT_OPTIONS);
    if (isVolcanicAsh && isNoVolcanicAshExpected === true) {
      const forecastOptionIndex = movementOptions.findIndex((item) => item.optionId === MOVEMENT_TYPES.FORECAST_POSITION);
      if (forecastOptionIndex !== -1) {
        movementOptions[forecastOptionIndex].disabled = true;
      }
    }
    const drawActions = (isEndFeature = false) => [
      {
        title: `Draw point${!selectedFir ? ' (select a FIR first)' : ''}`,
        action: 'select-point',
        icon: 'circle',
        disabled: !selectedFir
      },
      {
        title: `Draw region${!selectedFir ? ' (select a FIR first)' : ''}`,
        action: 'select-region',
        icon: 'retweet',
        disabled: !selectedFir
      },
      {
        title: `Draw polygon${!selectedFir ? ' (select a FIR first)' : ''}`,
        action: 'select-shape',
        icon: 'pencil',
        disabled: !selectedFir
      },
      {
        title: `Draw contour for entire FIR${!selectedFir ? ' (select a FIR first)' : ''}`,
        action: 'select-fir',
        icon: 'globe',
        disabled: !selectedFir
      },
      {
        title: `Delete drawing${(isEndFeature ? hasEndCoordinates : hasStartCoordinates) ? '' : ' (nothing to delete)'}`,
        action: 'delete-selection',
        icon: 'trash',
        disabled: isEndFeature ? !hasEndCoordinates : !hasStartCoordinates
      }
    ];
    const messagePrefix = 'Use one of these drawing tools to indicate on the map where the phenomenon is';
    const drawMessage = (isEndDrawing) => !isEndDrawing
      ? !hasStartCoordinates
        ? `${messagePrefix} ${isObserved ? 'observed' : 'expected to occur'}.`
        : feedbackStart || ''
      : movementType === MOVEMENT_TYPES.FORECAST_POSITION && !hasEndCoordinates
        ? `${messagePrefix} expected to be at the end of the valid period.`
        : feedbackEnd || '';
    const abilityCtAs = this.reduceAbilities(selectedPhenomenon); // CtA = Call To Action
    const modalConfig = this.getModalConfig(displayModal, uuid);
    return <Button tag='div' className={`Sigmet row${focus ? ' focus' : ''}`} id={uuid}
      onClick={!focus ? (evt) => dispatch(actions.focusSigmetAction(evt, uuid)) : null}>
      <Col>
        <HeaderSection label={'SIGMET'} />
        <WhatSection>
          <Typeahead filterBy={['name', 'code']} labelKey='name' data-field='phenomenon'
            options={availablePhenomena} placeholder={'Select phenomenon'}
            onFocus={() => dispatch(actions.updateSigmetAction(uuid, 'phenomenon', []))}
            onChange={(selectedValues) => dispatch(actions.updateSigmetAction(uuid, 'phenomenon', selectedValues))}
            selected={selectedPhenomenon ? [selectedPhenomenon] : []}
            className={!selectedPhenomenon ? 'missing' : null}
            clearButton />
          <Switch
            value={isObserved ? 'obs' : 'fcst'}
            checkedOption={{ optionId: 'fcst', label: 'Forecast' }}
            unCheckedOption={{ optionId: 'obs', label: 'Observed' }}
            onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'obs_or_forecast', { obs: !evt.target.checked, obsFcTime: obsFcTime }))}
            data-field='obs_or_fcst'
          />
          <TimePicker data-field='obsFcTime' utc
            value={moment(obsFcTime, DATETIME_FORMAT).isValid()
              ? moment.utc(obsFcTime, DATETIME_FORMAT)
              : obsFcTime
            }
            onChange={(evt, timestamp) => dispatch(actions.updateSigmetAction(uuid, 'obs_or_forecast', { obs: isObserved, obsFcTime: timestamp }))}
            min={dateLimits.obsFcTime.min}
            max={dateLimits.obsFcTime.max}
          />
          {isVolcanicAsh
            ? <Input type='text' value={volcanoName || ''} data-field='volcano_name' placeholder='Volcano name'
              onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'va_extra_fields.volcano.name', evt.target.value))}
            />
            : null
          }
          {isVolcanicAsh
            ? <Input type='number' placeholder='00.0' step='0.1'
              value={Array.isArray(volcanoCoordinates) && volcanoCoordinates.length > 0 && volcanoCoordinates[0] !== null ? volcanoCoordinates[0] : ''}
              data-field='volcano_coordinates_lat'
              onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'va_extra_fields.volcano.position.0', evt.target.value || null))}
            />
            : null
          }
          {isVolcanicAsh
            ? <Input type='number' placeholder='000.0' step='0.1'
              value={Array.isArray(volcanoCoordinates) && volcanoCoordinates.length > 1 && volcanoCoordinates[1] !== null ? volcanoCoordinates[1] : ''}
              data-field='volcano_coordinates_lon'
              onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'va_extra_fields.volcano.position.1', evt.target.value || null))}
            />
            : null
          }
        </WhatSection>

        <ValiditySection>
          <TimePicker data-field='validdate' utc required
            value={moment(validdate, DATETIME_FORMAT).isValid()
              ? moment.utc(validdate, DATETIME_FORMAT)
              : validdate
            }
            onChange={(evt, timestamp) => dispatch(actions.updateSigmetAction(uuid, 'validdate', timestamp))}
            min={dateLimits.validDate.min}
            max={dateLimits.validDate.max}
          />
          <TimePicker data-field='validdate_end' utc required
            value={moment(validdateEnd, DATETIME_FORMAT).isValid()
              ? moment.utc(validdateEnd, DATETIME_FORMAT)
              : validdateEnd
            }
            onChange={(evt, timestamp) => dispatch(actions.updateSigmetAction(uuid, 'validdate_end', timestamp))}
            min={dateLimits.validDateEnd.min}
            max={dateLimits.validDateEnd.max}
          />
        </ValiditySection>

        <FirSection>
          <Typeahead filterBy={['firname', 'location_indicator_icao']} labelKey='firname' data-field='firname'
            options={availableFirs}
            onFocus={() => {
              dispatch(actions.updateSigmetAction(uuid, 'firname', null));
              dispatch(actions.updateSigmetAction(uuid, 'location_indicator_icao', null));
            }}
            onChange={(firList) => {
              let firname = null;
              let locationIndicatorIcao = null;
              if (firList.length === 1) {
                firname = firList[0].firname;
                locationIndicatorIcao = firList[0].location_indicator_icao;
              }
              dispatch(actions.updateSigmetAction(uuid, 'firname', firname));
              dispatch(actions.updateSigmetAction(uuid, 'location_indicator_icao', locationIndicatorIcao));
            }}
            selected={selectedFir ? [selectedFir] : []} placeholder={'Select FIR'}
            className={!selectedFir ? 'missing' : null}
            clearButton />
          <span data-field='location_indicator_icao'>{locationIndicatorIcao}</span>
        </FirSection>

        <DrawSection className={`required${hasStartCoordinates ? '' : ' missing'}${feedbackStart ? ' warning' : ''}`} title={drawMessage()}>
          {
            drawActions().map((actionItem, index) =>
              <Button color='primary' key={actionItem.action + '_button'} data-field={actionItem.action + '_button'}
                active={actionItem.action === this.props.drawModeStart} disabled={actionItem.disabled || null}
                id={actionItem.action + '_button'} title={actionItem.title} onClick={(evt) => dispatch(actions.drawAction(evt, uuid, actionItem.action, 'start'))}>
                <Icon name={actionItem.icon} />
              </Button>
            )
          }
        </DrawSection>

        <HeightsSection isLevelBetween={isLevelBetween} hasSurface={levelMode.hasSurface}>
          <RadioGroup
            value={levelMode.extent}
            options={MODES_LVL_OPTIONS}
            onChange={this.setMode}
            data-field='level-mode-toggle'
          />
          <Checkbox
            value={levelMode.hasTops ? 'tops' : ''}
            option={{ optionId: 'tops', label: 'Tops' }}
            onChange={this.setMode}
            data-field='tops-toggle'
            disabled={isLevelBetween}
          />
          <label data-field='at-above-toggle'>{atOrAboveLabel}</label>
          <InputGroup data-field='at-above-altitude'
            className={!isLevelBetween && levelinfo && levelinfo.levels && levelinfo.levels[0] &&
              (!levelinfo.levels[0].value || levelinfo.levels[0].value > this.maxLevelPerUnit(levelinfo.levels[0].unit)) ? 'missing' : null}
            disabled={isLevelBetween}>
            <InputGroupAddon addonType='prepend'>
              <ButtonDropdown toggle={() => this.toggleDropDown(DROP_DOWN_NAMES.AT_OR_ABOVE)} isOpen={isAtOrAboveDropDownOpen}>
                <DropdownToggle caret disabled={isLevelBetween}>
                  {this.getUnitLabel(levelinfo.levels[0].unit)}
                </DropdownToggle>
                <DropdownMenu>
                  {UNITS_ALT.map((unit, index) =>
                    <DropdownItem key={`unitDropDown-${index}`}
                      onClick={(evt) => dispatch(actions.updateSigmetAction(uuid, 'levelinfo.levels.0.unit', unit))}>{unit.label}</DropdownItem>
                  )}
                </DropdownMenu>
              </ButtonDropdown>
            </InputGroupAddon>
            <Input placeholder='Level' disabled={isLevelBetween} type='number' pattern='\d{0,5}'
              min='0' step={this.stepLevelPerUnit(levelinfo.levels[0].unit)} max={this.maxLevelPerUnit(levelinfo.levels[0].unit)}
              value={(isLevelBetween || !levelinfo.levels[0].value) ? '' : this.formatLevelPerUnit(levelinfo.levels[0].value, levelinfo.levels[0].unit)}
              onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'levelinfo.levels.0.value', evt.target.value))} />
          </InputGroup>
          <Switch
            className={isLevelBetween && !levelMode.hasSurface &&
              levelinfo && levelinfo.levels && levelinfo.levels[0] &&
              (!levelinfo.levels[0].value || levelinfo.levels[0].value > this.maxLevelPerUnit(levelinfo.levels[0].unit)) ? 'missing' : null}
            value={levelMode.hasSurface ? 'sfc' : 'lvl'}
            checkedOption={{
              optionId: 'lvl',
              label: <InputGroup className='label'>
                <InputGroupAddon addonType='prepend'>
                  <ButtonDropdown toggle={() => this.toggleDropDown(DROP_DOWN_NAMES.BETWEEN_LOWER)} isOpen={isBetweenLowerDropDownOpen}>
                    <DropdownToggle caret disabled={!isLevelBetween || levelMode.hasSurface}>
                      {this.getUnitLabel(levelinfo.levels[0].unit)}
                    </DropdownToggle>
                    <DropdownMenu>
                      {UNITS_ALT.map((unit, index) =>
                        <DropdownItem key={`unitDropDown-${index}`}
                          onClick={(evt) => {
                            evt.preventDefault(); // prevent the switch from being triggered
                            return dispatch(actions.updateSigmetAction(uuid, 'levelinfo.levels.0.unit', unit));
                          }}>{unit.label}</DropdownItem>
                      )}
                    </DropdownMenu>
                  </ButtonDropdown>
                </InputGroupAddon>
                <Input placeholder='Lower level' disabled={!isLevelBetween || levelMode.hasSurface} type='number'
                  min='0' step={this.stepLevelPerUnit(levelinfo.levels[0].unit)} max={this.maxLevelPerUnit(levelinfo.levels[0].unit)}
                  value={(!isLevelBetween || levelMode.hasSurface || !levelinfo.levels[0].value)
                    ? ''
                    : this.formatLevelPerUnit(levelinfo.levels[0].value, levelinfo.levels[0].unit)}
                  onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'levelinfo.levels.0.value', evt.target.value))} />
              </InputGroup>
            }}
            unCheckedOption={{ optionId: 'sfc', label: 'SFC' }}
            onChange={this.setMode}
            disabled={!isLevelBetween}
            data-field='between-lev-1'
          />
          <InputGroup
            data-field='between-lev-2'
            className={isLevelBetween && levelinfo && levelinfo.levels && levelinfo.levels[1] && !levelinfo.levels[1].value ? 'missing' : null}
            disabled={!isLevelBetween}>
            <InputGroupAddon addonType='prepend'>
              <ButtonDropdown toggle={() => this.toggleDropDown(DROP_DOWN_NAMES.BETWEEN_UPPER)} isOpen={isBetweenUpperDropDownOpen}>
                <DropdownToggle caret disabled={!isLevelBetween}>
                  {this.getUnitLabel(levelinfo.levels[1].unit)}
                </DropdownToggle>
                <DropdownMenu>
                  {UNITS_ALT.map((unit, index) =>
                    <DropdownItem key={`unitDropDown-${index}`}
                      onClick={(evt) => dispatch(actions.updateSigmetAction(uuid, 'levelinfo.levels.1.unit', unit))}>{unit.label}</DropdownItem>
                  )}
                </DropdownMenu>
              </ButtonDropdown>
            </InputGroupAddon>
            <Input placeholder='Upper level' disabled={!isLevelBetween} type='number'
              min='0' step={this.stepLevelPerUnit(levelinfo.levels[1].unit)} max={this.maxLevelPerUnit(levelinfo.levels[1].unit)}
              value={(!isLevelBetween || !levelinfo.levels[1].value) ? '' : this.formatLevelPerUnit(levelinfo.levels[1].value, levelinfo.levels[1].unit)}
              onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'levelinfo.levels.1.value', evt.target.value))} />
          </InputGroup>
        </HeightsSection>

        <ProgressSection>
          {isVolcanicAsh
            ? <Checkbox
              value={isNoVolcanicAshExpected ? 'noVA' : ''}
              option={{ optionId: 'noVA', label: 'No volcanic ash expected' }}
              onChange={(evt, selectedOption = null) => dispatch(actions.updateSigmetAction(uuid, 'va_extra_fields.no_va_expected', !!evt.target.checked))}
              data-field='no_va_expected'
            />
            : null
          }
          <RadioGroup
            value={movementType}
            options={movementOptions}
            onChange={(evt, selectedOption = null) => dispatch(actions.updateSigmetAction(uuid, 'movement_type', selectedOption))}
            data-field='movement'
          />
        </ProgressSection>

        <MovementSection disabled={movementType !== MOVEMENT_TYPES.MOVEMENT}>
          <Typeahead filterBy={['shortName', 'longName']} labelKey='longName' data-field='direction'
            options={DIRECTIONS} placeholder={'Set direction'} disabled={movementType !== MOVEMENT_TYPES.MOVEMENT}
            onFocus={() => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, dir: null }))}
            onChange={(selectedval) =>
              dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, dir: selectedval.length > 0 ? selectedval[0].shortName : null }))}
            selected={selectedDirection ? [selectedDirection] : []}
            className={classNames({
              required: movementType === MOVEMENT_TYPES.MOVEMENT,
              missing: movementType === MOVEMENT_TYPES.MOVEMENT && !selectedDirection
            })}
            clearButton
          />
          <InputGroup data-field='speed'
            className={classNames('unitAfter', {
              required: movementType === MOVEMENT_TYPES.MOVEMENT,
              missing: movementType === MOVEMENT_TYPES.MOVEMENT && !movement.speed
            })}
            disabled={movementType !== MOVEMENT_TYPES.MOVEMENT}>
            <Input onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, speed: parseInt(evt.target.value) }))}
              value={(!movement || !movement.speed) ? '' : movement.speed} placeholder={'Set speed'}
              type='number' disabled={movementType !== MOVEMENT_TYPES.MOVEMENT}
              step='1' min='1'
            />
            <InputGroupAddon addonType='append'>KT</InputGroupAddon>
          </InputGroup>
        </MovementSection>
        <EndPositionSection disabled={movementType !== MOVEMENT_TYPES.FORECAST_POSITION}>
          <DrawSection data-field='drawbar' title={drawMessage(true)}
            className={movementType === MOVEMENT_TYPES.FORECAST_POSITION ? `required${hasEndCoordinates ? '' : ' missing'}${feedbackEnd ? ' warning' : ''}` : ''}>
            {
              drawActions(true).map((actionItem, index) =>
                <Button color='primary' key={actionItem.action + '_button'} data-field={actionItem.action + '_button'}
                  active={actionItem.action === this.props.drawModeEnd}
                  disabled={actionItem.disabled || movementType !== MOVEMENT_TYPES.FORECAST_POSITION}
                  id={actionItem.action + '_button'}
                  title={`${actionItem.title}${movementType !== MOVEMENT_TYPES.FORECAST_POSITION ? ' (select position mode first)' : ''}`}
                  onClick={(evt) => dispatch(actions.drawAction(evt, uuid, actionItem.action, 'end'))}>
                  <Icon name={actionItem.icon} />
                </Button>
              )
            }
          </DrawSection>
        </EndPositionSection>

        <ChangeSection>
          <RadioGroup
            value={change}
            options={CHANGE_OPTIONS}
            onChange={(evt, selectedOption = null) => dispatch(actions.updateSigmetAction(uuid, 'change', selectedOption))}
            data-field='change_type'
          />
        </ChangeSection>

        <IssueSection>
          <span data-field='issuedate'>(Not yet published)</span>
          <span data-field='issueLocation'>{locationIndicatorMwo}</span>
          <span className='tac' data-field='tac' title={tac}>{tac}</span>
          <RadioGroup
            value={distributionType}
            options={DISTRIBUTION_OPTIONS}
            onChange={(evt, selectedOption = null) => dispatch(actions.updateSigmetAction(uuid, 'type', selectedOption))}
            data-field='distribution_type'
          />
        </IssueSection>

        <ActionSection colSize={3}>
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
          identifier={`the SIGMET for ${phenomenon}`} />
        : null
      }
    </Button>;
  }
}

const abilitiesPropTypes = {};
Object.values(EDIT_ABILITIES).forEach(ability => {
  abilitiesPropTypes[ability.check] = PropTypes.bool;
});

SigmetEditMode.propTypes = {
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    saveSigmetAction: PropTypes.func,
    discardSigmetAction: PropTypes.func
  }),
  abilities: PropTypes.shape(abilitiesPropTypes),
  copiedSigmetRef: PropTypes.string,
  hasEdits: PropTypes.bool,
  displayModal: PropTypes.string,
  availablePhenomena: PropTypes.array,
  focus: PropTypes.bool,
  drawModeStart: PropTypes.string,
  drawModeEnd: PropTypes.string,
  feedbackStart: PropTypes.string,
  feedbackEnd: PropTypes.string,
  hasStartCoordinates: PropTypes.bool,
  hasEndCoordinates: PropTypes.bool,
  availableFirs: PropTypes.array,
  maxHoursDuration: PropTypes.number,
  maxHoursInAdvance: PropTypes.number,
  volcanoCoordinates: PropTypes.arrayOf(PropTypes.number),
  isVolcanicAsh: PropTypes.bool,
  sigmet: SIGMET_TYPES.SIGMET
};

export default SigmetEditMode;
