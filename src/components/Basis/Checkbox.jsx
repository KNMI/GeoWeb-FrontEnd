import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

export default class Checkbox extends PureComponent {
  render () {
    const { value, onChange, option, disabled, className } = this.props;
    const dataField = this.props['data-field'];
    return <Row className={`Checkbox${className ? ` ${className}` : ''}`}>
      <Col xs='auto'>
        <label>
          <input type='checkbox' data-field={dataField}
            checked={option.optionId === value}
            onChange={(evt) => onChange(evt, option.optionId === value ? option.optionId : '')}
            disabled={disabled} value={value}
          />
          <span className='checkbox' />
          <span>{option.label}</span>
        </label>
      </Col>
    </Row>;
  }
}

Checkbox.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
  'data-field': PropTypes.string.isRequired,
  option: PropTypes.shape({
    optionId: PropTypes.string,
    label: PropTypes.string,
    disabled: PropTypes.bool
  }),
  disabled: PropTypes.bool,
  className: PropTypes.string
};
