import React, { PureComponent } from 'react';
import {
  Button, Col, InputGroup, InputGroupAddon, Input, InputGroupButton, ButtonDropdown,
  DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import DateTimePicker from 'react-datetime';
import produce from 'immer';
import moment from 'moment';
import PropTypes from 'prop-types';
import { EDIT_ABILITIES, byEditAbilities } from '../../containers/Sigmet/SigmetActions';
import Icon from 'react-fa';
import Checkbox from '../Basis/Checkbox';
import RadioGroup from '../Basis/RadioGroup';
import Switch from '../Basis/Switch';
import HeaderSection from './Sections/HeaderSection';
import WhatSection from './Sections/WhatSection';
import ValiditySection from './Sections/ValiditySection';
import ActionSection from './Sections/ActionSection';
import FirSection from './Sections/FirSection';
import DrawSection from './Sections/DrawSection';
import ProgressSection from './Sections/ProgressSection';
import MovementSection from './Sections/MovementSection';
import IssueSection from './Sections/IssueSection';
import ChangeSection from './Sections/ChangeSection';
import HeightsSection from './Sections/HeightsSection';
import { DIRECTIONS, UNITS_ALT, MODES_LVL, MODES_LVL_OPTIONS, CHANGES, SIGMET_TYPES, SIGMET_TEMPLATES } from './SigmetTemplates';

const DATE_FORMAT = 'DD MMM YYYY';
const TIME_FORMAT = 'HH:mm UTC';
const DATETIME_FORMAT = 'YYYY-MM-DD[T]HH:mm:ss[Z]'; // 2017-08-07T11:30:00Z'

class SigmetEditMode extends PureComponent {
  constructor (props) {
    super(props);
    this.setMode = this.setMode.bind(this);
    this.getMode = this.getMode.bind(this);
    this.getUnitLabel = this.getUnitLabel.bind(this);
    this.isValidStartTimestamp = this.isValidStartTimestamp.bind(this);
    this.isValidEndTimestamp = this.isValidEndTimestamp.bind(this);
    this.isValidObsFcTimestamp = this.isValidObsFcTimestamp.bind(this);
  }

  setMode (evt, selectedOption = null) {
    const { dispatch, actions, uuid } = this.props;
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
      dispatch(actions.updateSigmetLevelAction(uuid, 'mode', result));
    }
  };

  getMode () {
    const { levelinfo } = this.props;
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

  isValidStartTimestamp (timestamp) {
    const { maxHoursInAdvance } = this.props;
    const now = moment.utc();
    return now.clone().subtract(1, 'hour').isSameOrBefore(timestamp) &&
      now.clone().add(maxHoursInAdvance, 'hour').isSameOrAfter(timestamp);
  };

  isValidEndTimestamp (timestamp) {
    const { maxHoursDuration, validdate } = this.props;
    const startTimeStamp = moment.utc(validdate);
    return startTimeStamp.isSameOrBefore(timestamp) &&
      startTimeStamp.clone().add(maxHoursDuration, 'hour').isSameOrAfter(timestamp);
  };

  isValidObsFcTimestamp (timestamp) {
    const { maxHoursInAdvance, maxHoursDuration } = this.props;
    const now = moment.utc();
    return timestamp === null || (now.clone().subtract(1, 'day').isSameOrBefore(timestamp) &&
      now.clone().add(maxHoursInAdvance + maxHoursDuration, 'hour').isSameOrAfter(timestamp));
  };

  /**
* Add disabled flag to abilities
* @param {object} ability The ability to provide the flag for
* @param {boolean} isInValidityPeriod Whether or not the referred Sigmet is active
* @param {string} selectedPhenomenon The phenomenon which is selected
* @returns {boolean} Whether or not is should be disabled
*/
  getDisabledFlag (abilityRef, isInValidityPeriod, selectedPhenomenon) {
    const { copiedSigmetRef, hasEdits, validdate, validdateEnd, obsFcTime } = this.props;
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
    const { abilities, validdate, validdateEnd } = this.props;
    const abilitiesCtAs = []; // CtA = Call To Action
    const now = moment.utc();
    const isInValidityPeriod = !now.isBefore(validdate) && !now.isAfter(validdateEnd);
    if (focus) {
      Object.values(EDIT_ABILITIES).map((ability) => {
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
    const { dispatch, actions, availablePhenomena, useGeometryForEnd, hasStartCoordinates, hasEndCoordinates,
      availableFirs, levelinfo, movement, focus, uuid, locationIndicatorMwo, change, isVolcanicAsh, volcanoName, volcanoCoordinates,
      phenomenon, isObserved, obsFcTime, validdate, maxHoursInAdvance, maxHoursDuration, validdateEnd, locationIndicatorIcao } = this.props;
    const selectedPhenomenon = availablePhenomena.find((ph) => ph.code === phenomenon);
    const selectedFir = availableFirs.find((fir) => fir.location_indicator_icao === locationIndicatorIcao);
    const selectedChange = change ? CHANGES.find((chg) => chg.shortName === change) : null;
    const selectedDirection = movement && movement.dir ? DIRECTIONS.find((dir) => dir.shortName === movement.dir) : null;
    const levelMode = this.getMode();
    const isLevelBetween = levelMode.extent === MODES_LVL.BETW;
    const atOrAboveOption = MODES_LVL_OPTIONS.find((option) => option.optionId === levelMode.extent && option.optionId !== MODES_LVL.BETW);
    const atOrAboveLabel = atOrAboveOption ? atOrAboveOption.label : '';
    const drawActions = (isEndFeature = false) => [
      /* {
        title: `Draw point${!selectedFir ? ' (select a FIR first)' : ''}`,
        action: 'select-point',
        icon: 'circle',
        disabled: !selectedFir
      }, */
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
        : ''
      : movement && !movement.stationary && useGeometryForEnd && !hasEndCoordinates
        ? `${messagePrefix} expected to be at the end of the valid period.`
        : '';
    const now = moment.utc();
    const abilityCtAs = this.reduceAbilities(selectedPhenomenon); // CtA = Call To Action
    return <Button tag='div' className={`Sigmet row${focus ? ' focus' : ''}`} id={uuid} onClick={!focus ? (evt) => dispatch(actions.focusSigmetAction(evt, uuid)) : null}>
      <Col>
        <HeaderSection />
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
          <DateTimePicker dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='obsFcTime'
            viewMode='time'
            value={obsFcTime === null
              ? null
              : moment(obsFcTime, DATETIME_FORMAT).isValid()
                ? moment.utc(obsFcTime)
                : obsFcTime
            }
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'obs_or_forecast',
              { obs: isObserved, obsFcTime: moment.isMoment(time) ? time.format(DATETIME_FORMAT) : time }))}
            onFocus={(evt) => obsFcTime ||
              dispatch(actions.updateSigmetAction(uuid, 'obs_or_forecast', {
                obs: isObserved,
                obsFcTime: now.clone().startOf('minute').add(5 - now.minutes() % 5, 'minutes').format(DATETIME_FORMAT)
              }))}
            isValidDate={(curr, selected) => this.isValidObsFcTimestamp(curr)}
            timeConstraints={{
              hours: {
                min: now.hour() - 1,
                max: (now.hour() + maxHoursInAdvance + maxHoursDuration)
              },
              minutes: {
                step: 5
              }
            }}
            className={!this.isValidObsFcTimestamp(obsFcTime) ? 'missing' : null}
          />
          {isVolcanicAsh
            ? <Input type='text' value={volcanoName || ''} data-field='volcano_name' placeholder='Volcano name'
              onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'volcano_name', evt.target.value))}
            />
            : null
          }
          {isVolcanicAsh
            ? <Input type='number' placeholder='Position' step='0.1'
              value={Array.isArray(volcanoCoordinates) && volcanoCoordinates.length > 1 && volcanoCoordinates[0] !== null ? volcanoCoordinates[0] : ''}
              data-field='volcano_coordinates_lat'
              onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'volcano_coordinates', [evt.target.value, volcanoCoordinates[1]]))}
            />
            : null
          }
          {isVolcanicAsh
            ? <Input type='number' placeholder='Position' step='0.1'
              value={Array.isArray(volcanoCoordinates) && volcanoCoordinates.length > 1 && volcanoCoordinates[1] !== null ? volcanoCoordinates[1] : ''}
              data-field='volcano_coordinates_lon'
              onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'volcano_coordinates', [volcanoCoordinates[0], evt.target.value]))}
            />
            : null
          }
        </WhatSection>

        <ValiditySection>
          <DateTimePicker dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='validdate'
            viewMode='time'
            value={validdate === null
              ? now
              : moment(validdate, DATETIME_FORMAT).isValid()
                ? moment.utc(validdate)
                : validdate
            }
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'validdate',
              moment.isMoment(time) ? time.format(DATETIME_FORMAT) : time))}
            isValidDate={(curr, selected) => this.isValidStartTimestamp(curr)}
            timeConstraints={{
              hours: {
                min: now.hour(),
                max: (now.hour() + maxHoursInAdvance)
              },
              minutes: {
                step: 5
              }
            }}
            className={!this.isValidStartTimestamp(validdate) ? 'missing' : null}
          />
          <DateTimePicker dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='validdate_end'
            viewMode='time'
            value={validdateEnd === null
              ? now
              : moment(validdateEnd, DATETIME_FORMAT).isValid()
                ? moment.utc(validdateEnd)
                : validdateEnd
            }
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'validdate_end',
              moment.isMoment(time) ? time.format(DATETIME_FORMAT) : time))}
            isValidDate={(curr, selected) => this.isValidEndTimestamp(curr)}
            timeConstraints={{
              hours: {
                min: moment.utc(validdate).hour(),
                max: (moment.utc(validdate).hour() + maxHoursDuration)
              },
              minutes: {
                step: 5
              }
            }}
            className={!this.isValidEndTimestamp(validdateEnd) ? 'missing' : null}
          />
        </ValiditySection>

        <FirSection>
          <Typeahead filterBy={['firname', 'location_indicator_icao']} labelKey='firname' data-field='firname'
            options={availableFirs}
            onFocus={() => {
              dispatch(actions.updateSigmetAction(uuid, 'firname', null));
              dispatch(actions.updateSigmetAction(uuid, 'location_indicator_icao', null));
              dispatch(actions.updateFir(null));
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
              dispatch(actions.updateFir(firname));
            }}
            selected={selectedFir ? [selectedFir] : []} placeholder={'Select FIR'}
            className={!selectedFir ? 'missing' : null}
            clearButton />
          <span data-field='location_indicator_icao'>{locationIndicatorIcao}</span>
        </FirSection>

        <DrawSection className={`required${hasStartCoordinates ? '' : ' missing'}`} title={drawMessage()}>
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
            className={!isLevelBetween && levelinfo && levelinfo.levels && levelinfo.levels[0] && !levelinfo.levels[0].value ? 'missing' : null}
            disabled={isLevelBetween}>
            <InputGroupButton>
              <ButtonDropdown toggle={() => null}>
                <DropdownToggle caret disabled={isLevelBetween}>
                  {this.getUnitLabel(levelinfo.levels[0].unit)}
                </DropdownToggle>
                <DropdownMenu>
                  {UNITS_ALT.map((unit, index) =>
                    <DropdownItem key={`unitDropDown-${index}`}
                      onClick={(evt) => dispatch(actions.updateSigmetLevelAction(uuid, 'unit', { unit: unit, isUpperLevel: false }))}>{unit.label}</DropdownItem>
                  )}
                </DropdownMenu>
              </ButtonDropdown>
            </InputGroupButton>
            <Input placeholder='Level' disabled={isLevelBetween} type='number' min='0' step='10'
              value={(isLevelBetween || !levelinfo.levels[0].value) ? '' : levelinfo.levels[0].value}
              onChange={(evt) => dispatch(actions.updateSigmetLevelAction(uuid, 'value', { value: evt.target.value, isUpperLevel: false }))} />
          </InputGroup>
          <Switch
            className={isLevelBetween && !levelMode.hasSurface &&
              levelinfo && levelinfo.levels && levelinfo.levels[0] && !levelinfo.levels[0].value ? 'missing' : ''}
            value={levelMode.hasSurface ? 'sfc' : 'lvl'}
            checkedOption={{
              optionId: 'lvl',
              label: <InputGroup className='label'>
                <InputGroupButton>
                  <ButtonDropdown toggle={() => null}>
                    <DropdownToggle caret disabled={!isLevelBetween || levelMode.hasSurface}>
                      {this.getUnitLabel(levelinfo.levels[0].unit)}
                    </DropdownToggle>
                    <DropdownMenu>
                      {UNITS_ALT.map((unit, index) =>
                        <DropdownItem key={`unitDropDown-${index}`}
                          onClick={(evt) => dispatch(actions.updateSigmetLevelAction(uuid, 'unit', { unit: unit, isUpperLevel: false }))}>{unit.label}</DropdownItem>
                      )}
                    </DropdownMenu>
                  </ButtonDropdown>
                </InputGroupButton>
                <Input placeholder='Level' disabled={!isLevelBetween || levelMode.hasSurface} type='number' min='0' step='10'
                  value={(!isLevelBetween || levelMode.hasSurface || !levelinfo.levels[0].value) ? '' : levelinfo.levels[0].value}
                  onChange={(evt) => dispatch(actions.updateSigmetLevelAction(uuid, 'value', { value: evt.target.value, isUpperLevel: false }))} />
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
            <InputGroupButton>
              <ButtonDropdown toggle={() => null}>
                <DropdownToggle caret disabled={!isLevelBetween}>
                  {this.getUnitLabel(levelinfo.levels[1].unit)}
                </DropdownToggle>
                <DropdownMenu>
                  {UNITS_ALT.map((unit, index) =>
                    <DropdownItem key={`unitDropDown-${index}`}
                      onClick={(evt) => dispatch(actions.updateSigmetLevelAction(uuid, 'unit', { unit: unit, isUpperLevel: true }))}>{unit.label}</DropdownItem>
                  )}
                </DropdownMenu>
              </ButtonDropdown>
            </InputGroupButton>
            <Input placeholder='Level' disabled={!isLevelBetween} type='number' min='0' step='10'
              value={(!isLevelBetween || !levelinfo.levels[1].value) ? '' : levelinfo.levels[1].value}
              onChange={(evt) => dispatch(actions.updateSigmetLevelAction(uuid, 'value', { value: evt.target.value, isUpperLevel: true }))} />
          </InputGroup>
        </HeightsSection>

        <ProgressSection>
          <Switch
            value={movement && !movement.stationary ? 'mov' : 'stat'}
            checkedOption={{ optionId: 'mov', label: 'Move' }}
            unCheckedOption={{ optionId: 'stat', label: 'Stationary' }}
            onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...SIGMET_TEMPLATES.MOVEMENT, stationary: !evt.target.checked }))}
            data-field='movement'
          />
        </ProgressSection>

        <MovementSection disabled={movement && movement.stationary} useGeometryForEnd={useGeometryForEnd}>
          <Switch
            value={useGeometryForEnd ? 'geom' : 'dirsp'}
            checkedOption={{ optionId: 'geom', label: 'End location' }}
            unCheckedOption={{ optionId: 'dirsp', label: 'Direction & speed' }}
            onChange={(evt) => { dispatch(actions.modifyFocussedSigmetAction('useGeometryForEnd', evt.target.checked)); }}
            disabled={movement && movement.stationary}
            data-field='movementType'
          />
          <Typeahead filterBy={['shortName', 'longName']} labelKey='longName' data-field='direction'
            options={DIRECTIONS} placeholder={'Set direction'} disabled={!movement || movement.stationary || useGeometryForEnd}
            onFocus={() => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, dir: null }))}
            onChange={(selectedval) =>
              dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, dir: selectedval.length > 0 ? selectedval[0].shortName : null }))}
            selected={selectedDirection ? [selectedDirection] : []}
            className={movement && !movement.stationary && !useGeometryForEnd && !selectedDirection ? 'missing' : null}
            clearButton
          />
          <InputGroup data-field='speed' className={movement && !movement.stationary && !useGeometryForEnd && !movement.speed ? 'unitAfter missing' : 'unitAfter'}
            disabled={!movement || movement.stationary || useGeometryForEnd}>
            <Input onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, speed: parseInt(evt.target.value) }))}
              value={(!movement || !movement.speed) ? '' : movement.speed}
              type='number' disabled={!movement || movement.stationary || useGeometryForEnd}
              step='1' min='1'
            />
            <InputGroupAddon>KT</InputGroupAddon>
          </InputGroup>
          <DrawSection data-field='drawbar' title={drawMessage(true)}
            className={movement && !movement.stationary && useGeometryForEnd ? `required${hasEndCoordinates ? '' : ' missing'}` : ''}>
            {
              drawActions(true).map((actionItem, index) =>
                <Button color='primary' key={actionItem.action + '_button'} data-field={actionItem.action + '_button'}
                  active={actionItem.action === this.props.drawModeEnd}
                  disabled={actionItem.disabled || !movement || movement.stationary || !useGeometryForEnd}
                  id={actionItem.action + '_button'} title={actionItem.title}
                  onClick={(evt) => dispatch(actions.drawAction(evt, uuid, actionItem.action, 'end'))}>
                  <Icon name={actionItem.icon} />
                </Button>
              )
            }
          </DrawSection>
        </MovementSection>

        <ChangeSection>
          <Typeahead filterBy={['shortName', 'longName']} labelKey='longName' data-field='change'
            options={CHANGES} placeholder={'Select change'}
            onFocus={() => dispatch(actions.updateSigmetAction(uuid, 'change', null))}
            onChange={(selectedValues) => dispatch(actions.updateSigmetAction(uuid, 'change', selectedValues.length > 0 ? selectedValues[0].shortName : null))}
            selected={selectedChange ? [selectedChange] : []}
            className={!selectedChange ? 'missing' : null}
            clearButton />
        </ChangeSection>

        <IssueSection>
          <span data-field='issuedate'>(Not yet published)</span>
          <span data-field='issueLocation'>{locationIndicatorMwo}</span>
        </IssueSection>

        <ActionSection colSize={3}>
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
Object.values(EDIT_ABILITIES).map(ability => {
  abilitiesPropTypes[ability.check] = PropTypes.bool;
});

