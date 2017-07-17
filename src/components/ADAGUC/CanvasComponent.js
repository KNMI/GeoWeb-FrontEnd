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
    this.width = $('#timelineParent').width();
    this.height = this.props.height || $('#timelineParent').height();
    // const parentWidth = canvas.parentElement.getBoundingClientRect().width;
    // const parentHeight = this.props.height || canvas.parentElement.getBoundingClientRect().height;
    // console.log(parentWidth, parentHeight)
    // if (this.width === parentWidth && this.height === parentHeight) {
    //   return;
    // }
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
    // if (this.props.width && this.props.height && this.props.style) {
    //   return <canvas ref='canvas' style={this.props.style} width={this.props.width} height={this.props.height} id={this.props.id} />;
    // } else if (this.props.width && this.props.height) {
    //   return <canvas ref='canvas' width={this.props.width} height={this.props.height} id={this.props.id} />;
    // }
    return (
      <canvas ref='canvas' id={this.props.id} height={this.props.height} {...this.props} />
    );
  }
}

CanvasComponent.propTypes = {
  onRenderCanvas: PropTypes.func,
  onClickB: PropTypes.func,
  id: PropTypes.string,
  onMouseMove: PropTypes.func,
  height: PropTypes.number
};

CanvasComponent.defaultProps = {
  onRenderCanvas: () => { /* intentionally left blank */ },
  onClickB: () => { /* intentionally left blank */ },
  onMouseMove: () => { /* intentionally left blank */ }
};
