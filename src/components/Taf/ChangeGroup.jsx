import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import Icon from 'react-fa';
import TACColumn from './TACColumn';

class ChangeGroup extends Component {
  render () {
    let { value, onChange, onKeyUp, rowIndex, onDeleteRow, editable, onFocusOut, focusRefId } = this.props;
    let cols = [];
    for (let colIndex = 0; colIndex < 13; colIndex++) {
      cols.push((<TACColumn
        ref={'column_' + colIndex}
        key={cols.length}
        value={value}
        rowIndex={rowIndex}
        colIndex={colIndex}
        onChange={onChange}
        onKeyUp={onKeyUp}
        editable={editable}
        onFocusOut={onFocusOut}
        focusRefId={focusRefId} />));
    }
    if (editable) {
      cols.push(
        <td key='removerow' style={{ cursor:'pointer' }}>
          <Button size='sm' color='secondary' onClick={() => { onDeleteRow(rowIndex); }}><Icon style={{ cursor:'pointer' }} name={'remove'} /></Button>
        </td>);
    }
    return (
      <tr>
        {cols}
      </tr>
    );
  }
};

ChangeGroup.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onKeyUp: PropTypes.func,
  rowIndex: PropTypes.number,
  onDeleteRow: PropTypes.func,
  editable : PropTypes.bool,
  onFocusOut: PropTypes.func,
  focusRefId: PropTypes.string
};

export default ChangeGroup;
