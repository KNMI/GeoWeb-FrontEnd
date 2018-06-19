import React, { PureComponent } from 'react';
import { Row, Col, Alert, ListGroup, ListGroupItem } from 'reactstrap';
import PropTypes from 'prop-types';

export default class FeedBackSection extends PureComponent {
  render () {
    const { status } = this.props;
    const children = {};
    this.props.children.forEach(child => {
      if (child && child.props) {
        children[child.props['data-field']] = child;
      }
    });
    const flatten = list => list.reduce(
      (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
    );
    return <Row className='TafFeedbackSection'>
      <Alert color={status} className='TafFeedbackSection col'>
        <Row className='alert-heading'>
          <Col>{children.title}</Col>
        </Row>
        {children.subTitle
          ? <Row>
            <Col>
              {children.subTitle}
            </Col>
          </Row>
          : null
        }
        {children.list
          ? <Row>
            <Col>
              <ListGroup>
                {(flatten(Object.values(children.list).filter(v => Array.isArray(v)))).map((value, index) => {
                  return (<ListGroupItem key={'errmessageno' + index} color={status}
                    style={{ borderColor: '#a94442' }}>{(index + 1)} - {value}</ListGroupItem>);
                })}
              </ListGroup>
            </Col>
          </Row>
          : null
        }
      </Alert>
    </Row>;
  }
}

FeedBackSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
  status: PropTypes.string
};
