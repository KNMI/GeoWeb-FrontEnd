import React, { PureComponent } from 'react';
import {
  Button, Col, Alert, InputGroup, InputGroupAddon, Input, FormGroup, Label, InputGroupButton, ButtonDropdown,
  DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import SwitchButton from 'lyef-switch-button';
import DateTimePicker from 'react-datetime';
import moment from 'moment';
import PropTypes from 'prop-types';
import { EDIT_ABILITIES, byEditAbilities } from '../../containers/Sigmet/SigmetActions';
import Icon from 'react-fa';
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
import { DIRECTIONS, UNITS_ALT, MODES_LVL, CHANGES, SIGMET_TYPES } from './SigmetTemplates';

const DATE_FORMAT = 'DD MMM YYYY';
const TIME_FORMAT = 'HH:mm UTC';
const DATETIME_FORMAT = 'YYYY-MM-DD[T]HH:mm:ss[Z]'; // 2017-08-07T11:30:00Z'

class SigmetEditMode extends PureComponent {
  constructor (props) {
    super(props);
    this.setMode = this.setMode.bind(this);
    this.getUnitLabel = this.getUnitLabel.bind(this);
  }

  setMode (evt) {
    const { dispatch, actions, uuid, levelinfo } = this.props;
    const isLevelBetween = [MODES_LVL.BETW, MODES_LVL.BETW_SFC].includes(levelinfo.mode);
    const isLevelTops = [MODES_LVL.TOPS, MODES_LVL.TOPS_ABV, MODES_LVL.TOPS_BLW].includes(levelinfo.mode);
    const isLevelAbove = [MODES_LVL.ABV, MODES_LVL.TOPS_ABV].includes(levelinfo.mode);
    const isNotLevelSurface = ![MODES_LVL.BETW_SFC].includes(levelinfo.mode);
    dispatch(actions.updateSigmetLevelAction(uuid, 'mode', {
      tops: evt.target.id === 'topsToggle' ? evt.target.checked : isLevelTops,
      above: evt.target.id === 'atAboveToggle' ? evt.target.checked : isLevelAbove,
      between: evt.target.id === 'betweenAtToggle' ? evt.target.checked : isLevelBetween,
      notSurface: evt.target.id === 'sfcLevelToggle' ? evt.target.checked : isNotLevelSurface
    }));
  };

  getUnitLabel (unitName) {
    return UNITS_ALT.find((unit) => unit.unit === unitName).label;
  };

  render () {
    const { dispatch, actions, abilities, availablePhenomena, useGeometryForEnd,
      availableFirs, levelinfo, movement, focus, uuid, locationIndicatorMwo, change,
      phenomenon, isObserved, obsFcTime, validdate, validdateEnd, locationIndicatorIcao } = this.props;
    const selectedPhenomenon = availablePhenomena.filter((ph) => ph.code === phenomenon).shift();
    const selectedFir = availableFirs.filter((fir) => fir.location_indicator_icao === locationIndicatorIcao).shift();
    const selectedChange = change ? CHANGES.filter((c) => c.shortName === change.shortName).shift() : null;
    const selectedDirection = movement && movement.dir ? DIRECTIONS.filter((c) => c.shortName === movement.dir).shift() : null;
    const isLevelBetween = [MODES_LVL.BETW, MODES_LVL.BETW_SFC].includes(levelinfo.mode);
    const isLevelTops = [MODES_LVL.TOPS, MODES_LVL.TOPS_ABV, MODES_LVL.TOPS_BLW].includes(levelinfo.mode);
    const isLevelAbove = [MODES_LVL.ABV, MODES_LVL.TOPS_ABV].includes(levelinfo.mode);
    const isNotLevelSurface = ![MODES_LVL.BETW_SFC].includes(levelinfo.mode);
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
            onChange={(selectedValues) => dispatch(actions.updateSigmetAction(uuid, 'phenomenon', selectedValues))}
            selected={selectedPhenomenon ? [selectedPhenomenon] : []}
            className={!selectedPhenomenon ? 'missing' : null}
            clearButton />
          <SwitchButton id='obs_or_fcst'
            labelLeft='Observed'
            labelRight='Forecast'
            align='center'
            data-field='obs_or_fcst'
            isChecked={!isObserved}
            action={(evt) => dispatch(actions.updateSigmetAction(uuid, 'obs_or_forecast', { obs: !evt.target.checked, obsFcTime: obsFcTime }))} />
          <DateTimePicker dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='obsFcTime'
            viewMode='time'
            value={obsFcTime ? moment.utc(obsFcTime) : moment.utc()}
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'obs_or_forecast', { obs: isObserved, obsFcTime: time.format(DATETIME_FORMAT) }))}

          />
        </WhatSection>

        <ValiditySection>
          <DateTimePicker dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='validdate'
            viewMode='time'
            value={validdate ? moment.utc(validdate) : moment.utc()}
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'validdate', time.format(DATETIME_FORMAT)))}
          />
          <DateTimePicker dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='validdate_end'
            viewMode='time'
            value={validdateEnd ? moment.utc(validdateEnd) : moment.utc()}
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'validdate_end', time.format(DATETIME_FORMAT)))}
          />
        </ValiditySection>

        <FirSection>
          <Typeahead filterBy={['firname', 'location_indicator_icao']} labelKey='firname' data-field='firname'
            options={availableFirs} onChange={(firList) => {
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
          <SwitchButton id='betweenAtToggle'
            labelLeft='At/Above'
            labelRight='Between'
            align='left'
            data-field='between-at-toggle'
            isChecked={isLevelBetween}
            action={this.setMode} />
          <FormGroup check data-field='tops-toggle' disabled={isLevelBetween}>
            <Label check>
              <Input type='checkbox' id='topsToggle' disabled={isLevelBetween} checked={isLevelTops}
                onClick={this.setMode} />
              Tops
            </Label>
          </FormGroup>
          <SwitchButton id='atAboveToggle'
            labelLeft='At'
            labelRight='Above'
            align='left'
            disabled={isLevelBetween}
            data-field='at-above-toggle'
            isChecked={isLevelAbove}
            action={this.setMode} />

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
          <SwitchButton id='sfcLevelToggle'
            labelLeft='SFC'
            labelRight={<InputGroup className='label'>
              <InputGroupButton>
                <ButtonDropdown toggle={() => null}>
                  <DropdownToggle caret disabled={!isLevelBetween || !isNotLevelSurface}>
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
              <Input placeholder='Level' disabled={!isLevelBetween || !isNotLevelSurface} type='number'
                value={(!isLevelBetween || !isNotLevelSurface || !levelinfo.levels[0].value) ? '' : levelinfo.levels[0].value}
                onChange={(evt) => dispatch(actions.updateSigmetLevelAction(uuid, 'value', { value: evt.target.value, isUpperLevel: false }))} />
            </InputGroup>}
            disabled={!isLevelBetween}
            data-field='between-lev-1'
            isChecked={isNotLevelSurface}
            action={this.setMode} />
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
          <SwitchButton id='movement'
            labelLeft='Stationary'
            labelRight='Move'
            align='center'
            data-field='movement'
            isChecked={movement && !movement.stationary}
            action={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, stationary: !evt.target.checked }))} />
        </ProgressSection>

        <MovementSection disabled={movement && movement.stationary}>
          <SwitchButton id='movementType'
            labelLeft='Speed & Direction'
            labelRight='End location'
            align='center'
            disabled={movement && movement.stationary}
            data-field='movementType'
            isChecked={useGeometryForEnd}
            action={(evt) => { dispatch(actions.modifyFocussedSigmet('useGeometryForEnd', evt.target.checked)); }} />
          <Typeahead filterBy={['shortName', 'longName']} labelKey='longName' data-field='direction'
            options={DIRECTIONS} placeholder={'Set direction'} disabled={!movement || movement.stationary || useGeometryForEnd}
            onChange={(selectedval) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, dir: selectedval[0].shortName }))}
            selected={selectedDirection ? [selectedDirection] : []}
            clearButton />
          <InputGroup data-field='speed'>
            <Input onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, speed: parseInt(evt.target.value) }))}
              defaultValue='0'
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
            onChange={(selectedValues) => dispatch(actions.updateSigmetAction(uuid, 'change', selectedValues[0].shortName))}
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
  locationIndicatorIcao: PropTypes.string
};

export default SigmetEditMode;
