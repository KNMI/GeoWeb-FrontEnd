import React, { Component, PropTypes } from 'react';
import { default as Adaguc } from '../routes/ADAGUC/components/Adaguc';
import { default as Panel } from './Panel';
import { Row, Col } from 'reactstrap';

export class SinglePanel extends Component {
  render () {
    const { title, adagucProperties, dispatch, actions, master } = this.props;
    return (<Panel title={title}>
      <Adaguc adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} master={master} />
    </Panel>);
  }
}
class MapPanel extends Component {
  render () {
    const { title, adagucProperties, dispatch, actions } = this.props;

    switch (adagucProperties.layout) {
      case 'dual':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6'>
              <SinglePanel title={title} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} master />
            </Col>
            <Col xs='6'>
              <SinglePanel title={title} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
            </Col>
          </Row>
        );
      case 'quaduneven':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6'>
              <SinglePanel title={title} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} master />
            </Col>
            <Col xs='6' style={{ flexDirection: 'column' }} >
              <Col>
                <SinglePanel title={title} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
              </Col>
              <Col>
                <SinglePanel title={title} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
              </Col>
              <Col>
                <SinglePanel title={title} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
              </Col>
            </Col>
          </Row>
        );
      case 'quadcol':
        return (<Row style={{ flex: 1 }}>
          <Col xs='6'>
            <Col xs='6'>
              <SinglePanel title={title} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} master />
            </Col>
            <Col xs='6'>
              <SinglePanel title={title} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
            </Col>
          </Col>
          <Col xs='6'>
            <Col xs='6'>
              <SinglePanel title={title} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
            </Col>
            <Col xs='6'>
              <SinglePanel title={title} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
            </Col>
          </Col>
        </Row>);
      case 'single':
      default:
        return (
          <SinglePanel title={title} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} master />
        );
    }
  }
}
SinglePanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  adagucProperties: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  master: PropTypes.bool
};
MapPanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  adagucProperties: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};

export default MapPanel;
