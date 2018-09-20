import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import moment from 'moment';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import { HOUR_LABEL_FORMAT, MINUTE_LABEL_FORMAT, MINUTE_LABEL_FORMAT_UTC, CALENDAR_FORMAT } from './SigmetTemplates';

export default class TimePicker extends PureComponent {
  render () {
    const { value, onChange, disabled, className, isUtc } = this.props;
    const parsedValue = moment.isMoment(value) ? value : moment.utc(value);
    const cal = parsedValue.calendar(null, CALENDAR_FORMAT);
    // TODO: generate options list from max time before / validity range
    console.log('Cal', cal);
    const dataField = this.props['data-field'];
    return <Row className={`TimePicker${className ? ` ${className}` : ''}`}>
      <Col xs='auto'>
        <label className={disabled ? 'disabled' : null} title={moment.utc(value).format()}>
          <Typeahead filterBy={['label']} labelKey='label' data-field={`${dataField}-day`}
            options={[]}
            onFocus={() => {
              // TODO: clear
              // TODO: update
            }}
            onChange={() => onChange()}
            selected={parsedValue.isValid() ? [parsedValue.calendar(null, CALENDAR_FORMAT)] : []}
            placeholder={'Select day'}
            className={!parsedValue.isValid() ? 'missing' : null}
            clearButton />
          <input placeholder='hours' disabled={disabled} type='number'
            min='0' step={1} max={23}
            value={parsedValue.isValid() ? parsedValue.format(HOUR_LABEL_FORMAT) : ''}
            onChange={() => onChange()} />
          <input placeholder='minutes' disabled={disabled} type='number'
            min='0' step={1} max={59}
            value={parsedValue.isValid() ? parsedValue.format(isUtc ? MINUTE_LABEL_FORMAT_UTC : MINUTE_LABEL_FORMAT) : ''}
            onChange={() => onChange()} />
          <span>×</span>
        </label>
      </Col>
    </Row>;
  }
}

TimePicker.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    MomentPropTypes.momentObj
  ]),
  'data-field': PropTypes.string.isRequired,
  checkedOption: PropTypes.shape({
    optionId: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
  }),
  unCheckedOption: PropTypes.shape({
    optionId: PropTypes.string,
    label: PropTypes.string
  }),
  disabled: PropTypes.bool,
  isUtc: PropTypes.bool,
  className: PropTypes.string
};
