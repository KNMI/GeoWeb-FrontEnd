import React from 'react';
// import omit from 'lodash.omit';

/* istanbul ignore next */
const CanvasComponent = React.createClass({
  propTypes: {
    onRenderCanvas: React.PropTypes.func,
    onClickB: React.PropTypes.func,
    id: React.PropTypes.string,
    onMouseMove: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    style: React.PropTypes.object
  },
  getDefaultProps () {
    return {
      onRenderCanvas:function () {},
      onClickB:function () {},
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
    // eslint-disable-next-line no-undef
    const parentWidth = $(canvas).parent().width();
    // eslint-disable-next-line no-undef
    const parentHeight = $(canvas).parent().height();
    if (this.width === parentWidth && this.height === parentHeight) {
      return;
    }
    this.width = parentWidth;
    this.height = parentHeight;
    let onClickCanvas = this.props.onClickB;
    let mousemove = this.props.onMouseMove;
    if (!this.initialized) {
      this.refs.canvas.addEventListener('mousemove', function (event) {
        let x = event.layerX;
        let y = event.layerY;
        if (event.buttons === 1) {
          onClickCanvas(x, y);
        }
        mousemove(x, y);
      });
      this.refs.canvas.addEventListener('click', function (event) {
        let x = event.layerX;
        let y = event.layerY;
        onClickCanvas(x, y);
      });
      this.initialized = true;
    }
    const ctx = this.refs.canvas.getContext('2d');
    ctx.canvas.width = parentWidth;
    ctx.canvas.height = parentHeight;
    this.props.onRenderCanvas(ctx);
  },
  render () {
    this.updateCanvas();
    if (this.props.width && this.props.height && this.props.style) {
      return <canvas ref='canvas' style={this.props.style} width={this.props.width} height={this.props.height} id={this.props.id} />;
    } else if (this.props.width && this.props.height) {
      return <canvas ref='canvas' width={this.props.width} height={this.props.height} id={this.props.id} />;
    } else {
      return (
        <canvas ref='canvas' id={this.props.id} />
      );
    }
  }
});

export default CanvasComponent;
