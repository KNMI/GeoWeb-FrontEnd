import React, { PureComponent } from 'react';
import ConcreteCell from './ConcreteCell';
import EditableCell from './EditableCell';
import LayerModifier from './LayerModifier';
import DragHandle from './DragHandle';
import { Col, Row, Popover, PopoverTitle, PopoverContent } from 'reactstrap';
import { SortableElement } from 'react-sortable-hoc';
import Slider from 'rc-slider';
require('rc-slider/assets/index.css');
import { Icon } from 'react-fa';

export default class Layer extends PureComponent {
  constructor () {
    super();
    this.renderLayerChanger = this.renderLayerChanger.bind(this);
    this.alterLayer = this.alterLayer.bind(this);
    this.alterStyle = this.alterStyle.bind(this);
    this.alterOpacity = this.alterOpacity.bind(this);
    this.state = {
      layerChangerOpen: false,
      styleChangerOpen: false,
      opacityChangerOpen: false,
      serviceLayers: [],
      serviceStyles: [],
      target: ''
    };
  }

  alterLayer (newValue) {
    const { dispatch, panelsActions, index, activePanelId } = this.props;
    const { name, text } = newValue;
    const newLayer = { ...this.props.layer, name, title: text };
    new WMJSLayer(newLayer).parseLayer((l) => {
      dispatch(panelsActions.replaceLayer({ mapId: activePanelId, index: index, layer: l }));
    });
  }

  alterStyle (newValue) {
    const { dispatch, panelsActions, index, activePanelId } = this.props;
    const newLayer = { ...this.props.layer };
    newLayer.setStyle(newValue);
    dispatch(panelsActions.replaceLayer({ mapId: activePanelId, index: index, layer: newLayer }));
  }

  alterOpacity (newValue) {
    const { dispatch, panelsActions, index, activePanelId } = this.props;
    const newLayer = { ...this.props.layer };
    newLayer.setOpacity(newValue);
    dispatch(panelsActions.replaceLayer({ mapId: activePanelId, index: index, layer: newLayer }));
  }

