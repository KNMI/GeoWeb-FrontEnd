import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class CanvasComponent extends Component {
  constructor () {
    super();
    this.updateCanvas = this.updateCanvas.bind(this);
  }

  /* istanbul ignore next */
  componentDidMount () {
    this.updateCanvas();
  }

  /* istanbul ignore next */
  updateCanvas () {
    if (!this.refs || !this.refs.canvas) {
      return;
    }
    const canvas = this.refs.canvas;
    const parentWidth = canvas.parentElement.getBoundingClientRect().width;
    const parentHeight = canvas.parentElement.getBoundingClientRect().height;
    if (this.width === parentWidth && this.height === parentHeight) {
      return;
    }
    this.width = parentWidth;
    this.height = parentHeight;
    const onClickCanvas = this.props.onClickB;
    const mousemove = this.props.onMouseMove;
    if (!this.initialized) {
      this.refs.canvas.addEventListener('mousemove', function (event) {
        const x = event.layerX;
        const y = event.layerY;
        if (event.buttons === 1) {
          onClickCanvas(x, y);
        }
        mousemove(x, y);
      });
      this.refs.canvas.addEventListener('click', function (event) {
        const x = event.layerX;
        const y = event.layerY;
        onClickCanvas(x, y);
      });
      this.initialized = true;
    }
    const ctx = this.refs.canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.canvas.width = parentWidth;
    ctx.canvas.height = parentHeight;
    this.props.onRenderCanvas(ctx);
  }

  /* istanbul ignore next */
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
}

CanvasComponent.propTypes = {
  onRenderCanvas: PropTypes.func,
  onClickB: PropTypes.func,
  id: PropTypes.string,
  onMouseMove: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.object
};

CanvasComponent.defaultProps = {
  onRenderCanvas: () => { /* intentionally left blank */ },
  onClickB: () => { /* intentionally left blank */ },
  onMouseMove: () => { /* intentionally left blank */ }
};
