import React, { PureComponent } from 'react';
import {
  Button, Col, Row, Alert, InputGroup, InputGroupAddon, Input, FormGroup, Label, InputGroupButtonDropdown,
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
import { UNITS_ALT, DIRECTIONS, CHANGES } from './SigmetTemplates';

const DATE_FORMAT = 'DD MMM YYYY';
const TIME_FORMAT = 'HH:mm UTC';
const DATETIME_FORMAT = 'YYYY-MM-DD[T]HH:mm:ss[Z]';//2017-08-07T11:30:00Z'

class SigmetEditMode extends PureComponent {
  render () {
    const { dispatch, actions, abilities, availablePhenomena, availableFirs, level, movement, focus, uuid, location_indicator_mwo, change, phenomenon, isObserved, obsFcTime, validdate, validdate_end, firname, location_indicator_icao } = this.props;
    const selectedPhenomenon = availablePhenomena.filter((ph) => ph.code === phenomenon).shift();
    const selectedFir = availableFirs.filter((fir) => fir.location_indicator_icao === location_indicator_icao).shift();
    const selectedChange = change ? CHANGES.filter((c) => c.shortName === change.shortName).shift() : null;
    const selectedDirection = movement.direction ? DIRECTIONS.filter((c) => c.shortName === movement.direction).shift() : null;
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
            clearButton />
          <SwitchButton id='obs_or_fcst'
            labelLeft='Observed'
            labelRight='Forecast'
            align='center'
            data-field='obs_or_fcst'
            isChecked={!isObserved}
            action={(evt) => dispatch(actions.updateSigmetAction(uuid, 'obs_or_forecast', { obs: !evt.target.checked, obsFcTime: obsFcTime }))} />
          <DateTimePicker style={{ width: '100%' }} dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='obsFcTime'
            viewMode='time'
            value={obsFcTime ? moment.utc(obsFcTime) : moment.utc()}
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'obs_or_forecast', { obs: isObserved, obsFcTime: time.format(DATETIME_FORMAT) }))}

          />
        </WhatSection>

        <ValiditySection>
          <DateTimePicker style={{ width: '100%' }} dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='validdate'
            viewMode='time'
            value={validdate ? moment.utc(validdate) : moment.utc()}
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'validdate', time.format(DATETIME_FORMAT)))}
          />
          <DateTimePicker style={{ width: '100%' }} dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='validdate_end'
            viewMode='time'
            value={validdate_end ? moment.utc(validdate_end) : moment.utc()}
            onChange={(time) => dispatch(actions.updateSigmetAction(uuid, 'validdate_end', time.format(DATETIME_FORMAT)))}
          />
        </ValiditySection>

        <FirSection>
          <Typeahead filterBy={['firname', 'location_indicator_icao']} labelKey='firname' data-field='firname'
            options={availableFirs} onChange={(firList) => {
              let firname = null;
              let location_indicator_icao = null;
              if (firList.length === 1) {
                firname = firList[0].firname;
                location_indicator_icao = firList[0].location_indicator_icao;
              }
              dispatch(actions.updateSigmetAction(uuid, 'firname', firname));
              dispatch(actions.updateSigmetAction(uuid, 'location_indicator_icao', location_indicator_icao));
              dispatch(actions.updateFir(firname));
            }}
            selected={selectedFir ? [selectedFir] : []} placeholder={'Select FIR'}
            clearButton />
          <span data-field='location_indicator_icao'>{location_indicator_icao}</span>
        </FirSection>

        <DrawSection>
          <Row data-field='buttons-row'>
            {
              drawActions.map((actionItem, index) =>
                <Col xs={index === 0 ? { size: 'auto', offset: 3 } : 'auto'} className='drawbutton' key={actionItem.action + '_button'}>
                  <Button color='primary' active={actionItem.action === 'mapProperties.mapMode'} disabled={actionItem.disabled || null}
                    id={actionItem.action + '_button'} title={actionItem.title} onClick={(evt) => dispatch(actions.drawAction(evt, uuid, actionItem.action, 'start'))}>
                    <Icon name={actionItem.icon} />
                  </Button>
                </Col>
              )
            }
          </Row>
          {!this.props.hasStartCoordinates
            ? <Row data-field='danger-row'>
              <Alert className='noDrawingWarning' color='danger'>
                Please use one of the selection tools above to indicate on the map where the phenomenon is {isObserved ? ' observed.' : ' expected to occur.'}
              </Alert>
            </Row>
            : null}
        </DrawSection>

        <HeightsSection>
          <SwitchButton id='movementType'
            labelLeft='Between'
            labelRight='At/Above'
            align='left'
            data-field='between-at-toggle'
            isChecked={level.use_at_above}
            action={(evt) => dispatch(actions.updateSigmetAction(uuid, 'level', { ...level, use_at_above: evt.target.checked }))} />
          <FormGroup check data-field='tops-toggle'>
            <Label check>
              <Input type='checkbox' />{' '}
              Tops
            </Label>
          </FormGroup>
          <SwitchButton id='movementType'
            labelLeft='At'
            labelRight='Above'
            align='left'
            disabled={!level.use_at_above}
            data-field='at-above-toggle'
            isChecked={movement.useGeometry}
            action={(evt) => dispatch(actions.updateSigmetAction(uuid, 'level', { ...movement, useGeometry: evt.target.checked }))} />
          <InputGroup data-field='at-above-altitude'>
            <InputGroupAddon addonType='prepend'>
              FL
            </InputGroupAddon>

            <Input placeholder='Altitude' />
            {/* <InputGroupAddon addonType='append'>
              <DropdownToggle caret>
                FT
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem>FT</DropdownItem>
                <DropdownItem>MPS</DropdownItem>
                <DropdownItem>FL</DropdownItem>
              </DropdownMenu>

            </InputGroupAddon> */}
          </InputGroup>

          <InputGroup data-field='between-lev-1'>
            <InputGroupAddon addonType='prepend'>
              FL
            </InputGroupAddon>
            <Input placeholder='Altitude' />
          </InputGroup>

          <InputGroup data-field='between-lev-2'>
            <InputGroupAddon addonType='prepend'>
              FL
            </InputGroupAddon>

            <Input placeholder='Altitude' />
            {/* <InputGroupAddon addonType='append'>
              <DropdownToggle caret>
                FT
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem>FT</DropdownItem>
                <DropdownItem>MPS</DropdownItem>
                <DropdownItem>FL</DropdownItem>
              </DropdownMenu>

            </InputGroupAddon> */}
          </InputGroup>

        </HeightsSection>

        <ProgressSection>
          <SwitchButton id='movement'
            labelLeft='Stationary'
            labelRight='Move'
            align='center'
            data-field='movement'
            isChecked={!movement.stationary}
            action={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, stationary: !evt.target.checked }))} />
        </ProgressSection>

        <MovementSection disabled={movement.stationary}>
          <SwitchButton id='movementType'
            labelLeft='Speed & Direction'
            labelRight='End location'
            align='center'
            disabled={movement.stationary}
            data-field='movementType'
            isChecked={movement.useGeometry}
            action={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, useGeometry: evt.target.checked })) } />
          <Typeahead filterBy={['shortName', 'longName']} labelKey='longName' data-field='direction'
            options={DIRECTIONS} placeholder={'Set direction'} disabled={movement.stationary || movement.useGeometry}
            onChange={(selectedval) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, direction: selectedval[0].shortName }))}
            selected={selectedDirection ? [selectedDirection] : []}
            clearButton />
          <InputGroup data-field='speed'>
            <Input onChange={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, speed: parseInt(evt.target.value) }))}
              defaultValue='0'
              type='number' disabled={movement.stationary || movement.useGeometry}
              step='1' />
            <InputGroupAddon>KT</InputGroupAddon>
          </InputGroup>
          <DrawSection data-field='drawbar'>
            <Row data-field='buttons-row'>
              {
                drawActions.map((actionItem, index) =>
                  <Col xs={index === 0 ? { size: 'auto', offset: 3 } : 'auto'} className='drawbutton' key={actionItem.action + '_button'}>
                    <Button color='primary' active={actionItem.action === 'mapProperties.mapMode'} disabled={actionItem.disabled || movement.stationary || !movement.useGeometry || null}
                      id={actionItem.action + '_button'} title={actionItem.title} onClick={(evt) => dispatch(actions.drawAction(evt, uuid, actionItem.action, 'end'))}>
                      <Icon name={actionItem.icon} />
                    </Button>
                  </Col>
                )
              }
            </Row>
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
          <span data-field='issueLocation'>{location_indicator_mwo}</span>
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
  obsFcTime: PropTypes.string
};

export default SigmetEditMode;
