import React, { PureComponent } from 'react';
import { Badge } from 'reactstrap';
export default class ConcreteCell extends PureComponent {
  render () {
    if (this.props.active) {
      return <Badge pill onClick={this.props.onClick} color={this.props.color}>{this.props.children}</Badge>;
    } else {
      return <Badge pill onClick={this.props.onClick} className={'alert-' + this.props.color}>{this.props.children}</Badge>;
    }
  }
}
