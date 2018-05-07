import React, { PureComponent } from 'react';
import { Col, Row, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import CollapseOmni from '../../components/CollapseOmni';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import { SIGMET_STATES } from '../../containers/Sigmet/SigmetActions';
import SigmetEditMode from './SigmetEditMode';
import SigmetReadMode from './SigmetReadMode';

class SigmetsCategory extends PureComponent {
  render () {
    const { typeRef, title, icon, sigmets, focussedSigmet, isOpen, dispatch, actions, stageActions } = this.props;
    const maxSize = 1000;
    const itemLimit = 15;
    const isOpenable = (isOpen || (!isOpen && sigmets.length > 0));
    return <Card className={`SigmetsCategory row accordion${isOpen ? ' open' : ''}${isOpenable ? ' openable' : ''}`}>
      <Col>
        <CardHeader className='row' title={title} onClick={isOpenable ? (evt) => dispatch(actions.toggleCategoryAction(evt, typeRef)) : null}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col>
            {title}
          </Col>
          <Col xs='auto'>
            {sigmets.length > 0
              ? (sigmets.length === 1 && typeRef === 'add-sigmet')
                ? <Badge color='danger' pill><Icon name='plus' /></Badge>
                : <Badge color='danger' pill>{sigmets.length}</Badge>
              : null
            }
          </Col>
        </CardHeader>
        {isOpen
          ? <Row>
            <CollapseOmni className='CollapseOmni col' isOpen={isOpen} minSize={0} maxSize={maxSize}>
              <CardBlock>
                <Row>
                  <Col className='btn-group-vertical'>
                    {sigmets.slice(0, itemLimit).map((sigmet, index) => {
                      if (focussedSigmet.uuid === sigmet.uuid) {
                        switch (focussedSigmet.state) {
                          case SIGMET_STATES.EDIT:
                            return <SigmetEditMode key={index} uuid={sigmet.uuid} />;
                        }
                      }
                      return <SigmetReadMode key={sigmet.uuid}
                        dispatch={dispatch}
                        actions={actions}
                        {...stageActions}
                        uuid={sigmet.uuid}
                        phenomenon={sigmet.phenomenon}
                        isObserved={!(sigmet.obs_or_forecast && sigmet.obs_or_forecast.obsFcTime)} />;
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
  focussedSigmet: PropTypes.shape({
    uuid: PropTypes.string,
    state: PropTypes.string
  }),
  isOpen: PropTypes.bool,
  stageActions: PropTypes.shape({
    isEditable: PropTypes.bool,
    isPublishable: PropTypes.bool,
    isCancelable: PropTypes.bool,
    isDeletable: PropTypes.bool,
    isCloneable: PropTypes.bool
  }),
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    toggleCategoryAction: PropTypes.func
  })
};

export default SigmetsCategory;
