import React, { PureComponent } from 'react';
import { Button, Col } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import SwitchButton from 'lyef-switch-button';
import DateTimePicker from 'react-datetime';
import moment from 'moment';
import PropTypes from 'prop-types';
import { EDIT_ABILITIES, byEditAbilities } from '../../containers/Sigmet/SigmetActions';
import WhatSection from './Sections/WhatSection';
import ActionSection from './Sections/ActionSection';

const DATE_FORMAT = 'DD MMM YYYY';
const TIME_FORMAT = 'HH:mm UTC';

class SigmetEditMode extends PureComponent {
  render () {
    const { dispatch, actions, abilities, availablePhenomena, focus, uuid, phenomenon, isObserved, obsFcTime } = this.props;
    const selectedPhenomenon = availablePhenomena.filter((ph) => ph.code === phenomenon).shift();
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
            action={(evt) => dispatch(actions.updateSigmetAction(uuid, 'obs_or_fcst', evt.target.checked))} />
          <DateTimePicker style={{ width: '100%' }} dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='obsFcTime'
            viewMode='time'
            value={moment.utc()}
          />
        </WhatSection>
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
