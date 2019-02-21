import React, { Component } from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';
import produce from 'immer';
import isEqual from 'lodash.isequal';

import Panel from '../../components/Panel';
import CollapseOmni from '../../components/CollapseOmni';
import { CATEGORY_REFS, INITIAL_STATE, LOCAL_ACTIONS } from './AirmetActions';
import dispatch from './AirmetReducers';

import ContainerHeader from '../../components/Airmet/ContainerHeader';
import AirmetsCategory from '../../components/Airmet/AirmetsCategory';
import MinifiedCategory from '../../components/Airmet/MinifiedCategory';
import { isFeatureGeoJsonComplete } from '../../utils/json';

class AirmetsContainer extends Component {
  constructor (props) {
    super(props);
    this.localDispatch = this.localDispatch.bind(this);
    this.findFeatureByFunction = this.findFeatureByFunction.bind(this);
    this.state = produce(INITIAL_STATE, draftState => {});
  }

  localDispatch (localAction) {
    return dispatch(localAction, this);
  };

  findFeatureByFunction (functionName, containerProperties = this.props) {
    if (containerProperties.drawProperties.adagucMapDraw.geojson.features) {
      return containerProperties.drawProperties.adagucMapDraw.geojson.features.find((feature) => feature.properties.featureFunction === functionName);
    }
    return null;
  }

  componentDidUpdate (prevProps) {
    const { geojson: currentGeoJson } = this.props.drawProperties.adagucMapDraw;
    if (prevProps.drawProperties.adagucMapDraw.geojson.features && currentGeoJson.features) {
      const prevStartFeature = this.findFeatureByFunction('start', prevProps);
      const currentStartFeature = this.findFeatureByFunction('start');
      if (!prevStartFeature || !currentStartFeature) {
        return;
      }
      if (!isEqual(prevStartFeature, currentStartFeature)) {
        this.localDispatch(LOCAL_ACTIONS.toggleHasEdits(null, true))
          .then(() =>
            this.localDispatch(LOCAL_ACTIONS.createFirIntersectionAction(currentStartFeature.id, currentGeoJson)))
          .then((hasCreatedFirIntersection) => {
            if (hasCreatedFirIntersection && this.state.selectedAirmet.length > 0) {
              this.localDispatch(LOCAL_ACTIONS.verifyAirmetAction(this.state.selectedAirmet[0]));
            }
          }).catch((error) => {
            console.warn(error);
          });
      }
    }
  }

  componentDidMount () {
    this.localDispatch(LOCAL_ACTIONS.retrieveParametersAction());
    this.localDispatch(LOCAL_ACTIONS.retrievePhenomenaAction());
    this.localDispatch(LOCAL_ACTIONS.retrieveObscuringPhenomenaAction());
    this.localDispatch(LOCAL_ACTIONS.retrieveAirmetsAction());
  }

  componentWillUnmount () {
    this.localDispatch(LOCAL_ACTIONS.cleanupAction());
  }

  render () {
    const maxSize = 580;
    const { isContainerOpen, selectedAirmet, selectedAuxiliaryInfo, categories, focussedCategoryRef,
      phenomena, parameters, obscuringPhenomena, copiedAirmetRef, displayModal } = this.state;
    const { drawProperties } = this.props;
    const header = <ContainerHeader isContainerOpen={isContainerOpen} dispatch={this.localDispatch} actions={LOCAL_ACTIONS} />;
    const startFeature = drawProperties.adagucMapDraw.geojson.features.find((feature) => feature.properties.featureFunction === 'start');
    const startIntersectionFeature = startFeature ? drawProperties.adagucMapDraw.geojson.features.find((feature) =>
      feature.properties.featureFunction === 'intersection' && feature.properties.relatesTo === startFeature.id) : null;
    const hasStartCoordinates = startFeature ? isFeatureGeoJsonComplete(startFeature) : false;
    const hasStartIntersectionCoordinates = startIntersectionFeature ? isFeatureGeoJsonComplete(startIntersectionFeature) : false;
    const airmetToExpand = selectedAirmet && Array.isArray(selectedAirmet) && selectedAirmet.length === 1 ? selectedAirmet[0] : null;

    return (
      <Col className='AirmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={isContainerOpen} isHorizontal minSize={64} maxSize={maxSize}>
          <Panel className='Panel' title={header}>
            <Col xs='auto' className='accordionsWrapper' style={{ minWidth: isContainerOpen ? maxSize - 32 : 'unset' }}>
              { categories.map((category) => {
                const isCreateCategory = category.ref === CATEGORY_REFS.ADD_AIRMET;
                return isContainerOpen
                  ? <AirmetsCategory key={category.ref}
                    typeRef={category.ref}
                    title={category.title}
                    icon={category.icon}
                    isOpen={focussedCategoryRef === category.ref && (category.airmets.length > 0 || isCreateCategory)}
                    abilities={category.abilities}
                    airmets={category.airmets}
                    geojson={drawProperties.adagucMapDraw.geojson}
                    selectedAirmet={airmetToExpand}
                    selectedAuxiliaryInfo={selectedAuxiliaryInfo}
                    dispatch={this.localDispatch}
                    actions={LOCAL_ACTIONS}
                    phenomena={phenomena}
                    parameters={parameters}
                    obscuringPhenomena={obscuringPhenomena}
                    copiedAirmetRef={copiedAirmetRef}
                    hasStartCoordinates={hasStartCoordinates}
                    hasStartIntersectionCoordinates={hasStartIntersectionCoordinates}
                    displayModal={displayModal}
                  />
                  : <MinifiedCategory key={category.ref}
                    icon={category.icon}
                    airmetCount={isCreateCategory ? 0 : category.airmets.length} />;
              })}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

AirmetsContainer.propTypes = {
  drawProperties: PropTypes.shape({
    adagucMapDraw: PropTypes.shape({
      geojson: PropTypes.shape({
        features: PropTypes.array.isRequired
      }).isRequired
    }).isRequired
  }).isRequired
};

export default AirmetsContainer;
