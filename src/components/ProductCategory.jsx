import React, { Component } from 'react';
import { Button, Col, Row, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import { Link } from 'react-router';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import PropTypes from 'prop-types';

class ProductCategory extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = { isOpen: props.isOpen };
  }

  toggle () {
    this.setState({ isOpen: !this.state.isOpen });
  }

  componentWillReceiveProps (nextProps) {
    if (typeof nextProps.isOpen !== 'undefined') {
      this.setState({ isOpen: nextProps.isOpen });
    }
  }

  render () {
    const { title, notifications, tasks, icon, link, parentCollapsed } = this.props;
    const maxSize = tasks ? 40 * this.tasks.length : 0;
    return (
      <Card className='row accordion'>
        {parentCollapsed ? <Link to={link}><CardHeader title={title}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col xs='auto'>&nbsp;</Col>
          <Col xs='auto'>
            {notifications > 0 ? <Badge color='danger' pill className='collapsed'>{notifications}</Badge> : null}
          </Col>
        </CardHeader></Link>
          : <CardHeader onClick={maxSize > 0 ? this.toggle : null} className={maxSize > 0 ? null : 'disabled'} title={title}>
            <Col xs='auto'>
              <Icon name={icon} />
            </Col>
            <Col style={{ marginLeft: '0.9rem' }}>
              {title}
            </Col>
            <Col xs='auto'>
              {notifications > 0 ? <Badge color='danger' pill>{notifications}</Badge> : null}
            </Col>
            <Col xs='auto'>
              <Link to={link} className='row'>
                <Button outline color='info' disabled={typeof link === 'undefined'}>
                  <Icon name='caret-right' />
                </Button>
              </Link>
            </Col>
          </CardHeader>}
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={maxSize}>
          <CardBlock>
            <Row>
              <Col className='btn-group-vertical'>
                {tasks ? tasks.map((item, i) =>
                  <Button tag='button' className='row' key={i} disabled={!item.link} >
                    <Link to={item.link} className='row'>
                      <Col xs='auto' style={{ paddingRight: '0.4rem' }}>
                        {item.eta}
                      </Col>
                      <Col>
                        {item.title}
                      </Col>
                      <Col xs='auto'>
                        {item.notifications > 0 ? <Badge pill color='danger'>{item.notifications}</Badge> : null}
                      </Col>
                      <Col xs='auto'>
                        <Icon name='caret-right' className='icon' />
                      </Col>
                    </Link>
                  </Button>
                ) : ''}
              </Col>
            </Row>
          </CardBlock>
        </CollapseOmni>
      </Card>
    );
  }
}

ProductCategory.propTypes = {
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  notifications : PropTypes.number,
  icon          : PropTypes.string,
  link          : PropTypes.string,
  tasks         : PropTypes.array,
  parentCollapsed : PropTypes.bool
};

export default ProductCategory;
