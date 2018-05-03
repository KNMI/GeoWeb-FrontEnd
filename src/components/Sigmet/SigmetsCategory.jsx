import React, { PureComponent } from 'react';
import { Col, Row, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import CollapseOmni from '../../components/CollapseOmni';
import Icon from 'react-fa';
import SigmetEditable from '../../components/Sigmet/SigmetEditable';
import PropTypes from 'prop-types';

class SigmetsCategory extends PureComponent {
  render () {
    const { typeRef, title, icon, sigmets, isOpen, dispatch, actions } = this.props;
    const maxSize = 1000;
    const itemLimit = 5;
    return <Card className={`SigmetsCategory row accordion${isOpen ? ' open' : ''}`}>
      <Col>
        <CardHeader className='row' title={title} onClick={(evt) => dispatch(actions.toggleCategoryAction(evt, typeRef))}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col>
            {title}
          </Col>
          <Col xs='auto'>
            {sigmets.length > 0 ? <Badge color='danger' pill>{sigmets.length}</Badge> : null}
          </Col>
        </CardHeader>
        {isOpen
          ? <Row>
            <CollapseOmni className='CollapseOmni col' isOpen={isOpen} minSize={0} maxSize={maxSize}>
              <CardBlock>
                <Row>
                  <Col className='btn-group-vertical' style={{ minHeight: maxSize }}>
                    {sigmets.slice(0, itemLimit).map((sigmet, index) => {
                      return <SigmetEditable key={index} />;
                    })}
                  </Col>
                </Row>
              </CardBlock>
            </CollapseOmni>
          </Row>
          : null
        }
      </Col>
    </Card>;
  }
}

SigmetsCategory.propTypes = {
  typeRef: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.string,
  sigmets: PropTypes.array,
  isOpen: PropTypes.bool,
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    toggleCategoryAction: PropTypes.func
  })
};

export default SigmetsCategory;
