import React, { PureComponent } from 'react';
import { Col, Row, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import CollapseOmni from '../../components/CollapseOmni';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import { SIGMET_MODES, CATEGORY_REFS, READ_ABILITIES } from '../../containers/Sigmet/SigmetActions';
import SigmetEditMode from './SigmetEditMode';
import SigmetReadMode from './SigmetReadMode';
import SigmetMinifiedMode from './SigmetMinifiedMode';

class SigmetsCategory extends PureComponent {
  byStartAndSequence (sigA, sigB) {
    const startA = sigA.hasOwnProperty('validdate') && sigA.validdate;
    const startB = sigB.hasOwnProperty('validdate') && sigB.validdate;
    const seqA = sigA.hasOwnProperty('sequence') && sigA.sequence;
    const seqB = sigB.hasOwnProperty('sequence') && sigB.sequence;
    if (startA) {
      if (startB) {
        if (startA < startB) {
          return 1;
        }
        if (startB < startA) {
          return -1;
        }
        if (!isNaN(seqA) && !isNaN(seqB)) {
          return seqA - seqB;
        }
        return 0;
      } else {
        return 1;
      }
    } else if (startB) {
      return -1;
    }
    if (!isNaN(seqA) && !isNaN(seqB)) {
      return seqA - seqB;
    }
    return 0;
  }
  render () {
    const { typeRef, title, icon, sigmets, focussedSigmet, copiedSigmetRef, hasEdits, tacs, isOpen, dispatch, actions, abilities, phenomena, parameters } = this.props;
    const maxSize = 10000; // for now, arbitrairy big
    const itemLimit = 25;
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
                    {sigmets.slice().sort(this.byStartAndSequence).slice(0, itemLimit).map((sigmet, index) => {
                      const isCancelFor = sigmet.cancels !== null && !isNaN(sigmet.cancels) ? parseInt(sigmet.cancels) : null;
                      if (focussedSigmet.uuid === sigmet.uuid) {
                        if (focussedSigmet.mode === SIGMET_MODES.EDIT) {
                          return <SigmetEditMode key={sigmet.uuid}
                            dispatch={dispatch}
                            actions={actions}
                            abilities={abilities[SIGMET_MODES.EDIT]}
                            copiedSigmetRef={copiedSigmetRef}
                            hasEdits={hasEdits}
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
                            movementType={sigmet.movement_type}
                            movement={sigmet.movement}
                            change={sigmet.change}
                            isObserved={sigmet.obs_or_forecast.obs}
                            drawModeStart={focussedSigmet.drawModeStart}
                            drawModeEnd={focussedSigmet.drawModeEnd}
                            hasStartCoordinates={this.props.hasStartCoordinates}
                            hasEndCoordinates={this.props.hasEndCoordinates}
                            availableFirs={parameters.firareas}
                            maxHoursInAdvance={parameters.hoursbeforevalidity}
                            maxHoursDuration={parameters.maxhoursofvalidity}
                          />;
                        } else {
                          return <SigmetReadMode key={sigmet.uuid}
                            dispatch={dispatch}
                            actions={actions}
                            abilities={abilities[SIGMET_MODES.READ]}
                            copiedSigmetRef={copiedSigmetRef}
                            focus={focussedSigmet.uuid === sigmet.uuid}
                            uuid={sigmet.uuid}
                            tac={tacs && tacs.find((tac) => tac.uuid === sigmet.uuid)}
                            obsFcTime={sigmet.obs_or_forecast ? sigmet.obs_or_forecast.obsFcTime : null}
                            phenomenon={sigmet.phenomenon}
                            isObserved={sigmet.obs_or_forecast ? sigmet.obs_or_forecast.obs : null}
                            validdate={sigmet.validdate}
                            validdateEnd={sigmet.validdate_end}
                            hasStartCoordinates={this.props.hasStartCoordinates}
                            hasStartIntersectionCoordinates={this.props.hasStartIntersectionCoordinates}
                            isCancelFor={isCancelFor}
                            issuedate={sigmet.issuedate}
                            sequence={sigmet.sequence}
                            firname={sigmet.firname}
                            locationIndicatorIcao={sigmet.location_indicator_icao}
                            locationIndicatorMwo={sigmet.location_indicator_mwo}
                            levelinfo={sigmet.levelinfo}
                            movementType={sigmet.movement_type}
                            movement={sigmet.movement}
                            change={sigmet.change}
                            maxHoursInAdvance={parameters.hoursbeforevalidity}
                            maxHoursDuration={parameters.maxhoursofvalidity}
                          />;
                        }
                      }
                      return <SigmetMinifiedMode key={sigmet.uuid}
                        dispatch={dispatch}
                        actions={actions}
                        abilities={abilities[SIGMET_MODES.READ]}
                        copiedSigmetRef={copiedSigmetRef}
                        focus={focussedSigmet.uuid === sigmet.uuid}
                        uuid={sigmet.uuid}
                        tac={tacs && tacs.find((tac) => tac.uuid === sigmet.uuid)}
                        obsFcTime={sigmet.obs_or_forecast ? sigmet.obs_or_forecast.obsFcTime : null}
                        phenomenon={sigmet.phenomenon}
                        isObserved={sigmet.obs_or_forecast ? sigmet.obs_or_forecast.obs : null}
                        validdate={sigmet.validdate}
                        validdateEnd={sigmet.validdate_end}
                        hasStartCoordinates={this.props.hasStartCoordinates}
                        hasStartIntersectionCoordinates={this.props.hasStartIntersectionCoordinates}
                        isCancelFor={isCancelFor}
                        issuedate={sigmet.issuedate}
                        sequence={sigmet.sequence}
                        firname={sigmet.firname}
                        locationIndicatorIcao={sigmet.location_indicator_icao}
                        locationIndicatorMwo={sigmet.location_indicator_mwo}
                        levelinfo={sigmet.levelinfo}
                        movement={sigmet.movement}
                        change={sigmet.change}
                        maxHoursInAdvance={parameters.hoursbeforevalidity}
                        maxHoursDuration={parameters.maxhoursofvalidity}
                      />;
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
  hasEdits: PropTypes.bool,
  isOpen: PropTypes.bool,
  abilities: PropTypes.shape(abilitiesPropTypes),
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    toggleCategoryAction: PropTypes.func
  }),
  hasStartCoordinates: PropTypes.bool,
  hasStartIntersectionCoordinates: PropTypes.bool,
  hasEndCoordinates: PropTypes.bool,
  parameters: PropTypes.shape({
    firareas: PropTypes.array
  }),
  tacs: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
    code: PropTypes.string
  })),
  copiedSigmetRef: PropTypes.string
};

export default SigmetsCategory;
