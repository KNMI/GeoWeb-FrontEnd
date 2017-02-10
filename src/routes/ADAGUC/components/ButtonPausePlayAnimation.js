import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

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
      onChange:function (value) {console.log(value);}
    };
  },
  getIcon (newpauseorplay){
    return newpauseorplay ? 'glyphicon glyphicon glyphicon-play' : 'glyphicon glyphicon glyphicon-pause';
  },
  handleClick (event) {
    let newpauseorplay = !this.state.pauseorplay;
    this.setState({ pauseorplay:newpauseorplay, icon:this.getIcon(newpauseorplay)});
    this.props.onChange(newpauseorplay);
  },
  componentWillReceiveProps (nextProps) {
    this.setState(nextProps);
  },
  render () {
    if (this.props.webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) {
        this.listenersInitialized = true;
      }
      //console.log(this.props.webmapjs.isAnimating);
    }
    return <div>
      <Button bsStyle='primary' bsSize='large' style={{ padding:'20px', margin:'5px' }} onClick={this.handleClick}>
        <Glyphicon glyph={this.state.icon} />
      </Button>
    </div>;
  }
});

export default ButtonPausePlayAnimation;
