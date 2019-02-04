import React, { PureComponent } from 'react';
import hasClass from '../../utils/hasclass';
import classNames from 'classnames';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class WhatSection extends PureComponent {
  render () {
    const {isWindNeeded, isVisibilityNeeded, isLevelNeeded} = this.props;
    const children = {};
    if (!Array.isArray(this.props.children)) {
      children[this.props.children.props['data-field']] = this.props.children;
    } else {
      this.props.children.map(child => {
        if (child && child.props) {
          if (children[child.props['data-field']]) {
            console.warn('Data field [' + child.props['data-field' + '] is already set, skipping previous']);
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
        {children.wind_direction
          ? <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Direction</Badge>
            </Col>
            <Col xs='9'>
            {children.wind_direction}
            {children.wind_direction && hasClass(children.wind_direction.props.className, 'required')
              ? <span className={classNames('required', { missing: hasClass(children.wind_direction.props.className, 'missing') })} />
              : null
            }
            </Col>
          </Row>
          : null
        }
        {children.wind_speed
          ? <Row className={isWindNeeded ? 'disabled' : null}>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Speed</Badge>
            </Col>
            <Col xs='9'>
              {children.wind_speed}
              {children.wind_speed && children.wind_speed.props.selected
                ? <span className={children.wind_speed.props.selected.length > 0 ? 'required' : 'required missing'} />
                : null
              }
            </Col>
          </Row>
          : null
        }
        {children.visibility
          ? <Row /*className={isVisibilityNeeded ? 'disabled' : null}*/>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Visibility</Badge>
            </Col>
            <Col xs='9'>
              {children.visibility}
            </Col>
          </Row>
          : null
        }
        {children.cause
          ? <Row /*className={isVisibilityNeeded ? 'disabled' : null}*/>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Cause</Badge>
            </Col>
            <Col xs='9'>
              {children.cause}
            </Col>
          </Row>
          : null
        }
        {children.level
          ? <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Level Up</Badge>
            </Col>
            <Col xs={{ size: 2, offset: 3 }}>
              {children['above-toggle']}
            </Col>
            <Col xs='5'>
              {children['at-above-altitude'] && children['at-above-altitude'].props && !children['at-above-altitude'].props.disabled
                ? <span className={children['at-above-altitude'].props.className === 'missing' ? 'required missing' : 'required'} />
                : null
              }
            </Col>
          </Row> 
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
  ])),
  isWindNeeded: PropTypes.bool,
  //isVisibilityNeeded: PropTypes.bool,
  isLevelNeeded: PropTypes.bool
};
