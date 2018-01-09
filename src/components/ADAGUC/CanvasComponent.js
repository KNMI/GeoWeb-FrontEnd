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
    this.state = {
      drawn: false
    };
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
    this.canvas.addEventListener('mousemove', this.handleMouseMoveEvent);
    this.canvas.addEventListener('click', this.handleClickEvent);
    this.updateCanvas();
  }

  componentWillUnmount () {
    this.canvas.removeEventListener('mousemove', this.handleMouseMoveEvent);
    this.canvas.removeEventListener('click', this.handleClickEvent);
  }

  /* istanbul ignore next */
  updateCanvas () {
    if (!this.container || !this.canvas || (this.props.drawOnce && this.state.drawn)) {
      return;
    }
    this.width = parseInt(this.container.clientWidth);
    this.height = parseInt(this.container.clientHeight);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    if (parseInt(ctx.canvas.height) !== this.height) {
      ctx.canvas.height = this.height;
    }
    if (parseInt(ctx.canvas.width) !== this.width) {
      ctx.canvas.width = this.width;
    }
    if (this.props.drawOnce) {
      this.setState({ drawn: true });
    }
    this.props.onRenderCanvas(ctx, this.width, this.height);
  }

  /* istanbul ignore next */
  render () {
    this.updateCanvas();
    const styleObj = { ...this.props.style, border: 'none', width: 'inherit', height: 'inherit', overflow: 'hidden' };
    if (this.props.borderRadius) {
      styleObj['borderRadius'] = this.props.borderRadius;
    }
    return (
      <div ref={(container) => { this.container = container; }} style={styleObj} >
        <div style={{ overflow: 'visible', width:0, height:0 }} >
          <canvas ref={(canvas) => { this.canvas = canvas; }} style={{ width: this.width + 'px', height: this.height + 'px', display: 'block' }} />
        </div>
      </div>
    );
  }
}

CanvasComponent.propTypes = {
  onRenderCanvas: PropTypes.func,
  onCanvasClick: PropTypes.func,
  style: PropTypes.object,
  onMouseMove: PropTypes.func,
  drawOnce: PropTypes.bool,
  borderRadius: PropTypes.string
};

CanvasComponent.defaultProps = {
  onRenderCanvas: () => { /* intentionally left blank */ },
  onCanvasClick: () => { /* intentionally left blank */ },
  onMouseMove: () => { /* intentionally left blank */ }
};
