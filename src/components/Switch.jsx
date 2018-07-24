import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

export default class Switch extends PureComponent {
  render () {
    const { value, onChange, checkedOption, unCheckedOption, disabled } = this.props;
    const dataField = this.props['data-field'];
    return <Row className='Switch'>
      <Col xs='auto'>
        <label>
          <span>{unCheckedOption.label}</span>
          <input type='checkbox' name={dataField}
            checked={checkedOption.optionId === value} onChange={(evt) => onChange(evt, checkedOption.optionId)}
            disabled={disabled}
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
    label: PropTypes.string
  }),
  unCheckedOption: PropTypes.shape({
    optionId: PropTypes.string,
    label: PropTypes.string
  }),
  disabled: PropTypes.bool
};
