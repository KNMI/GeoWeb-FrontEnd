import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

export default class Switch extends PureComponent {
  render () {
    const { value, onChange, checkedOption, unCheckedOption, disabled, className } = this.props;
    const dataField = this.props['data-field'];
    return <Row className={`Switch ${className}`}>
      <Col xs='auto'>
        <label className={disabled ? 'disabled' : null}>
          <span>{unCheckedOption.label}</span>
          <input type='checkbox' data-field={dataField}
            checked={checkedOption.optionId === value}
            onChange={(evt) => onChange(evt, checkedOption.optionId === value ? unCheckedOption.optionId : checkedOption.optionId)}
            disabled={disabled} value={value}
          />
          <span className='checkbox' />
          <span>{checkedOption.label}</span>
        </label>
      </Col>
    </Row>;
  }
}

Switch.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
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
  className: PropTypes.string
};
