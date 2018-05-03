import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import WhatSection from './Sections/WhatSection';

const DATE_TIME_FORMAT = 'DD MMM YYYY HH:mm UTC';

class SigmetReadable extends PureComponent {
  render () {
    const { phenomenon, isObserved, obsFcTime } = this.props;
    return <Button tag='div' className={'Sigmet row'}>
      <WhatSection>
        <span data-field='phenomenon'>{phenomenon}</span>
        <span data-field='obs_or_fcst'>{isObserved ? 'Observed' : 'Forecast'}</span>
        {obsFcTime
          ? <Moment format={DATE_TIME_FORMAT} date={obsFcTime} data-field='obsFcTime' />
          : <span data-field='obsFcTime'>
            {isObserved
              ? '(no observation time provided)'
              : '(no forecasted time provided)'
            }
          </span>
        }
      </WhatSection>
    </Button>;
  }
}

SigmetReadable.propTypes = {
  phenomenon: PropTypes.string,
  isObserved: PropTypes.bool,
  obsFcTime: PropTypes.string
};

export default SigmetReadable;
