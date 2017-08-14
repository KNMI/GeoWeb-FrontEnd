import React, { Component } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
export default class CanvasComponent extends Component {
  constructor () {
    super();
    this.updateCanvas = this.updateCanvas.bind(this);
    this.width = 300;
    this.height = 150;
  }

  /* istanbul ignore next */
  componentDidMount () {
    this.updateCanvas();
    this.height = this.props.height;
    const ctx = this.refs.canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.canvas.height = this.height;
  }

  /* istanbul ignore next */
  updateCanvas () {
    if (!this.refs || !this.refs.canvas) {
      return;
    }
    this.width = this.props.width || $(`#${this.props.parentId}`).width();
    this.height = this.props.height || $(`#${this.props.parentId}`).height();
    const onClickCanvas = this.props.onClickB;
    const mousemove = this.props.onMouseMove;
    if (!this.initialized) {
      this.refs.canvas.addEventListener('mousemove', (event) => {
        const x = event.layerX;
        const y = event.layerY;
        if (event.buttons === 1) {
          onClickCanvas(x, y);
        }
        mousemove(x, y);
      });
      this.refs.canvas.addEventListener('click', (event) => {
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
    ctx.canvas.width = this.width;
    ctx.canvas.height = this.height;
    this.props.onRenderCanvas(ctx);
  }

  /* istanbul ignore next */
  render () {
    this.updateCanvas();
    return (
      <canvas ref='canvas' {...this.props} />
    );
  }
}

CanvasComponent.propTypes = {
  onRenderCanvas: PropTypes.func,
  onClickB: PropTypes.func,
  onMouseMove: PropTypes.func,
  height: PropTypes.number,
  width: PropTypes.string,
  parentId: PropTypes.string
};

CanvasComponent.defaultProps = {
  onRenderCanvas: () => { /* intentionally left blank */ },
  onClickB: () => { /* intentionally left blank */ },
  onMouseMove: () => { /* intentionally left blank */ }
};
