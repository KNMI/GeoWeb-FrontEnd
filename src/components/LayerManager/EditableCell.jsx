import React, { PureComponent } from 'react';
import ConcreteCell from './ConcreteCell';
import Icon from 'react-fa';

export default class EditableCell extends PureComponent {
  render () {

    return(<ConcreteCell color={this.props.color}>
      {this.props.children}
      <Icon name='pencil' onClick={this.props.onClick} />
    </ConcreteCell>)
  }
}
