import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class CanvasComponent extends Component {
  constructor () {
    super();
    this.updateCanvas = this.updateCanvas.bind(this);
    this.handleMouseMoveEvent = this.handleMouseMoveEvent.bind(this);
    this.handleClickEvent = this.handleClickEvent.bind(this);
    this.width = 300;
    this.height = 150;
  }

  handleMouseMoveEvent (event) {
    const mousemove = this.props.onMouseMove;
    const x = event.layerX;
    const y = event.layerY;
    if (event.buttons === 1) {
      this.props.onCanvasClick(x, y);
    }
    mousemove(x, y);
  }

  handleClickEvent (event) {
    const x = event.layerX;
    const y = event.layerY;
    this.props.onCanvasClick(x, y);
  }

  /* istanbul ignore next */
  componentDidMount () {
    this.refs.canvas.addEventListener('mousemove', this.handleMouseMoveEvent);
    this.refs.canvas.addEventListener('click', this.handleClickEvent);
    this.updateCanvas();
  }

  componentWillUnmount () {
    this.refs.canvas.removeEventListener('mousemove', this.handleMouseMoveEvent);
    this.refs.canvas.removeEventListener('click', this.handleClickEvent);
  }

  /* istanbul ignore next */
  updateCanvas () {
    if (!this.refs || !this.refs.canvas) {
      return;
    }
    this.width = parseInt(this.refs.container.clientWidth);
    this.height = parseInt(this.refs.container.clientHeight);

    const ctx = this.refs.canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    if (parseInt(ctx.canvas.height) !== this.height) ctx.canvas.height = this.height;
    if (parseInt(ctx.canvas.width) !== this.width) ctx.canvas.width = this.width;
    this.props.onRenderCanvas(ctx);
  }

  /* istanbul ignore next */
  render () {
    this.updateCanvas();
    return (
      <div ref='container' style={{ border: 'none', width: 'inherit', height: 'inherit', overflow: 'hidden' }} >
        <div style={{ overflow: 'visible', width:0, height:0 }} >
          <canvas ref='canvas' style={{ width: this.width + 'px', height: this.height + 'px', display: 'block' }} />
        </div>
      </div>
    );
  }
}

CanvasComponent.propTypes = {
  onRenderCanvas: PropTypes.func,
  onCanvasClick: PropTypes.func,
  onMouseMove: PropTypes.func
};

CanvasComponent.defaultProps = {
  onRenderCanvas: () => { /* intentionally left blank */ },
  onCanvasClick: () => { /* intentionally left blank */ },
  onMouseMove: () => { /* intentionally left blank */ }
};
