import React, { Component, PropTypes } from 'react';
import { Button, Col, Row, InputGroupButton, InputGroup } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import Panel from '../components/Panel';

class MapActionContainer extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = { collapse: false };
  }

  toggle () {
    this.setState({ collapse: !this.state.collapse });
  }

  render () {
    const { title } = this.props;
    const items = [
      {
        title: 'Pan / zoom',
        icon: '✋',
        active: true
      },
      {
        title: 'Zoom to rectangle',
        icon: '🔍'
      },
      {
        title: 'Draw polygon',
        icon: '☈'
      },
      {
        title: 'Measure distance',
        icon: '↦'
      },
      {
        title: 'Show time series',
        icon: '📈',
        disabled: true
      }
    ];

    return (
      <Col className='MapActionContainer'>
        <Panel className='Panel' title={title}>
          {items.map((item, index) =>
            <Button color='primary' key={index} active={item.active || null} disabled={item.disabled || null}
              className='row' title={item.title}>{item.icon}</Button>)}
          <Row style={{ flex: 1 }} />
          <Button color='primary' className='row' title='Add layer'>☰</Button>
          <Button color='primary' className='row' title='Play animation'>▶</Button>
          <Button color='primary' className='row' title='Go to current time'>🕜</Button>
        </Panel>
      </Col>
    );
  }
}

MapActionContainer.propTypes = {
  title: PropTypes.string
};

export default MapActionContainer;