  renderLayerChanger () {
    const { layerChangerOpen, serviceLayers, target } = this.state;
    return (
      <Popover placement={'top'} width={'auto'} target={target} isOpen={layerChangerOpen}
        toggle={() => this.setState({
          layerChangerOpen: !layerChangerOpen,
          serviceLayers: [],
          target: ''
        })}>
        <PopoverTitle>Select layer</PopoverTitle>
        <PopoverContent>
          {serviceLayers.map((layer, q) =>
            <li onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              this.alterLayer(serviceLayers[q]);
            }} key={q}>{layer.text}</li>)}
        </PopoverContent>
      </Popover>
    );
  }

  renderOpacityChanger () {
    const marks = {
      0: '0%',
      10: '10%',
      20: '20%',
      30: '30%',
      40: '40%',
      50: '50%',
      60: '60%',
      70: '70%',
      80: '80%',
      90: '90%',
      100: '100%'
    };
    const { layer } = this.props;
    const { opacityChangerOpen, target } = this.state;
    return (
      <Popover width={'auto'} isOpen={opacityChangerOpen} target={target} toggle={() => this.setState({
        opacityChangerOpen: !opacityChangerOpen,
        target: ''
      })}>
        <PopoverTitle>Opacity</PopoverTitle>
        <PopoverContent style={{ height: '15rem', marginBottom: '1rem' }}>
          <Slider style={{ margin: '1rem' }} vertical min={0} max={100}
            marks={marks} step={1} onChange={(v) => this.alterOpacity(v / 100)}
            defaultValue={parseInt(layer.opacity * 100)} />
        </PopoverContent>
      </Popover>
    );
  }

  renderStyleChanger () {
    const { styleChangerOpen, serviceStyles, target } = this.state;
    return (
      <Popover placement={'top'} width={'auto'} target={target} isOpen={styleChangerOpen}
        toggle={() => this.setState({
          styleChangerOpen: !styleChangerOpen,
          serviceStyles: [],
          target: ''
        })}>
        <PopoverTitle>Select style</PopoverTitle>
        <PopoverContent>
          {serviceStyles.map((style, q) =>
            <li onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              this.alterStyle(serviceStyles[q]);
            }} key={q}>{style}</li>)}
        </PopoverContent>
      </Popover>
    );
  }

  render () {
    const { layer, color, index } = this.props;
    const styles = layer && layer.styles ? layer.styles.map((styleObj) => styleObj.name) : [];
    switch (this.props.role) {
      case 'datalayers':
        let refTime = null;
        if (typeof layer.getDimension === 'function') {
          refTime = layer.getDimension('reference_time');
        }
        const id = 'datalayer' + index;
        return (<Col>
          {this.renderLayerChanger()}
          {this.renderStyleChanger()}
          {this.renderOpacityChanger()}
          <ConcreteCell active={layer.active} color={color}>{layer.WMJSService.title}</ConcreteCell>
          <EditableCell id={'layer'+id} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            layer.WMJSService.getLayerObjectsFlat((layers) => {
              this.setState({ layerChangerOpen: true, target: 'layer'+id, serviceLayers: layers });
            });
          }} active={layer.active} color={color}>{layer.title}</EditableCell>
          <EditableCell id={'style'+id} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({ styleChangerOpen: true, target: 'style'+id, serviceStyles: styles });
          }} active={layer.active} color={color}>{layer.currentStyle}</EditableCell>
          <EditableCell id={'opacity'+id} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({ opacityChangerOpen: true, target: 'opacity'+id });
          }} active={layer.active} color={color}>{parseInt(layer.opacity * 100) + '%'}</EditableCell>
          <ConcreteCell active={layer.active} color={color}>{refTime ? refTime.currentValue : null}</ConcreteCell></Col>);
      case 'overlays':
        return <Col><ConcreteCell color={color}>{layer.title}</ConcreteCell></Col>;
      case 'maplayers':
        return <Col><EditableCell color={color}>{layer.title}</EditableCell></Col>;
    }
  }
}

export class UnsortableLayer extends PureComponent {
  render () {
    const { role, color, layer, layerIndex, dispatch, panelsActions, activePanelId, onLayerClick } = this.props;
    const backgroundColor = role === 'datalayers' && layer.active ? 'rgba(217, 237, 247, 0.6)' : null;
    return (
      <Row onClick={() => onLayerClick ? onLayerClick(layerIndex) : null} className='Layer' style={{ backgroundColor: backgroundColor }}>
        <Layer dispatch={dispatch} panelsActions={panelsActions} activePanelId={activePanelId}
          role={role} color={color} layer={layer} index={layerIndex} />
        <Col xs='auto' style={{ margin: '0 0.33rem' }}>
          <Icon disabled className={'modifier disabled'} name='bars' />
        </Col>
        {role !== 'maplayers'
          ? <LayerModifier activePanelId={activePanelId} dispatch={dispatch} role={role} panelsActions={panelsActions} layer={layer} index={layerIndex} />
          : <Col xs='auto' style={{ marginRight: '2.125rem' }} />}
      </Row>);
  }
}

export const SortableLayer = SortableElement(({ role, color, layer, layerIndex, dispatch, panelsActions, activePanelId, onLayerClick }) => {
  const backgroundColor = role === 'datalayers' && layer.active ? 'rgba(217, 237, 247, 0.6)' : null;
  return (
    <Row onClick={() => onLayerClick ? onLayerClick(layerIndex) : null} className='Layer' style={{ backgroundColor: backgroundColor }}>
      <Layer dispatch={dispatch} panelsActions={panelsActions} activePanelId={activePanelId}
        role={role} color={color} layer={layer} index={layerIndex} />
      <DragHandle />
      { role !== 'maplayers'
        ? <LayerModifier activePanelId={activePanelId} dispatch={dispatch} role={role} panelsActions={panelsActions} layer={layer} index={layerIndex} />
        : <Col xs='auto' style={{ marginRight: '2.125rem' }} />}
    </Row>);
});
