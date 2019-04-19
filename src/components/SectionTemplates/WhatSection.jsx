import React, { PureComponent } from 'react';
import hasClass from '../../utils/hasclass';
import classNames from 'classnames';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class WhatSection extends PureComponent {
  render () {
    const children = {};
    if (!Array.isArray(this.props.children)) {
      children[this.props.children.props['data-field']] = this.props.children;
    } else {
      this.props.children.forEach(child => {
        if (child && child.props) {
          if (children[child.props['data-field']]) {
            console.warn('Data field [' + child.props['data-field'] + '] is already set, skipping previous');
          }
          children[child.props['data-field']] = child;
        }
      });
    }

    return <Row className='What'>
      <Col>
        <Row>
          <Col xs='3'>
            <Badge color='success'>What</Badge>
          </Col>
          <Col xs='9'>
            {children.phenomenon}
            {children.phenomenon && children.phenomenon.props.selected
              ? <span className={children.phenomenon.props.selected.length > 0 ? 'required' : 'required missing'} />
              : null
            }
          </Col>
        </Row>
        {children.obs_or_fcst
          ? <Row>
            <Col xs={{ size: 9, offset: 3 }}>
              {children.obs_or_fcst}
            </Col>
          </Row>
          : null
        }
        {children.obsFcTime
          ? <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>At</Badge>
            </Col>
            <Col xs='9'>
              {children.obsFcTime}
            </Col>
          </Row>
          : null
        }
        {children.volcano_name || (children.volcano_coordinates_lat && children.volcano_coordinates_lon)
          ? <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Volcano</Badge>
            </Col>
            <Col xs='9'>
              {children.volcano_name}
            </Col>
          </Row>
          : null
        }
        {children.volcano_coordinates_lat && children.volcano_coordinates_lon
          ? <Row>
            <Col xs={{ size: 1, offset: 3 }}>
              <Badge>Lat</Badge>
            </Col>
            <Col xs='3'>
              {children.volcano_coordinates_lat}
            </Col>
            <Col xs={{ size: 1, offset: 1 }}>
              <Badge>Lon</Badge>
            </Col>
            <Col xs='3'>
              {children.volcano_coordinates_lon}
            </Col>
          </Row>
          : null
        }
        {children.wind_direction && children.wind_speed
          ? <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Wind</Badge>
            </Col>
            <Col xs='4'>
              {children.wind_direction}
              {children.wind_direction && hasClass(children.wind_direction.props.className, 'required')
                ? <span className={classNames('required', { missing: hasClass(children.wind_direction.props.className, 'missing') })} />
                : null
              }
            </Col>
            <Col xs={{ size: 4, offset: 1 }}>
              {children.wind_speed}
            </Col>
          </Row>
          : null
        }
        {children.visibility
          ? <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Visibility</Badge>
            </Col>
            <Col xs='9'>
              {children.visibility}
              {children.visibility && hasClass(children.visibility.props.className, 'required')
                ? <span className={classNames('required', { missing: hasClass(children.visibility.props.className, 'missing') })} />
                : null
              }
            </Col>
          </Row>
          : null
        }
        {children.obscuring
          ? <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Cause</Badge>
            </Col>
            <Col xs='9'>
              {children.obscuring}
              {children.obscuring && children.obscuring.props.selected
                ? <span className={children.obscuring.props.selected.length > 0 ? 'required' : 'required missing'} />
                : null
              }
            </Col>
          </Row>
          : null
        }
        {children.cloud_levels
          ? children.cloud_levels
          : null
        }
      </Col>
    </Row>;
  }
}

WhatSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
    PropTypes.object
  ]))
};
