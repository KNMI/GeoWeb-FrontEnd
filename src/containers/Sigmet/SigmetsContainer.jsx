import React, { Component } from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';
import produce from 'immer';
import isEqual from 'lodash.isequal';

import Panel from '../../components/Panel';
import CollapseOmni from '../../components/CollapseOmni';
import { CATEGORY_REFS, INITIAL_STATE, LOCAL_ACTIONS } from './SigmetActions';
import dispatch from './SigmetReducers';

import ContainerHeader from '../../components/Sigmet/ContainerHeader';
import SigmetsCategory from '../../components/Sigmet/SigmetsCategory';
import MinifiedCategory from '../../components/Sigmet/MinifiedCategory';
import { isFeatureGeoJsonComplete } from '../../utils/json';

const ERROR_MSG = {
  FEATURE_ID_MISMATCH: 'GeoJson: the %s feature has a mutated id'
};

class SigmetsContainer extends Component {
  constructor (props) {
    super(props);
    this.localDispatch = this.localDispatch.bind(this);
    this.findFeatureByFunction = this.findFeatureByFunction.bind(this);
    this.state = produce(INITIAL_STATE, draftState => {});
  }

  localDispatch (localAction) {
    dispatch(localAction, this);
  };

  findFeatureByFunction (functionName, containerProperties = this.props) {
    if (containerProperties.drawProperties.adagucMapDraw.geojson.features) {
      return containerProperties.drawProperties.adagucMapDraw.geojson.features.find((feature) => feature.properties.featureFunction === functionName);
    }
    return null;
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.drawProperties.adagucMapDraw.geojson.features && this.props.drawProperties.adagucMapDraw.geojson.features) {
      const currentStartFeature = this.findFeatureByFunction('start');
      const currentEndFeature = this.findFeatureByFunction('end');
      const nextStartFeature = this.findFeatureByFunction('start', nextProps);
      const nextEndFeature = this.findFeatureByFunction('end', nextProps);
      if (!currentStartFeature || !nextStartFeature) {
        return;
      }
      if (currentStartFeature.id !== nextStartFeature.id) {
        console.warn(ERROR_MSG.FEATURE_ID_MISMATCH, 'start');
        return;
      }
      if (!currentEndFeature || !nextEndFeature) {
        return;
      }
      if (currentEndFeature.id !== nextEndFeature.id) {
        console.warn(ERROR_MSG.FEATURE_ID_MISMATCH, 'end');
        return;
      }
      if (!isEqual(currentStartFeature, nextStartFeature)) {
        this.localDispatch(LOCAL_ACTIONS.createFirIntersectionAction(nextStartFeature.id, nextProps.drawProperties.adagucMapDraw.geojson));
      }
      if (!isEqual(currentEndFeature, nextEndFeature)) {
        this.localDispatch(LOCAL_ACTIONS.createFirIntersectionAction(nextEndFeature.id, nextProps.drawProperties.adagucMapDraw.geojson));
      }
    }
  }

  componentDidMount () {
    this.localDispatch(LOCAL_ACTIONS.retrieveParametersAction());
    this.localDispatch(LOCAL_ACTIONS.retrievePhenomenaAction());
    this.localDispatch(LOCAL_ACTIONS.retrieveSigmetsAction());
  }

  render () {
    const maxSize = 580;
    const { isContainerOpen, selectedSigmet, selectedAuxiliaryInfo, categories, focussedCategoryRef,
      phenomena, parameters, copiedSigmetRef, displayModal } = this.state;
    const { drawProperties } = this.props;
    const header = <ContainerHeader isContainerOpen={isContainerOpen} dispatch={this.localDispatch} actions={LOCAL_ACTIONS} />;
    const startFeature = drawProperties.adagucMapDraw.geojson.features.find((feature) => feature.properties.featureFunction === 'start');
    const startIntersectionFeature = startFeature ? drawProperties.adagucMapDraw.geojson.features.find((feature) =>
      feature.properties.featureFunction === 'intersection' && feature.properties.relatesTo === startFeature.id) : null;
    const endFeature = drawProperties.adagucMapDraw.geojson.features.find((feature) => feature.properties.featureFunction === 'end');
    const endIntersectionFeature = endFeature ? drawProperties.adagucMapDraw.geojson.features.find((feature) =>
      feature.properties.featureFunction === 'intersection' && feature.properties.relatesTo === endFeature.id) : null;
    const hasStartCoordinates = startFeature ? isFeatureGeoJsonComplete(startFeature) : false;
    const hasStartIntersectionCoordinates = startIntersectionFeature ? isFeatureGeoJsonComplete(startIntersectionFeature) : false;
    const hasEndCoordinates = endFeature ? isFeatureGeoJsonComplete(endFeature) : false;
    const hasEndIntersectionCoordinates = endIntersectionFeature ? isFeatureGeoJsonComplete(endIntersectionFeature) : false;
    const sigmetToExpand = selectedSigmet && Array.isArray(selectedSigmet) && selectedSigmet.length === 1 ? selectedSigmet[0] : null;

    return (
      <Col className='SigmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={isContainerOpen} isHorizontal minSize={64} maxSize={maxSize}>
          <Panel className='Panel' title={header}>
            <Col xs='auto' className='accordionsWrapper' style={{ minWidth: isContainerOpen ? maxSize - 32 : 'unset' }}>
              { categories.map((category) => {
                const isCreateCategory = category.ref === CATEGORY_REFS.ADD_SIGMET;
                return isContainerOpen
                  ? <SigmetsCategory key={category.ref}
                    typeRef={category.ref}
                    title={category.title}
                    icon={category.icon}
                    isOpen={focussedCategoryRef === category.ref && (category.sigmets.length > 0 || isCreateCategory)}
                    abilities={category.abilities}
                    sigmets={category.sigmets}
                    geojson={drawProperties.adagucMapDraw.geojson}
                    selectedSigmet={sigmetToExpand}
                    selectedAuxiliaryInfo={selectedAuxiliaryInfo}
                    dispatch={this.localDispatch}
                    actions={LOCAL_ACTIONS}
                    phenomena={phenomena}
                    parameters={parameters}
                    copiedSigmetRef={copiedSigmetRef}
                    hasStartCoordinates={hasStartCoordinates}
                    hasStartIntersectionCoordinates={hasStartIntersectionCoordinates}
                    hasEndCoordinates={hasEndCoordinates}
                    displayModal={displayModal}
                    hasEndIntersectionCoordinates={hasEndIntersectionCoordinates}
                  />
                  : <MinifiedCategory key={category.ref}
                    icon={category.icon}
                    sigmetCount={isCreateCategory ? 0 : category.sigmets.length} />;
              })}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

SigmetsContainer.propTypes = {
  drawProperties: PropTypes.shape({
    adagucMapDraw: PropTypes.shape({
      geojson: PropTypes.shape({
        features: PropTypes.array.isRequired
      }).isRequired
    }).isRequired
  }).isRequired
};

export default SigmetsContainer;
