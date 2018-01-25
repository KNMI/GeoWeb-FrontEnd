import React, { PureComponent } from 'react';

export default class ConcreteCell extends PureComponent {
  render () {
    return <div>{this.props.children}</div>;
  }
}
