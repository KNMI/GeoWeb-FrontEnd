import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class NumberInput extends PureComponent {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.state = {
      element: null
    };
  }

  onChange (evt) {
    const { value : currentValue, min, max, onChange } = this.props;
    const { value } = evt.target;
    console.log('oC', currentValue, value, min, max, evt.type);
    evt.target.selectionStart = 0;
    if (evt.type === 'change') {
      let resultValue = Number.NaN;
      if (typeof value === 'string') {
        if (value === '') {
          onChange(evt, null);
        } else {
          resultValue = parseInt(value);
        }
      } else if (typeof value === 'number') {
        resultValue = value;
      }
      if (!isNaN(resultValue)) {
        if (resultValue > max) {
          console.log('too big');
          return;
        } else if (resultValue < min) {
          console.log('too small');
          return;
        }
        onChange(evt, resultValue.toString());
        console.log('SS', evt.target.selectionStart);
      } else {
        console.warn('NumberInput:', 'provided value is not parseable as number');
      }

      onChange(evt, value.toString());
    } else {
      onChange(evt, null);
    }
  }

  onWheel (evt) {
    const { onChange, value, step, min, max } = this.props;
    if (evt.type === 'wheel') {
      evt.preventDefault();
      evt.stopPropagation();
      if (evt.deltaY === 0) {
        return;
      }
      let resultValue = Number.NaN;
      if (typeof value === 'string') {
        if (value === '') {
          resultValue = 0;
        } else {
          resultValue = parseInt(value);
        }
      } else if (typeof value === 'number') {
        resultValue = value;
      }
      if (!isNaN(resultValue)) {
        if (resultValue <= max - step && evt.deltaY < 0) {
          resultValue += step - resultValue % step;
        } else if (resultValue >= min + step && evt.deltaY > 0) {
          resultValue -= step + resultValue % step;
        } else {
          return;
        }
        onChange(evt, resultValue.toString());
      } else {
        console.warn('NumberInput:', 'provided value is not parseable as number');
      }
    } else {
      onChange(evt, null);
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      console.log('Changed', prevProps.value, this.props.value);
      this.state.element.setSelectionRange(0, 0);
    }
  }

  render () {
    const { value, disabled, className, minLength, maxLength } = this.props;
    const dataField = this.props['data-field'];
    const placeholder = minLength ? ''.padStart(minLength, '0') : '0';
    console.log('Re', value, typeof value === 'number', (typeof value === 'string' && value !== ''));
    const displayValue = typeof value === 'number' || (typeof value === 'string' && value !== '')
      ? minLength
        ? value.toString().padStart(minLength, '0')
        : value.toString()
      : '';
    return <input data-field={dataField} type='text'
      ref={(element) => (this.state.element = element)}
      placeholder={placeholder} disabled={disabled}
      pattern='[0-9]*'
      minLength={minLength || null}
      maxLength={maxLength ? maxLength + 1 : null}
      className={`NumberInput form-control${className ? ` ${className}` : ''}`}
      value={displayValue}
      onChange={this.onChange}
      onWheel={this.onWheel}
    />;
  }
}

NumberInput.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  'data-field': PropTypes.string
};
