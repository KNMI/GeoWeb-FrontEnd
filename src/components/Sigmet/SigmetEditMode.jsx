import React, { PureComponent } from 'react';
import {
  Button, Col, Alert, InputGroup, InputGroupAddon, Input, FormGroup, Label, InputGroupButton, ButtonDropdown,
  DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import SwitchButton from 'lyef-switch-button';
import DateTimePicker from 'react-datetime';
import produce from 'immer';
import moment from 'moment';
import PropTypes from 'prop-types';
import { EDIT_ABILITIES, byEditAbilities } from '../../containers/Sigmet/SigmetActions';
import Icon from 'react-fa';
import Checkbox from '../Basis/Checkbox';
import RadioGroup from '../Basis/RadioGroup';
import Switch from '../Basis/Switch';
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
import { DIRECTIONS, UNITS_ALT, MODES_LVL, MODES_LVL_OPTIONS, CHANGES, SIGMET_TYPES } from './SigmetTemplates';

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
    return now.clone().subtract(1, 'day').isSameOrBefore(timestamp) &&
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

  render () {
    const { dispatch, actions, abilities, availablePhenomena, useGeometryForEnd,
      availableFirs, levelinfo, movement, focus, uuid, locationIndicatorMwo, change,
      phenomenon, isObserved, obsFcTime, validdate, maxHoursInAdvance, maxHoursDuration, validdateEnd, locationIndicatorIcao } = this.props;
    const selectedPhenomenon = availablePhenomena.filter((ph) => ph.code === phenomenon).shift();
    const selectedFir = availableFirs.filter((fir) => fir.location_indicator_icao === locationIndicatorIcao).shift();
    const selectedChange = change ? CHANGES.filter((chg) => chg.shortName === change).shift() : null;
    const selectedDirection = movement && movement.dir ? DIRECTIONS.filter((dir) => dir.shortName === movement.dir).shift() : null;
    const levelMode = this.getMode();
    const isLevelBetween = levelMode.extent === MODES_LVL.BETW;
    const atOrAboveOption = MODES_LVL_OPTIONS.find((option) => option.optionId === levelMode.extent && option.optionId !== MODES_LVL.BETW);
    const atOrAboveLabel = atOrAboveOption ? atOrAboveOption.label : '';
    const drawActions = [
      /* {
        title: 'Select point',
        action: 'select-point',
        icon: 'circle'
      }, */
      {
        title: 'Select region',
        action: 'select-region',
        icon: 'retweet'
      },
      {
        title: 'Select shape',
        action: 'select-shape',
        icon: 'pencil'
      },
      {
        title: 'Select entire FIR',
        action: 'select-fir',
        icon: 'globe'
      },
      {
        title: 'Delete selection',
        action: 'delete-selection',
        icon: 'trash'
      }
    ];
    const now = moment.utc();
    const abilityCtAs = []; // CtA = Call to Action
    if (focus) {
      Object.values(EDIT_ABILITIES).map((ability) => {
        if (abilities[ability.check] === true) {
          abilityCtAs.push(ability);
        }
      });
      abilityCtAs.sort(byEditAbilities);
    }
    return <Button tag='div' className={`Sigmet row${focus ? ' focus' : ''}`} id={uuid} onClick={!focus ? (evt) => dispatch(actions.focusSigmetAction(evt, uuid)) : null}>
      <Col>
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
            value={obsFcTime ? moment.utc(obsFcTime) : null}
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'obs_or_forecast',
              { obs: isObserved, obsFcTime: moment.isMoment(time) ? time.format(DATETIME_FORMAT) : null }))}
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
        </WhatSection>

        <ValiditySection>
          <DateTimePicker dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='validdate'
            viewMode='time'
            value={validdate ? moment.utc(validdate) : now}
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'validdate',
              moment.isMoment(time) ? time.format(DATETIME_FORMAT) : null))}
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
            value={validdateEnd ? moment.utc(validdateEnd) : now}
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'validdate_end',
              moment.isMoment(time) ? time.format(DATETIME_FORMAT) : null))}
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
              dispatch(actions.updateSigmetAction(uuid, 'firname', null))
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

        <DrawSection>
          {
            drawActions.map((actionItem, index) =>
              <Button color='primary' key={actionItem.action + '_button'} data-field={actionItem.action + '_button'}
                active={actionItem.action === this.props.drawModeStart} disabled={actionItem.disabled || null}
                id={actionItem.action + '_button'} title={actionItem.title} onClick={(evt) => dispatch(actions.drawAction(evt, uuid, actionItem.action, 'start'))}>
                <Icon name={actionItem.icon} />
              </Button>
            )
          }
          {!this.props.hasStartCoordinates
            ? <Alert data-field='drawing_alert' color='danger'>
                Please use one of the selection tools above to indicate on the map where the phenomenon is {isObserved ? ' observed.' : ' expected to occur.'}
            </Alert>
            : null}
        </DrawSection>

        <HeightsSection isLevelBetween={isLevelBetween}>
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
          <InputGroup data-field='at-above-altitude'>
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
            <Input placeholder='Level' disabled={isLevelBetween} type='number'
              value={(isLevelBetween || !levelinfo.levels[0].value) ? '' : levelinfo.levels[0].value}
              onChange={(evt) => dispatch(actions.updateSigmetLevelAction(uuid, 'value', { value: evt.target.value, isUpperLevel: false }))} />
          </InputGroup>
          <Switch
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
                <Input placeholder='Level' disabled={!isLevelBetween || levelMode.hasSurface} type='number'
                  value={(!isLevelBetween || levelMode.hasSurface || !levelinfo.levels[0].value) ? '' : levelinfo.levels[0].value}
                  onChange={(evt) => dispatch(actions.updateSigmetLevelAction(uuid, 'value', { value: evt.target.value, isUpperLevel: false }))} />
              </InputGroup>
            }}
            unCheckedOption={{ optionId: 'sfc', label: 'SFC' }}
            onChange={this.setMode}
            disabled={!isLevelBetween}
            data-field='between-lev-1'
          />
          <InputGroup data-field='between-lev-2'>
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
            <Input placeholder='Level' disabled={!isLevelBetween} type='number'
              value={(!isLevelBetween || !levelinfo.levels[1].value) ? '' : levelinfo.levels[1].value}
              onChange={(evt) => dispatch(actions.updateSigmetLevelAction(uuid, 'value', { value: evt.target.value, isUpperLevel: true }))} />
          </InputGroup>
        </HeightsSection>

        <ProgressSection>
          <Switch
            value={movement && !movement.stationary ? 'mov' : 'stat'}
            checkedOption={{ optionId: 'mov', label: 'Move' }}
            unCheckedOption={{ optionId: 'stat', label: 'Stationary' }}
            onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, stationary: !evt.target.checked }))}
            data-field='movement'
          />
        </ProgressSection>

        <MovementSection disabled={movement && movement.stationary} useGeometryForEnd={useGeometryForEnd}>
          <Switch
            value={useGeometryForEnd ? 'geom' : 'dirsp'}
            checkedOption={{ optionId: 'geom', label: 'End location' }}
            unCheckedOption={{ optionId: 'dirsp', label: 'Direction & speed' }}
            onChange={(evt) => { dispatch(actions.modifyFocussedSigmet('useGeometryForEnd', evt.target.checked)); }}
            disabled={movement && movement.stationary}
            data-field='movementType'
          />
          <Typeahead filterBy={['shortName', 'longName']} labelKey='longName' data-field='direction'
            options={DIRECTIONS} placeholder={'Set direction'} disabled={!movement || movement.stationary || useGeometryForEnd}
            onFocus={() => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, dir: null }))}
            onChange={(selectedval) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, dir: selectedval[0].shortName }))}
            selected={selectedDirection ? [selectedDirection] : []}
            clearButton />
          <InputGroup data-field='speed'>
            <Input onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, speed: parseInt(evt.target.value) }))}
              value={(!movement || !movement.speed) ? '' : movement.speed}
              type='number' disabled={!movement || movement.stationary || useGeometryForEnd}
              step='1' />
            <InputGroupAddon>KT</InputGroupAddon>
          </InputGroup>
          <DrawSection data-field='drawbar'>
            {
              drawActions.map((actionItem, index) =>
                <Button color='primary' key={actionItem.action + '_button'} data-field={actionItem.action + '_button'}
                  active={actionItem.action === this.props.drawModeEnd} disabled={actionItem.disabled || !movement || movement.stationary || !useGeometryForEnd}
                  id={actionItem.action + '_button'} title={actionItem.title} onClick={(evt) => dispatch(actions.drawAction(evt, uuid, actionItem.action, 'end'))}>
                  <Icon name={actionItem.icon} />
                </Button>
              )
            }

            {movement && !movement.stationary && useGeometryForEnd && !this.props.hasEndCoordinates
              ? <Alert data-field='drawing_alert' color='danger'>
                Please use one of the selection tools above to indicate on the map where the phenomenon is expected to be at the end of the valid period.
              </Alert>
              : null}
          </DrawSection>
        </MovementSection>

        <ChangeSection>
          <Typeahead filterBy={['shortName', 'longName']} labelKey='longName' data-field='change'
            options={CHANGES} placeholder={'Select change'}
            onFocus={() => dispatch(actions.updateSigmetAction(uuid, 'change', null))}
            onChange={(selectedValues) => dispatch(actions.updateSigmetAction(uuid, 'change', selectedValues.length > 0 ? selectedValues[0].shortName : null))}
            selected={selectedChange ? [selectedChange] : []}
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
  locationIndicatorIcao: PropTypes.string
};

export default SigmetEditMode;
