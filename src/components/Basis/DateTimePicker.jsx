import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import NumberInput from '../Basis/NumberInput';
import moment from 'moment';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import { HOUR_LABEL_FORMAT, MINUTE_LABEL_FORMAT, CALENDAR_FORMAT, DATETIME_FORMAT, DATETIME_LABEL_FORMAT_UTC } from '../../config/DayTimeConfig';

export default class DateTimePicker extends PureComponent {
  constructor (props) {
    super(props);
    this.registerElement = this.registerElement.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.state = { element: null };
  }
  registerElement (element) {
    this.setState({ element: element });
  }

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

  /**
   * Handles the keydown event
   * @param {Event} evt The event that was triggered by the change
   */
  onKeyDown (evt) {
    const dataField = this.props['data-field'];
    if (evt.type === 'keydown') {
      switch (evt.key) {
        case 'ArrowRight':
          if (evt.target.dataset.field === `${dataField}-hour` && !evt.shiftKey && evt.target.selectionStart === evt.target.value.length) {
            this.state.element.querySelector(`[data-field=${dataField}-minute]`).focus();
            evt.preventDefault();
            evt.stopPropagation();
          }
          break;
        case ':':
          if (evt.target.dataset.field === `${dataField}-hour`) {
            this.state.element.querySelector(`[data-field=${dataField}-minute]`).focus();
            evt.preventDefault();
            evt.stopPropagation();
          }
          break;
        case 'ArrowLeft':
          if (evt.target.dataset.field === `${dataField}-minute` && !evt.shiftKey && evt.target.selectionStart === 0) {
            this.state.element.querySelector(`[data-field=${dataField}-hour]`).focus();
            evt.preventDefault();
            evt.stopPropagation();
          }
          break;
      }
    }
  }

  render () {
    const { value, min, onChange, className, disabled, utc, invalid } = this.props;
    const hourStep = 1;
    const minuteStep = 1;
    const parsedValue = this.parseTimestamp(value);
    const parsedMin = this.parseTimestamp(min);

    const firstDay = parsedMin.clone();
    const dayOptions = [];
    let dayToAdd = firstDay.clone();

    dayOptions.push({ label: dayToAdd.calendar(null, CALENDAR_FORMAT), timestamp: dayToAdd.clone() });
    dayToAdd.startOf('day').add(1, 'day');
    dayOptions.push({ label: dayToAdd.calendar(null, CALENDAR_FORMAT), timestamp: dayToAdd.clone() });
    dayToAdd.startOf('day').add(1, 'day');

    const dataField = this.props['data-field'];

    const prevClassNames = typeof className === 'string' ? className.split(' ') : [];

    return <Row className={classNames('DateTimePicker', prevClassNames, { required: this.props.required, invalid: invalid })}>
      <Col>
        <label className={`row${disabled ? ' disabled' : ''}`}
          title={!disabled ? moment.utc(value).format(DATETIME_LABEL_FORMAT_UTC) : null}
          onClick={(evt) => evt.preventDefault()}
          onKeyDown={this.onKeyDown}
          ref={this.registerElement}
        >
          <Typeahead filterBy={['label']} labelKey='label' data-field={`${dataField}-day`}
            options={dayOptions} disabled={disabled}
            onFocus={(evt) => onChange(null, '')}
            onChange={(selected) => onChange(null, selected.length > 0 ? selected[0].timestamp.format(DATETIME_FORMAT) : null)}
            selected={parsedValue.isValid() ? [parsedValue.calendar(null, CALENDAR_FORMAT)] : []}
            placeholder={'Select day'}
            className='col-3'
          />
          <NumberInput
            disabled={disabled} className='col-1'
            value={parsedValue.isValid() ? parsedValue.format(HOUR_LABEL_FORMAT) : ''}
            step={hourStep} minLength={2} maxLength={2} data-field={`${dataField}-hour`}
            onChange={(evt, value) => onChange(evt, parsedValue.isValid() && typeof value === 'string'
              ? parsedValue.clone().hour(parseInt(value)).format(DATETIME_FORMAT)
              : null)} />
          <span>:</span>
          <NumberInput
            disabled={disabled} className='col-1'
            value={parsedValue.isValid() ? parsedValue.format(MINUTE_LABEL_FORMAT) : ''}
            step={minuteStep} minLength={2} maxLength={2} data-field={`${dataField}-minute`}
            onChange={(evt, value) => onChange(evt, parsedValue.isValid() && typeof value === 'string'
              ? parsedValue.clone().minute(parseInt(value)).format(DATETIME_FORMAT)
              : null)} />
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
  invalid: PropTypes.bool,
  'data-field': PropTypes.string.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  utc: PropTypes.bool,
  className: PropTypes.string
};
