import React, { PureComponent } from 'react';
import { Row, Col, Input } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import moment from 'moment';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import { HOUR_LABEL_FORMAT, MINUTE_LABEL_FORMAT, CALENDAR_FORMAT, DATETIME_FORMAT } from '../Sigmet/SigmetTemplates';

const DIGIT_TYPES = {
  HOUR: 'hour',
  MINUTE: 'minute'
};

export default class DateTimePicker extends PureComponent {
  parseTimestamp (timestamp) {
    const { utc } = this.props;
    return moment.isMoment(timestamp)
      ? timestamp
      : utc
        ? moment.utc(timestamp)
        : moment(timestamp);
  }

  adjustValueByStep (evt, currentValue, timeDigit, step, min, max) {
    const { onChange } = this.props;
    if (evt.type === 'wheel') {
      evt.preventDefault();
      evt.stopPropagation();
      if (evt.deltaY === 0) {
        return;
      }
      if (currentValue.isValid()) {
        let adjustmentSign = 0;
        if (currentValue[timeDigit]() <= max - step && evt.deltaY < 0) {
          adjustmentSign = 1;
        } else if (currentValue[timeDigit]() >= min + step && evt.deltaY > 0) {
          adjustmentSign = -1;
        } else {
          return;
        }
        onChange(evt, currentValue.clone()[timeDigit](currentValue[timeDigit]() + (adjustmentSign * step)).format(DATETIME_FORMAT));
      }
    } else {
      onChange(evt, null);
    }
  }

  render () {
    const { value, min, max, onChange, className, required, disabled, utc } = this.props;
    const hourStep = 1;
    const minuteStep = 5;
    const parsedValue = this.parseTimestamp(value);
    const parsedMin = this.parseTimestamp(min);
    const parsedMax = this.parseTimestamp(max);
    const firstDay = parsedMin.clone().startOf('day');
    const nextToLastDay = parsedMax.clone().startOf('day').add(1, 'day');
    const dayOptions = [];
    let dayToAdd = firstDay.clone();
    while (dayToAdd.isBefore(nextToLastDay)) {
      dayOptions.push({ label: dayToAdd.calendar(null, CALENDAR_FORMAT), timestamp: dayToAdd.clone() });
      dayToAdd.add(1, 'day');
    }
    const dataField = this.props['data-field'];
    const hourMinimum = parsedValue.isSame(parsedMin, 'day')
      ? parsedMin.hour() + (parsedValue.minute() < parsedMin.minute() ? 1 : 0)
      : 0;
    const hourMaximum = parsedValue.isSame(parsedMax, 'day')
      ? parsedMax.hour() - (parsedValue.minute() > parsedMax.minute() ? 1 : 0)
      : 23;
    const minuteMinimum = parsedValue.isSame(parsedMin, 'hour') ? parsedMin.minute() : 0;
    const minuteMaximum = parsedValue.isSame(parsedMax, 'hour') ? parsedMax.minute() : 59;

    const shouldHightlight = (required && !value) || (value && (parsedValue.isBefore(parsedMin) || parsedValue.isAfter(parsedMax)));

    return <Row className={`DateTimePicker${className ? ` ${className}` : ''}${required ? ` required${shouldHightlight ? ' missing' : ''}` : ''}`}>
      <Col>
        <label className={`row${disabled ? ' disabled' : ''}`} title={!disabled ? moment.utc(value).format() : null} onClick={(evt) => evt.preventDefault()}>
          <Typeahead filterBy={['label']} labelKey='label' data-field={`${dataField}-day`}
            options={dayOptions} disabled={disabled}
            onFocus={(evt) => onChange(null, '')}
            onChange={(selected) => onChange(null, selected.length > 0 ? selected[0].timestamp.format(DATETIME_FORMAT) : null)}
            selected={parsedValue.isValid() ? [parsedValue.calendar(null, CALENDAR_FORMAT)] : []}
            placeholder={'Select day'}
            className='col-3'
          />
          <Input placeholder='00' disabled={disabled} type='text' pattern='[0-9]*' className='col-1' data-field={`${dataField}-hour`}
            min={hourMinimum} step={hourStep} max={hourMaximum}
            value={parsedValue.isValid() ? parsedValue.format(HOUR_LABEL_FORMAT) : ''}
            onChange={(evt) => onChange(evt, parsedValue.isValid() && !isNaN(evt.target.value)
              ? parsedValue.clone().hour(parseInt(evt.target.value)).format(DATETIME_FORMAT)
              : null)}
            onWheel={(evt) => this.adjustValueByStep(evt, parsedValue, DIGIT_TYPES.HOUR, hourStep, hourMinimum, hourMaximum)}
          />
          <span>:</span>
          <Input placeholder='00' disabled={disabled} type='text' className='col-1' data-field={`${dataField}-minute`}
            min={minuteMinimum} step={minuteStep} max={minuteMaximum}
            value={parsedValue.isValid() ? parsedValue.format(MINUTE_LABEL_FORMAT) : ''}
            onChange={(evt) => onChange(evt, parsedValue.isValid() && !isNaN(evt.target.value)
              ? parsedValue.clone().minute(parseInt(evt.target.value)).format(DATETIME_FORMAT)
              : null)}
            onWheel={(evt) => this.adjustValueByStep(evt, parsedValue, DIGIT_TYPES.MINUTE, minuteStep, minuteMinimum, minuteMaximum)}
          />
          {utc
            ? <span>UTC</span>
            : null
          }
          <Col />
          {!disabled || !!value
            ? <button className='clear close col-auto' title='Clear' onClick={(evt) => onChange(evt, null)}><span>×</span></button>
            : null
          }
        </label>
      </Col>
    </Row>;
  }
}

const timestampType = PropTypes.oneOfType([
  PropTypes.string,
  MomentPropTypes.momentObj
]);

DateTimePicker.propTypes = {
  onChange: PropTypes.func,
  value: timestampType,
  min: timestampType,
  max: timestampType,
  'data-field': PropTypes.string.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  utc: PropTypes.bool,
  className: PropTypes.string
};
