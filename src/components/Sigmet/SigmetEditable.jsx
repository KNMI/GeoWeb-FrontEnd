import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import SwitchButton from 'lyef-switch-button';
import DateTimePicker from 'react-datetime';
import moment from 'moment';
import WhatSection from './Sections/WhatSection';

const DATE_FORMAT = 'DD MMM YYYY';
const TIME_FORMAT = 'HH:mm UTC';

class SigmetEditable extends PureComponent {
  render () {
    return <Button tag='div' className={'Sigmet row'}>
      <WhatSection>
        <Typeahead filterBy={['name', 'code']} labelKey='name' dataFunction='phenomenon'
          options={[ { name: 'eerste', code: 1 }, { name: 'tweede', code: 2 } ]} placeholder={'Select phenomenon'}
          clearButton />
        <SwitchButton id='obs_or_fcst' name='obs_or_fcst' labelLeft='Observed' labelRight='Forecast' align='center' dataFunction='obs_or_fcst' />
        <DateTimePicker style={{ width: '100%' }} dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc dataFunction='obsFcTime'
          viewMode='time'
          value={moment.utc()}
        />
      </WhatSection>
    </Button>;
  }
}

SigmetEditable.propTypes = {

};

export default SigmetEditable;
