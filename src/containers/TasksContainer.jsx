import React, { Component, PropTypes } from 'react';
import { Button, Row, Col } from 'reactstrap';
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
      <Col className='TasksContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.collapseHor} isHorizontal collapsedSize={68}>
          <Panel className='Panel' title={title || 'Oops'}>
            <Row>
              <Button color='primary' onClick={this.toggleHor} style={{ margin: '0.5rem' }}>Toggle horizontal</Button>
            </Row>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

TasksContainer.propTypes = {
  title: PropTypes.string.isRequired
};

export default TasksContainer;
