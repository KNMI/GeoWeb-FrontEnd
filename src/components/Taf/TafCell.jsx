import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from 'reactstrap';

class TafCell extends PureComponent {
  render () {
    const { classes, name, value, inputRef, disabled, autoFocus, isSpan, isButton } = this.props;
    return <td className={classNames(classes)}>
      {isSpan
        ? <span name={name} disabled={disabled}>{value}</span>
        : isButton
          ? <Button name={name} size='sm' disabled={disabled} autoFocus={autoFocus}>{value}</Button>
          : <input ref={inputRef} name={name} type='text' value={value} disabled={disabled} autoFocus={autoFocus} />
      }
    </td>;
  }
}

TafCell.propTypes = {
  classes: PropTypes.array,
  name: PropTypes.string,
  inputRef: PropTypes.func,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
  isSpan: PropTypes.bool,
  isButton: PropTypes.bool
};

export default TafCell;
