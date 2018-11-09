import React, { PureComponent } from 'react';
import { Col, Row, Badge, Card, CardHeader, CardBody } from 'reactstrap';
import CollapseOmni from '../../components/CollapseOmni';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import { SIGMET_MODES, CATEGORY_REFS, READ_ABILITIES } from '../../containers/Sigmet/SigmetActions';
import { SIGMET_VARIANTS_PREFIXES, PHENOMENON_CODE_VOLCANIC_ASH } from './SigmetTemplates';
import SigmetEditMode from './SigmetEditMode';
import SigmetReadMode from './SigmetReadMode';
import SigmetMinifiedMode from './SigmetMinifiedMode';

class SigmetsCategory extends PureComponent {
  byStartAndSequence (sigA, sigB) {
    // By valid period start (DESC) and sequence number (DESC)
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
          return seqB - seqA;
        }
        return 0;
      } else {
        return 1;
      }
    } else if (startB) {
      return -1;
    }
    if (!isNaN(seqA) && !isNaN(seqB)) {
      return seqB - seqA;
    }
    return 0;
  }
  render () {
    const { typeRef, title, icon, sigmets, focussedSigmet, geojson, copiedSigmetRef, hasEdits, tacs, isOpen, dispatch, actions, abilities,
      phenomena, parameters, displayModal } = this.props;
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
              <CardBody>
                <Row>
                  <Col className='btn-group-vertical'>
                    {sigmets.slice().sort(this.byStartAndSequence).slice(0, itemLimit).map((sigmet, index) => {
                      const isCancelFor = sigmet.cancels !== null && !isNaN(sigmet.cancels) ? parseInt(sigmet.cancels) : null;
                      const isVolcanicAsh = sigmet.phenomenon ? sigmet.phenomenon === PHENOMENON_CODE_VOLCANIC_ASH : false;
                      const isTropicalCyclone = false;
                      const prefix = isVolcanicAsh
                        ? SIGMET_VARIANTS_PREFIXES.VOLCANIC_ASH
                        : isTropicalCyclone
                          ? SIGMET_VARIANTS_PREFIXES.TROPICAL_CYCLONE
                          : SIGMET_VARIANTS_PREFIXES.NORMAL;
                      const activeFirEntry = Object.entries(parameters.firareas).filter((entry) => entry[1].firname === sigmet.firname &&
                          entry[1].location_indicator_icao === sigmet.location_indicator_icao);
                      const activeFir = Array.isArray(activeFirEntry) && activeFirEntry.length === 1
                        ? activeFirEntry[0][1]
                        : null;
                      const availableFirs = parameters.active_firs.map((firKey) => parameters.firareas[firKey]);
                      const maxHoursInAdvance = activeFir
                        ? activeFir[`${prefix}hoursbeforevalidity`]
                        : null;
                      const maxHoursDuration = activeFir
                        ? activeFir[`${prefix}maxhoursofvalidity`]
                        : null;
                      const adjacentFirs = activeFir
                        ? activeFir['adjacent_firs']
                        : null;
                      const volcanoCoordinates = Array.isArray(sigmet.va_extra_fields.volcano.position) && sigmet.va_extra_fields.volcano.position.length > 1
                        ? sigmet.va_extra_fields.volcano.position
                        : [null, null];
                      if (focussedSigmet.uuid === sigmet.uuid) {
                        if (focussedSigmet.mode === SIGMET_MODES.EDIT) {
                          return <SigmetEditMode key={sigmet.uuid}
                            dispatch={dispatch}
                            actions={actions}
                            abilities={abilities[SIGMET_MODES.EDIT]}
                            copiedSigmetRef={copiedSigmetRef}
                            hasEdits={hasEdits}
                            isVolcanicAsh={isVolcanicAsh}
                            availablePhenomena={phenomena.slice().sort((phA, phB) => {
                              const nameA = phA.name.toUpperCase();
                              const nameB = phB.name.toUpperCase();
                              return nameA < nameB
                                ? -1
                                : nameA > nameB
                                  ? 1
                                  : 0;
                            })}
                            phenomenon={sigmet.phenomenon}
                            volcanoName={sigmet.va_extra_fields.volcano.name || null}
                            volcanoCoordinates={volcanoCoordinates}
                            isNoVolcanicAshExpected={sigmet.va_extra_fields.no_va_expected}
                            focus
                            uuid={sigmet.uuid}
                            distributionType={sigmet.type}
                            sigmet={sigmet}
                            geojson={geojson}
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
                            feedbackStart={focussedSigmet.feedbackStart}
                            feedbackEnd={focussedSigmet.feedbackEnd}
                            hasStartCoordinates={this.props.hasStartCoordinates}
                            hasEndCoordinates={this.props.hasEndCoordinates}
                            availableFirs={availableFirs}
                            maxHoursInAdvance={maxHoursInAdvance}
                            maxHoursDuration={maxHoursDuration}
                            tac={{ code: focussedSigmet.tac }}
                          />;
                        } else {
                          return <SigmetReadMode key={sigmet.uuid}
                            dispatch={dispatch}
                            actions={actions}
                            abilities={abilities[SIGMET_MODES.READ]}
                            copiedSigmetRef={copiedSigmetRef}
                            focus={focussedSigmet.uuid === sigmet.uuid}
                            uuid={sigmet.uuid}
                            distributionType={sigmet.type}
                            tac={tacs && tacs.find((tac) => tac.uuid === sigmet.uuid)}
                            isVolcanicAsh={isVolcanicAsh}
                            obsFcTime={sigmet.obs_or_forecast ? sigmet.obs_or_forecast.obsFcTime : null}
                            phenomenon={sigmet.phenomenon}
                            isObserved={sigmet.obs_or_forecast ? sigmet.obs_or_forecast.obs : null}
                            volcanoName={sigmet.va_extra_fields.volcano.name || null}
                            volcanoCoordinates={volcanoCoordinates}
                            isNoVolcanicAshExpected={sigmet.va_extra_fields.no_va_expected}
                            validdate={sigmet.validdate}
                            validdateEnd={sigmet.validdate_end}
                            hasStartCoordinates={this.props.hasStartCoordinates}
                            hasStartIntersectionCoordinates={this.props.hasStartIntersectionCoordinates}
                            hasEndCoordinates={this.props.hasEndCoordinates}
                            hasEndIntersectionCoordinates={this.props.hasEndIntersectionCoordinates}
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
                            maxHoursInAdvance={maxHoursInAdvance}
                            maxHoursDuration={maxHoursDuration}
                            displayModal={displayModal}
                            adjacentFirs={adjacentFirs}
                            moveTo={sigmet.va_extra_fields.move_to}
                          />;
                        }
                      }
                      return <SigmetMinifiedMode key={sigmet.uuid}
                        dispatch={dispatch}
                        actions={actions}
                        uuid={sigmet.uuid}
                        distributionType={sigmet.type}
                        tac={tacs && tacs.find((tac) => tac.uuid === sigmet.uuid)}
                        phenomenon={sigmet.phenomenon}
                        validdate={sigmet.validdate}
                        validdateEnd={sigmet.validdate_end}
                        isCancelFor={isCancelFor}
                      />;
                    })}
                  </Col>
                </Row>
              </CardBody>
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
  hasEndIntersectionCoordinates: PropTypes.bool,
  parameters: PropTypes.shape({
    firareas: PropTypes.object,
    active_firs: PropTypes.array
  }),
  tacs: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
    code: PropTypes.string
  })),
  copiedSigmetRef: PropTypes.string,
  geojson: PropTypes.object,
  displayModal: PropTypes.string
};

export default SigmetsCategory;
