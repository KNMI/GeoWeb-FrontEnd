import React, { PureComponent } from 'react';
import { Col, Row, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import CollapseOmni from '../../components/CollapseOmni';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import { SIGMET_MODES, CATEGORY_REFS, READ_ABILITIES, PUBLISHED_ABILITIES } from '../../containers/Sigmet/SigmetActions';
import SigmetEditMode from './SigmetEditMode';
import SigmetReadMode from './SigmetReadMode';

class SigmetsCategory extends PureComponent {
  render () {
    const { typeRef, title, icon, sigmets, focussedSigmet, isOpen, dispatch, actions, abilities, phenomena, parameters } = this.props;
    const maxSize = 10000; // for now, arbitrairy big
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
              ? (sigmets.length === 1 && typeRef === CATEGORY_REFS.ADD_SIGMET)
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
                      if (focussedSigmet.uuid === sigmet.uuid && focussedSigmet.mode === SIGMET_MODES.EDIT) {
                        return <SigmetEditMode key={sigmet.uuid}
                          useGeometryForEnd={focussedSigmet.useGeometryForEnd}
                          dispatch={dispatch}
                          actions={actions}
                          abilities={abilities[SIGMET_MODES.EDIT]}
                          availablePhenomena={phenomena}
                          phenomenon={sigmet.phenomenon}
                          focus
                          uuid={sigmet.uuid}
                          obsFcTime={sigmet.obs_or_forecast.obsFcTime}
                          validdate={sigmet.validdate}
                          validdateEnd={sigmet.validdate_end}
                          issuedate={sigmet.issuedate}
                          sequence={sigmet.sequence}
                          firname={sigmet.firname}
                          locationIndicatorIcao={sigmet.location_indicator_icao}
                          locationIndicatorMwo={sigmet.location_indicator_mwo}
                          levelinfo={sigmet.levelinfo}
                          movement={sigmet.movement}
                          change={sigmet.change}
                          isObserved={sigmet.obs_or_forecast.obs}
                          drawModeStart={focussedSigmet.drawModeStart}
                          drawModeEnd={focussedSigmet.drawModeEnd}
                          hasStartCoordinates={this.props.hasStartCoordinates}
                          hasEndCoordinates={this.props.hasEndCoordinates}
                          availableFirs={parameters.firareas} />;
                      }
                      if (focussedSigmet.uuid === sigmet.uuid && focussedSigmet.mode === SIGMET_MODES.READ) {
                        console.log(focussedSigmet);
                        console.log('show drawing here');
                        dispatch(actions.setSigmetDrawing(focussedSigmet.uuid));
                      }
                      return <SigmetReadMode key={sigmet.uuid}
                        dispatch={dispatch}
                        actions={actions}
                        abilities={abilities[SIGMET_MODES.READ]}
                        focus={focussedSigmet.uuid === sigmet.uuid}
                        uuid={sigmet.uuid}
                        obsFcTime={sigmet.obs_or_forecast ? sigmet.obs_or_forecast.obsFcTime : null}
                        phenomenon={sigmet.phenomenon}
                        isObserved={sigmet.obs_or_forecast ? sigmet.obs_or_forecast.obs : null}
                        validdate={sigmet.validdate}
                        validdateEnd={sigmet.validdate_end}
                        issuedate={sigmet.issuedate}
                        sequence={sigmet.sequence}
                        firname={sigmet.firname}
                        locationIndicatorIcao={sigmet.location_indicator_icao}
                        locationIndicatorMwo={sigmet.location_indicator_mwo}
                        levelinfo={sigmet.levelinfo}
                        movement={sigmet.movement}
                        change={sigmet.change} />;
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

const abilitiesPropTypes = {};
Object.values(READ_ABILITIES).map(ability => {
  abilitiesPropTypes[ability.check] = PropTypes.bool;
});

SigmetsCategory.propTypes = {
  typeRef: PropTypes.oneOf(Object.values(CATEGORY_REFS)),
  title: PropTypes.string,
  icon: PropTypes.string,
  sigmets: PropTypes.array,
  phenomena: PropTypes.array,
  focussedSigmet: PropTypes.shape({
    uuid: PropTypes.string,
    state: PropTypes.string
  }),
  isOpen: PropTypes.bool,
  abilities: PropTypes.shape(abilitiesPropTypes),
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    toggleCategoryAction: PropTypes.func
  }),
  drawModeStart: PropTypes.string,
  drawModeEnd: PropTypes.string,
  hasStartCoordinates: PropTypes.bool,
  hasEndCoordinates: PropTypes.bool,
  parameters: PropTypes.shape({
    firareas: PropTypes.array
  })
};

export default SigmetsCategory;
