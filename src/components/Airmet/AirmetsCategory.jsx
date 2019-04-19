import React, { PureComponent } from 'react';
import { Col, Row, Badge, Card, CardHeader, CardBody } from 'reactstrap';
import CollapseOmni from '../../components/CollapseOmni';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import { CATEGORY_REFS, READ_ABILITIES } from '../../containers/Airmet/AirmetActions';
import { AIRMET_MODES, AIRMET_VARIANTS_PREFIXES, AIRMET_TYPES, PARAMS_NEEDED } from './AirmetTemplates';
import AirmetEditMode from './AirmetEditMode';
import AirmetReadMode from './AirmetReadMode';
import AirmetMinifiedMode from './AirmetMinifiedMode';

class AirmetsCategory extends PureComponent {
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

  derivedAirmetProperties (airmet, selectedAirmet, parameters, availablePhenomena) {
    const isSelectedAirmet = selectedAirmet && airmet.uuid === selectedAirmet.uuid;
    const airmetToShow = isSelectedAirmet ? selectedAirmet : airmet;
    const isCancelFor = airmetToShow.cancels !== null && !isNaN(airmetToShow.cancels)
      ? parseInt(airmetToShow.cancels)
      : null;
    const filteredPhenomena = isSelectedAirmet
      ? availablePhenomena.filter((entry) => entry.code === selectedAirmet.phenomenon)
      : [];
    const specificPhenomena = filteredPhenomena.length > 0
      ? {
        isWindNeeded: filteredPhenomena[0].paraminfo === PARAMS_NEEDED.NEEDS_WIND,
        isCloudLevelsNeeded: filteredPhenomena[0].paraminfo === PARAMS_NEEDED.NEEDS_CLOUDLEVELS,
        isObscuringNeeded: filteredPhenomena[0].paraminfo === PARAMS_NEEDED.NEEDS_OBSCURATION,
        isLevelFieldNeeded: filteredPhenomena[0].paraminfo === PARAMS_NEEDED.NEEDS_NONE
      }
      : {
        isWindNeeded: false,
        isCloudLevelsNeeded: false,
        isObscuringNeeded: false,
        isLevelFieldNeeded: false
      };
    const prefix = AIRMET_VARIANTS_PREFIXES.NORMAL;
    const activeFirEntry = Object.entries(parameters.firareas).filter((entry) => entry[1].firname === airmetToShow.firname &&
      entry[1].location_indicator_icao === airmetToShow.location_indicator_icao);
    const activeFir = Array.isArray(activeFirEntry) && activeFirEntry.length === 1
      ? activeFirEntry[0][1]
      : null;

    const maxHoursInAdvance = activeFir
      ? activeFir[`${prefix}hoursbeforevalidity`]
      : null;
    const maxHoursDuration = activeFir
      ? activeFir[`${prefix}maxhoursofvalidity`]
      : null;
    const adjacentFirs = activeFir
      ? activeFir['adjacent_firs']
      : null;
    return {
      isSelectedAirmet,
      airmetToShow,
      isCancelFor,
      maxHoursInAdvance,
      maxHoursDuration,
      isWindNeeded : specificPhenomena.isWindNeeded,
      isCloudLevelsNeeded : specificPhenomena.isCloudLevelsNeeded,
      isObscuringNeeded : specificPhenomena.isObscuringNeeded,
      isLevelFieldNeeded : specificPhenomena.isLevelFieldNeeded,
      adjacentFirs
    };
  }

