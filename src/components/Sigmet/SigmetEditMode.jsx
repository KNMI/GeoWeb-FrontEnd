import React, { PureComponent } from 'react';
import { Button, Col, Alert, InputGroup, InputGroupAddon, Input } from 'reactstrap';
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
import { UNITS_ALT, DIRECTIONS, CHANGES } from './SigmetTemplates';

const DATE_FORMAT = 'DD MMM YYYY';
const TIME_FORMAT = 'HH:mm UTC';
const DATETIME_FORMAT = 'YYYY-MM-DD[T]HH:mm:ss[Z]';//2017-08-07T11:30:00Z'

class SigmetEditMode extends PureComponent {
  render () {
    const { dispatch, actions, abilities, availablePhenomena, availableFirs, movement, focus, uuid, location_indicator_mwo, change, phenomenon, isObserved, obsFcTime, validdate, validdate_end, firname, location_indicator_icao } = this.props;
    const selectedPhenomenon = availablePhenomena.filter((ph) => ph.code === phenomenon).shift();
    const selectedFir = availableFirs.filter((fir) => fir.location_indicator_icao === location_indicator_icao).shift();
    const selectedChange = change ? CHANGES.filter((c) => c.shortName === change.shortName).shift() : null;

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
    const abilityCtAs = []; // CtA = Call To Action
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
            }}
            selected={selectedFir ? [selectedFir] : []} placeholder={'Select FIR'}
            clearButton />
          <span data-field='location_indicator_icao'>{location_indicator_icao}</span>
        </FirSection>

        <DrawSection>
          {
            drawActions.map((actionItem) =>
              <Button color='primary' active={actionItem.action === 'mapProperties.mapMode'} disabled={actionItem.disabled || null}
                id={actionItem.action + '_button'} title={actionItem.title} onClick={(evt) => dispatch(actions.drawAction(evt, actionItem.action, 'where'))}
                key={actionItem.action + '_button'} data-field={actionItem.action} >
                <Icon name={actionItem.icon} />
              </Button>
            )
          }
        </DrawSection>

        <ProgressSection>
          <SwitchButton id='movement'
            labelLeft='Stationary'
            labelRight='Move'
            align='center'
            data-field='movement'
            isChecked={!movement.stationary}
            action={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, stationary: !evt.target.checked }))} />
        </ProgressSection>

        <MovementSection>
          <SwitchButton id='movementType'
            labelLeft='End location'
            labelRight='Speed & Direction'
            align='center'
            disabled={movement.stationary}
            data-field='movementType'
            isChecked={!movement.stationary}
            action={(evt) => dispatch(actions.updateSigmetAction(uuid, 'movement', { ...movement, stationary: !evt.target.checked }))} />
          <Typeahead filterBy={['shortName', 'longName']} labelKey='longName' data-field='direction'
            options={DIRECTIONS} placeholder={'Set direction'}
            onChange={(selectedValues) => dispatch(actions.updateSigmetAction(uuid, 'phenomenon', selectedValues))}
            selected={selectedPhenomenon ? [selectedPhenomenon] : []}
            clearButton />
          <InputGroup data-field='speed'>
            <Input onChange={this.setSpeed}
              defaultValue='0'
              type='number'
              step='1' />
          </InputGroup>
          <DrawSection data-field='drawbar'>
            {
              drawActions.map((actionItem) =>
                <Button color='primary' active={actionItem.action === 'mapProperties.mapMode'} disabled={actionItem.disabled || null}
                  id={actionItem.action + '_button'} title={actionItem.title} onClick={(evt) => dispatch(actions.drawAction(evt, actionItem.action, 'progress'))}
                  key={actionItem.action + '_button'} data-field={actionItem.action} >
                  <Icon name={actionItem.icon} />
                </Button>
              )
            }
          </DrawSection>
        </MovementSection>

        <ChangeSection>
          <Typeahead filterBy={['shortName', 'longName']} labelKey='longName' data-field='change'
            options={CHANGES} placeholder={'Select change'}
            onChange={(selectedValues) => dispatch(actions.updateSigmetAction(uuid, 'change', selectedValues))}
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
