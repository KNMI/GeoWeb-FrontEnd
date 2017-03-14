import React from 'react';

/* istanbul ignore next */
const CanvasComponent = React.createClass({
  propTypes: {
    onRenderCanvas: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onMouseMove: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },
  getDefaultProps () {
    return {
      onRenderCanvas:function () {},
      onClick:function () {},
      onMouseMove:function () {}
    };
  },
  componentDidMount () {
    this.updateCanvas();
  },
  updateCanvas () {
    if (!this.refs) return;
    if (!this.refs.canvas) return;
    let canvas = this.refs.canvas;
    let onClickCanvas = this.props.onClick;
    let mousemove = this.props.onMouseMove;

    this.refs.canvas.addEventListener('mousemove', function (event) {
      let x = event.clientX - canvas.offsetLeft;
      let y = event.clientY - canvas.offsetTop;
      if (event.buttons === 1) {
        onClickCanvas(x, y);
      }
      mousemove(x, y);
    });
    this.refs.canvas.addEventListener('click', function (event) {
      let x = event.clientX - canvas.offsetLeft;
      let y = event.clientY - canvas.offsetTop;
      onClickCanvas(x, y);
    });
    this.props.onRenderCanvas(this.refs.canvas.getContext('2d'));
  },
  render () {
    const { ...attributes } = this.props;
    return (
      <canvas ref='canvas' {...attributes} />
    );
  }
});

export default CanvasComponent;