  render () {
    const { typeRef, title, icon, airmets, selectedAirmet, selectedAuxiliaryInfo, geojson, copiedAirmetRef, isOpen, dispatch, actions, abilities,
      phenomena, parameters, obscuringPhenomena, displayModal, hasStartCoordinates, hasStartIntersectionCoordinates } = this.props;
    const maxSize = 10000; // for now, arbitrairy big
    const itemLimit = 25;
    const isCreateCategory = typeRef === CATEGORY_REFS.ADD_AIRMET;
    const isOpenable = (isOpen || airmets.length > 0 || isCreateCategory);
    const availableFirs = parameters.active_firs.map((firKey) => parameters.firareas[firKey]);
    const availablePhenomena = phenomena.slice().sort((phA, phB) => {
      const nameA = phA.name.toUpperCase();
      const nameB = phB.name.toUpperCase();
      return nameA < nameB
        ? -1
        : nameA > nameB
          ? 1
          : 0;
    });
    const airmetCollection = airmets.length === 0 && isCreateCategory && selectedAirmet
      ? [selectedAirmet]
      : airmets.slice().sort(this.byStartAndSequence).slice(0, itemLimit);

    return <Card className={`AirmetsCategory row accordion${isOpen ? ' open' : ''}${isOpenable ? ' openable' : ''}`}>
      <Col>
        <CardHeader className='row' title={title} onClick={isOpenable ? (evt) => dispatch(actions.toggleCategoryAction(evt, typeRef)) : null}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col>
            {title}
          </Col>
          <Col xs='auto'>
            {airmets.length > 0
              ? <Badge color='danger' pill>{airmets.length}</Badge>
              : isCreateCategory
                ? <Badge color='danger' pill><Icon name='plus' /></Badge>
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
                    {airmetCollection.map((airmet) => {
                      const { isSelectedAirmet, isWindNeeded, isCloudLevelsNeeded, isObscuringNeeded, isLevelFieldNeeded, isCancelFor, maxHoursInAdvance, maxHoursDuration,
                        adjacentFirs, airmetToShow } = this.derivedAirmetProperties(airmet, selectedAirmet, parameters, availablePhenomena);
                      // Render selected AIRMET
                      if (isSelectedAirmet) {
                        const AirmetComponent = selectedAuxiliaryInfo.mode === AIRMET_MODES.EDIT ? AirmetEditMode : AirmetReadMode;
                        return <AirmetComponent key={`AIRMET-${airmetToShow.uuid}`}
                          dispatch={dispatch}
                          actions={actions}
                          abilities={abilities[selectedAuxiliaryInfo.mode]}
                          copiedAirmetRef={copiedAirmetRef}
                          hasEdits={selectedAuxiliaryInfo.hasEdits}
                          isWindNeeded={isWindNeeded}
                          isCloudLevelsNeeded={isCloudLevelsNeeded}
                          isObscuringNeeded={isObscuringNeeded}
                          isLevelFieldNeeded={isLevelFieldNeeded}
                          availablePhenomena={availablePhenomena}
                          obscuringPhenomena={obscuringPhenomena}
                          focus
                          airmet={airmetToShow}
                          geojson={geojson}
                          drawModeStart={selectedAuxiliaryInfo.drawModeStart}
                          feedbackStart={selectedAuxiliaryInfo.feedbackStart}
                          hasStartCoordinates={hasStartCoordinates}
                          hasStartIntersectionCoordinates={hasStartIntersectionCoordinates}
                          availableFirs={availableFirs}
                          maxHoursInAdvance={maxHoursInAdvance}
                          maxHoursDuration={maxHoursDuration}
                          isCancelFor={isCancelFor}
                          displayModal={displayModal}
                          adjacentFirs={adjacentFirs}
                        />;
                      }

                      // Render not selected AIRMET
                      return <AirmetMinifiedMode key={`AIRMET-${airmetToShow.uuid}`}
                        dispatch={dispatch}
                        actions={actions}
                        uuid={airmetToShow.uuid}
                        distributionType={airmetToShow.type}
                        tac={airmetToShow.tac}
                        phenomenon={airmetToShow.phenomenon}
                        validdate={airmetToShow.validdate}
                        validdateEnd={airmetToShow.validdate_end}
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
Object.values(READ_ABILITIES).forEach(ability => {
  abilitiesPropTypes[ability.check] = PropTypes.bool;
});

AirmetsCategory.propTypes = {
  typeRef: PropTypes.oneOf(Object.values(CATEGORY_REFS)),
  title: PropTypes.string,
  icon: PropTypes.string,
  airmets: PropTypes.arrayOf(AIRMET_TYPES.AIRMET),
  selectedAirmet: AIRMET_TYPES.AIRMET,
  selectedAuxiliaryInfo: AIRMET_TYPES.AUXILIARY_INFO,
  phenomena: PropTypes.array,
  obscuringPhenomena: PropTypes.arrayOf(AIRMET_TYPES.OBSCURING_PHENOMENON),
  isOpen: PropTypes.bool,
  abilities: PropTypes.shape(abilitiesPropTypes),
  dispatch: PropTypes.func,
  actions: PropTypes.shape({
    toggleCategoryAction: PropTypes.func
  }),
  hasStartCoordinates: PropTypes.bool,
  hasStartIntersectionCoordinates: PropTypes.bool,
  parameters: PropTypes.shape({
    firareas: PropTypes.object,
    active_firs: PropTypes.array
  }),
  copiedAirmetRef: PropTypes.string,
  geojson: PropTypes.object,
  displayModal: PropTypes.string
};

export default AirmetsCategory;
