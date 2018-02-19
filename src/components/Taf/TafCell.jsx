import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';

class TafCell extends PureComponent {
  render () {
    const { classes, name, value, inputRef, disabled, autoFocus, isSpan, isButton, isTypeAhead, typeAheadOptions } = this.props;
    return <td className={classNames(classes)}>
      {isSpan
        ? <span name={name} disabled={disabled}>{value}</span>
        : isButton
          ? <Button name={name} size='sm' disabled={disabled} autoFocus={autoFocus}>{value}</Button>
          : isTypeAhead
            ? <Typeahead name={name} ref={inputRef} disabled={disabled} options={typeAheadOptions} placeholder={'Select location'} />
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
  isButton: PropTypes.bool,
  isTypeAhead: PropTypes.bool,
  typeAheadOptions: PropTypes.arrayOf(PropTypes.string)
};

export default TafCell;
