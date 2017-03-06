import React, { Component, PropTypes } from 'react';
import { Button } from 'reactstrap';
import CollapseOmni from '../components/CollapseOmni';

class TasksContainer extends Component {
  constructor (props) {
    super(props);
    this.toggleHor = this.toggleHor.bind(this);
    this.toggleVer = this.toggleVer.bind(this);
    this.state = { collapseHor: false, collapseVer: false };
  }

  toggleHor () {
    this.setState({ collapseHor: !this.state.collapseHor });
  }

  toggleVer () {
    this.setState({ collapseVer: !this.state.collapseVer });
  }

  render () {
    const { title } = this.props;
    return (
      <div>
        <Button color='primary' onClick={this.toggleHor} style={{ marginBottom: '0.5rem' }}>Toggle horizontal</Button>
        <Button color='primary' onClick={this.toggleVer} style={{ marginBottom: '0.5rem' }}>Toggle vertical</Button>
        <CollapseOmni isOpen={this.state.collapseHor} isHorizontal collapsedSize={20}>
          {title || 'Oops'}
        </CollapseOmni>
        <CollapseOmni isOpen={this.state.collapseVer} collapsedSize={10} >
          {title || 'Oops'}
        </CollapseOmni>
      </div>
    );
  }
}

TasksContainer.propTypes = {
  title: PropTypes.string.isRequired
};

export default TasksContainer;
