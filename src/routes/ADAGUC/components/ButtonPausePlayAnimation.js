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
    return {
      webmapjs:undefined,
      onChange:function (value) { console.log(value); }
    };
  },
  getIcon (newpauseorplay) {
    return newpauseorplay ? 'play' : 'pause';
  },
  handleClick (event) {
    let newpauseorplay = !this.state.pauseorplay;
    this.setState({ pauseorplay:newpauseorplay, icon:this.getIcon(newpauseorplay) });
    this.props.onChange(newpauseorplay);
  },
  componentWillReceiveProps (nextProps) {
    this.setState(nextProps);
  },
  onstopanimation () {
    this.setState({ pauseorplay:true, icon:this.getIcon(true) });
  },
  onstartanimation () {
    this.setState({ pauseorplay:false, icon:this.getIcon(false) });
  },
  render () {
    if (this.props.webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) {
        this.listenersInitialized = true;
        this.props.webmapjs.addListener('onstopanimation', this.onstopanimation, true);
        this.props.webmapjs.addListener('onstartanimation', this.onstartanimation, true);
      }
    }
    return <div style={{ display:'flex', flex: '0 0 auto' }}>
      <Button color='primary' size='large' style={{ padding:'20px', margin:' 0 5px' }} onClick={this.handleClick}>
        <Icon name={this.state.icon} />
      </Button>
    </div>;
  }
});

export default ButtonPausePlayAnimation;
