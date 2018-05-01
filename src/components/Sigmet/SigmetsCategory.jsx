import React, { PureComponent } from 'react';
import { Col, Row, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import CollapseOmni from '../../components/CollapseOmni';
import Icon from 'react-fa';
import SigmetEditable from '../../components/Sigmet/SigmetEditable';
import PropTypes from 'prop-types';

class SigmetsCategory extends PureComponent {
  render () {
    const { title, icon, sigmets, isOpen } = this.props;
    const maxSize = 1000;
    const itemLimit = 5;
    return <Card className='SigmetsCategory row accordion'>
      <Col>
        <CardHeader className='row' title={title} style={{ minHeight: '2.5rem' }}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col style={{ marginLeft: '0.9rem' }}>
            {title}
          </Col>
          <Col xs='auto'>
            {sigmets.length > 0 ? <Badge color='danger' pill>{sigmets.length}</Badge> : null}
          </Col>
        </CardHeader>
        <Row style={{ flex: 'auto', overflowY: 'auto' }}>
          <CollapseOmni className='CollapseOmni col' isOpen={isOpen} minSize={0} maxSize={maxSize}>
            <CardBlock>
              {isOpen
                ? <Row>
                  <Col className='btn-group-vertical' style={{ minWidth: 0, flexGrow: 1, minHeight: maxSize }}>
                    {sigmets.slice(0, itemLimit).map((sigmet, index) => {
                      return <SigmetEditable key={index} />;
                    })}
                  </Col>
                </Row>
                : null
              }
            </CardBlock>
          </CollapseOmni>
        </Row>
      </Col>
    </Card>;
  }
}

SigmetsCategory.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
  sigmets: PropTypes.array,
  isOpen: PropTypes.bool
};

export default SigmetsCategory;
