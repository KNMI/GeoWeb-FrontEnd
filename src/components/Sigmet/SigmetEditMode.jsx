import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import SwitchButton from 'lyef-switch-button';
import DateTimePicker from 'react-datetime';
import moment from 'moment';
import PropTypes from 'prop-types';
import WhatSection from './Sections/WhatSection';

const DATE_FORMAT = 'DD MMM YYYY';
const TIME_FORMAT = 'HH:mm UTC';

class SigmetEditMode extends PureComponent {
  render () {
    const { uuid } = this.props;
    return <Button tag='div' className={'Sigmet row'} id={uuid}>
      <WhatSection>
        <Typeahead filterBy={['name', 'code']} labelKey='name' data-field='phenomenon'
          options={[ { name: 'eerste', code: 1 }, { name: 'tweede', code: 2 } ]} placeholder={'Select phenomenon'}
          clearButton />
        <SwitchButton id='obs_or_fcst' labelLeft='Observed' labelRight='Forecast' align='center' data-field='obs_or_fcst' />
        <DateTimePicker style={{ width: '100%' }} dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc data-field='obsFcTime'
          viewMode='time'
          value={moment.utc()}
        />
      </WhatSection>
    </Button>;
  }
}

SigmetEditMode.propTypes = {
  uuid: PropTypes.string
};

export default SigmetEditMode;
