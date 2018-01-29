import React, { PureComponent } from 'react';
import ConcreteCell from './ConcreteCell';
import Icon from 'react-fa';

export default class EditableCell extends PureComponent {
  render () {

    return(<ConcreteCell active={this.props.active} color={this.props.color}>
      {this.props.children}&nbsp;
      <Icon name='pencil' onClick={this.props.onClick} />
    </ConcreteCell>)
  }
}
