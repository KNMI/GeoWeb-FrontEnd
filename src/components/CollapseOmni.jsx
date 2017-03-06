import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import omit from 'lodash.omit';

const SHOW = 'SHOW';
const SHOWN = 'SHOWN';
const HIDE = 'HIDE';
const HIDDEN = 'HIDDEN';

// a straight copy from reactstrap/utils.js:mapToCssModules
const mapToCssModules = function (className, cssModule) {
  if (!cssModule) return className;
  return className.split(' ').map(c => cssModule[c] || c).join(' ');
};

const propTypes = {
  isOpen: PropTypes.bool,
  isHorizontal: PropTypes.bool,
  collapsedSize: PropTypes.number,
  className: PropTypes.node,
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  cssModule: PropTypes.object,
  navbar: PropTypes.bool,
  delay: PropTypes.oneOfType([
    PropTypes.shape({ show: PropTypes.number, hide: PropTypes.number }),
    PropTypes.number
  ]),
  onOpened: PropTypes.func,
  onClosed: PropTypes.func
};

const DEFAULT_DELAYS = {
  show: 350,
  hide: 350
};

const defaultProps = {
  isOpen: false,
  isHorizontal: false,
  collapsedSize: 0,
  tag: 'div',
  delay: DEFAULT_DELAYS,
  onOpened: () => {},
  onClosed: () => {}
};

class CollapseOmni extends Component {
  constructor (props) {
    super(props);

    this.state = {
      collapse: props.isOpen ? SHOWN : HIDDEN,
      size: this.getCollapsedSize()
    };
    this.element = null;
  }

  componentWillReceiveProps (nextProps) {
    const willOpen = nextProps.isOpen;
    const collapse = this.state.collapse;

    if (willOpen && collapse === HIDDEN) {
      // will open
      this.setState({ collapse: SHOW }, () => {
        // the size transition will work after class "collapsing" applied
        this.setState({ size: this.getSize() });
        this.transitionTag = setTimeout(() => {
          this.setState({
            collapse: SHOWN,
            size: null
          });
        }, this.getDelay('show'));
      });
    } else if (!willOpen && collapse === SHOWN) {
      // will hide
      this.setState({ size: this.getSize() }, () => {
        this.setState({
          collapse: HIDE,
          size: this.getSize()
        }, () => {
          this.setState({ size: nextProps.collapsedSize });
        });
      });

      this.transitionTag = setTimeout(() => {
        this.setState({
          collapse: HIDDEN,
          size: this.getCollapsedSize()
        });
      }, this.getDelay('hide'));
    }
    // else: do nothing.
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.collapse === SHOWN &&
        prevState &&
        prevState.collapse !== SHOWN) {
      this.props.onOpened();
    }

    if (this.state.collapse === HIDDEN &&
        prevState &&
        prevState.collapse !== HIDDEN) {
      this.props.onClosed();
    }
  }

  componentWillUnmount () {
    clearTimeout(this.transitionTag);
  }

  getDelay (key) {
    const { delay } = this.props;
    if (typeof delay === 'object') {
      return isNaN(delay[key]) ? DEFAULT_DELAYS[key] : delay[key];
    }
    return delay;
  }

  getSize () {
    return this.props.isHorizontal ? this.element.scrollWidth : this.element.scrollHeight;
  }

  getCollapsedSize () {
    return this.props.collapsedSize !== 0 ? this.props.collapsedSize : null;
  }

  getStyle () {
    if (this.props.isHorizontal) {
      const width = this.state.size;
      return { width };
    } else {
      const height = this.state.size;
      return { height };
    }
  }

  getDirectionClass () {
    return this.props.isHorizontal ? 'width' : 'height';
  }

  getRemainClass () {
    return this.props.collapsedSize !== 0 ? 'remain' : null;
  }

  render () {
    const {
      navbar,
      className,
      cssModule,
      tag: Tag,
      ...attributes
    } = omit(this.props, ['isOpen', 'isHorizontal', 'collapsedSize', 'delay', 'onOpened', 'onClosed']);
    const { collapse, size } = this.state;
    let collapseClass;
    switch (collapse) {
      case SHOW:
        collapseClass = 'collapsing';
        break;
      case SHOWN:
        collapseClass = 'collapse show';
        break;
      case HIDE:
        collapseClass = 'collapsing';
        break;
      case HIDDEN:
        collapseClass = 'collapse';
        break;
      default:
      // HIDDEN
        collapseClass = 'collapse';
    }

    const classes = mapToCssModules(classNames(
      className,
      collapseClass,
      this.getDirectionClass(),
      this.getRemainClass(),
      navbar && 'navbar-collapse'
    ), cssModule);
    const style = size === null ? null : this.getStyle();
    return (
      <Tag
        {...attributes}
        style={{ ...attributes.style, ...style }}
        className={classes}
        ref={(c) => { this.element = c; }}
      />
    );
  }
}

CollapseOmni.propTypes = propTypes;
CollapseOmni.defaultProps = defaultProps;
export default CollapseOmni;
