import React from 'react';
import { Button } from 'reactstrap';
import { Icon } from 'react-fa';
const ButtonPausePlayAnimation = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    webmapjs: React.PropTypes.object
  },
  getInitialState () {
    return {
      pauseorplay: true,
      icon:this.getIcon(true)
    };
  },
  getDefaultProps () {
    /* istanbul ignore next */
    return {
      webmapjs: undefined,
      onChange: () => { }
    };
  },
  getIcon (newpauseorplay) {
    return newpauseorplay ? 'play' : 'pause';
  },
  handleClick (event) {
    /* istanbul ignore next */
    let newpauseorplay = !this.state.pauseorplay;
    /* istanbul ignore next */
    this.setState({ pauseorplay:newpauseorplay, icon:this.getIcon(newpauseorplay) });
    /* istanbul ignore next */
    this.props.onChange(newpauseorplay);
  },
  componentWillReceiveProps (nextProps) {
    /* istanbul ignore next */
    this.setState(nextProps);
  },
  onstopanimation () {
    /* istanbul ignore next */
    this.setState({ pauseorplay:true, icon:this.getIcon(true) });
  },
  onstartanimation () {
    /* istanbul ignore next */
    this.setState({ pauseorplay:false, icon:this.getIcon(false) });
  },
  render () {
    /* istanbul ignore next */
    if (this.props.webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) {
        this.listenersInitialized = true;
        this.props.webmapjs.addListener('onstopanimation', this.onstopanimation, true);
        this.props.webmapjs.addListener('onstartanimation', this.onstartanimation, true);
      }
    }
    return (
      <Button color='primary' size='large' onClick={this.handleClick}>
        <Icon name={this.state.icon} />
      </Button>);
  }
});

export default ButtonPausePlayAnimation;
