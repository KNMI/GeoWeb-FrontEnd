import React, { Component } from 'react';
import { Row } from 'reactstrap';
import PropTypes from 'prop-types';

class Panel extends Component {
  render () {
    const { title, style, className, mapId, dispatch, mapActions, mapMode } = this.props;
    if (!title) {
      return (
        <div className={className ? 'Panel ' + className : 'Panel'} onClick={() => {
          if (!mapActions) return;
          if (mapMode !== 'progtemp' && mapMode !== 'timeseries' && !className) {
            dispatch(mapActions.setActivePanel(mapId));
          }
        }}>
          <Row className='title notitle' style={style} />
          <Row className='content notitle' style={style}>
            {this.props.children}
          </Row>
        </div>
      );
    } else {
      return (
        <div className={'Panel ' + className} onClick={() => {
          if (!mapActions) return;
          if (mapMode !== 'progtemp' && mapMode !== 'timeseries' && !className) {
            dispatch(mapActions.setActivePanel(mapId));
          }
        }}>
          <Row className='title' style={style}>
            {title || 'Oops'}
          </Row>
          <Row className='content' style={style}>
            {this.props.children}
          </Row>
        </div>
      );
    }
  }
}

Panel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
  style: PropTypes.object,
  className: PropTypes.string,
  mapId: PropTypes.number,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
  mapMode: PropTypes.string
};

export default Panel;
