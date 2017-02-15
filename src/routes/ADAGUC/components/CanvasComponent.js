import React from 'react';

const CanvasComponent = React.createClass({
  propTypes: {
    onRenderCanvas: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },
  getDefaultProps () {
    return {
      width:300,
      height:300,
      onRenderCanvas:function () {}
    };
  },
  componentDidMount () {
    this.updateCanvas();
  },
  updateCanvas () {
    this.props.onRenderCanvas(this.refs.canvas.getContext('2d'));
  },
  render () {
    return (
      <canvas ref='canvas' width={this.props.width} height={this.props.height} />
    );
  }
});

export default CanvasComponent;
