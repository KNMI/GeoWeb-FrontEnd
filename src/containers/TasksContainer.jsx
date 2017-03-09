import React, { Component, PropTypes } from 'react';
import { Button } from 'reactstrap';
import CollapseOmni from '../components/CollapseOmni';
import Panel from '../components/Panel';

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
        <Button color='primary' onClick={this.toggleHor} style={{ margin: '0.5rem' }}>Toggle horizontal</Button>
        <CollapseOmni className='collapseOmni' isOpen={this.state.collapseHor} isHorizontal collapsedSize={20}>
          <Panel title={title || 'Oops'} />
        </CollapseOmni>
      </div>
    );
  }
}

TasksContainer.propTypes = {
  title: PropTypes.string.isRequired
};

export default TasksContainer;
