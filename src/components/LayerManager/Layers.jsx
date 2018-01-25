import React, { PureComponent } from 'react';

export default class Layers extends PureComponent {
  render () {
    return (<div>
      {this.props.data.map((layer) => { return <div>{layer.name}</div> })}
    </div>);
  }
}
