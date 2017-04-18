import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { Icon } from 'react-fa';
import PropTypes from 'prop-types';

export default class ButtonPausePlayAnimation extends Component {
  constructor () {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.onstopanimation = this.onstopanimation.bind(this);
    this.onstartanimation = this.onstartanimation.bind(this);
    this.state = {
      pauseorplay: true,
      icon:this.getIcon(true)
    };
  }
  getIcon (newpauseorplay) {
    return newpauseorplay ? 'play' : 'pause';
  }
  handleClick (event) {
    /* istanbul ignore next */
    let newpauseorplay = !this.state.pauseorplay;
    /* istanbul ignore next */
    this.setState({ pauseorplay:newpauseorplay, icon:this.getIcon(newpauseorplay) });
    /* istanbul ignore next */
    this.props.dispatch(this.props.actions.toggleAnimation());
    this.props.onChange(newpauseorplay);
  }
  componentWillReceiveProps (nextProps) {
    /* istanbul ignore next */
    this.setState(nextProps);
  }
  onstopanimation () {
    /* istanbul ignore next */
    this.setState({ pauseorplay:true, icon:this.getIcon(true) });
  }
  onstartanimation () {
    /* istanbul ignore next */
    this.setState({ pauseorplay:false, icon:this.getIcon(false) });
  }
  render () {
    return (
      <Button color='primary' size='large' onClick={this.handleClick}>
        <Icon name={this.state.icon} />
      </Button>);
  }
}

ButtonPausePlayAnimation.propTypes = {
  onChange: PropTypes.func,
  actions: PropTypes.object,
  dispatch: PropTypes.func
};

ButtonPausePlayAnimation.defaultProps = {
  webmapjs: undefined,
  onChange: () => { }
};
