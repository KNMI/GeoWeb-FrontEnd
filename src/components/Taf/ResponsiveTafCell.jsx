import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Label, FormGroup, Input } from 'reactstrap';

class ResponsiveTafCell extends PureComponent {
  render () {
    const { classes, name, label, value, placeholder, inputRef, disabled, autoFocus, isSpan, isButton } = this.props;
    const hidden = false;
    return <FormGroup className='col-1'>
      <Label className={classNames(classes)} for={name} size='sm' hidden={hidden}>{label}</Label>
      <Input type='text' name={name} id={name} ref={inputRef} placeholder={placeholder} value={value} size='sm' disabled={disabled} autoFocus={autoFocus} />
    </FormGroup>;
    { /* <td className={classNames(classes)}>
      {isSpan
        ? <span name={name} disabled={disabled}>{value}</span>
        : isButton
          ? <Button name={name} size='sm' disabled={disabled} autoFocus={autoFocus}>{value}</Button>
          : <input ref={inputRef} name={name} type='text' value={value} disabled={disabled} autoFocus={autoFocus} />
      }
    </td>; */ }
  }
}

ResponsiveTafCell.propTypes = {
  classes: PropTypes.array,
  name: PropTypes.string,
  label: PropTypes.string,
  inputRef: PropTypes.func,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
  isSpan: PropTypes.bool,
  isButton: PropTypes.bool
};

export default ResponsiveTafCell;