SigmetEditMode.propTypes = {
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    saveSigmetAction: PropTypes.func
  }),
  abilities: PropTypes.shape(abilitiesPropTypes),
  copiedSigmetRef: PropTypes.string,
  hasEdits: PropTypes.bool,
  availablePhenomena: PropTypes.array,
  focus: PropTypes.bool,
  uuid: PropTypes.string,
  phenomenon: PropTypes.string,
  isObserved: PropTypes.bool,
  obsFcTime: PropTypes.string,
  drawModeStart: PropTypes.string,
  drawModeEnd: PropTypes.string,
  hasStartCoordinates: PropTypes.bool,
  hasEndCoordinates: PropTypes.bool,
  useGeometryForEnd: PropTypes.bool,
  availableFirs: PropTypes.array,
  levelinfo: SIGMET_TYPES.LEVELINFO,
  movement: PropTypes.shape({

  }),
  locationIndicatorMwo: PropTypes.string,
  change: PropTypes.string,
  validdate: PropTypes.string,
  validdateEnd: PropTypes.string,
  maxHoursDuration: PropTypes.number,
  maxHoursInAdvance: PropTypes.number,
  locationIndicatorIcao: PropTypes.string,
  volcanoName: PropTypes.string,
  volcanoCoordinates: PropTypes.arrayOf(PropTypes.number),
  isVolcanicAsh: PropTypes.bool
};

export default SigmetEditMode;
