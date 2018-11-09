import React from 'react';
import TafTable from './TafTable';
import { mount } from 'enzyme';
import { TestTafJSON } from './TestTafJSON.js';
import { TAF_TEMPLATES } from './TafTemplates';

const taf = TAF_TEMPLATES.TAF;

describe('(Container) Taf/TafTable.jsx', () => {
  it('Renders a TafTable', () => {
    const _component = mount(<TafTable taf={taf} />);
    expect(_component.type()).to.eql(TafTable);
  });

  it('Renders a TafTable with SortableChangeGroups', () => {
    const _component = mount(<TafTable
      validationReport={{}}
      taf={TestTafJSON}
      onSortEnd={() => {}}
      onChange={() => {}}
      onKeyUp={() => {}}
      onAddRow={() => {}}
      onDeleteRow={() => {}}
      editable
      onFocusOut={() => {}} />
    );
    expect(_component.type()).to.eql(TafTable);
  });
  it('Renders a TafTable with a validationReport containing invalid base forecast', () => {
    const _component = mount(<TafTable
      taf={taf}
      validationReport={{ succeeded: false, message: 'Contains errors', errors: { '/forecast/wind': 'Wrong wind' } }} />);
    expect(_component.type()).to.eql(TafTable);
  });
  it('Renders a TafTable with a validationReport containing invalid changegroup forecast', () => {
    const _component = mount(<TafTable
      taf={taf}
      validationReport={{ succeeded: false, message: 'Contains errors', errors: { '/changegroups/0/forecast/visibility': 'Wrong visibility' } }} />);
    expect(_component.type()).to.eql(TafTable);
  });
  it('Performs method updateValue for base forecast wind', () => {
    let values;
    const _component = mount(<TafTable
      taf={taf}
      setTafValues={(propsToUpdate) => { values = propsToUpdate; }} />);
    const inputMock = {
      name: 'forecast-wind',
      value: '12345'
    };
    const _instance = _component.instance();
    _instance.updateValue(inputMock);
    expect(values).to.eql([ { propertyPath: [ 'forecast', 'wind' ],
      propertyValue: { direction: 123, speed: 45, gusts: null, unit: 'KT', speedOperator: null, gustsOperator: null } } ]);
  });
  it('Performs method updateValue for changegroup forecast clouds', () => {
    let values;
    const _component = mount(<TafTable
      taf={taf}
      setTafValues={(propsToUpdate) => { values = propsToUpdate; }} />);
    const inputMock = {
      name: 'changegroups-1-forecast-clouds-2',
      value: 'BKN030'
    };
    const _instance = _component.instance();
    _instance.updateValue(inputMock);
    expect(values).to.eql([
      { propertyPath: [ 'changegroups', '1', 'forecast', 'clouds', '2' ],
        propertyValue: { amount: 'BKN', height: 30, mod: null } } ]);
  });
  it('Performs method updateValue for changegroup forecast visibility', () => {
    let values;
    const _component = mount(<TafTable
      taf={taf}
      setTafValues={(propsToUpdate) => { values = propsToUpdate; }} />);
    const inputMock = {
      name: 'changegroups-2-forecast-visibility',
      value: 'CAVOK'
    };
    const _instance = _component.instance();
    _instance.updateValue(inputMock);
    expect(values).to.eql([
      { propertyPath: [ 'changegroups', '2', 'forecast', 'caVOK' ],
        propertyValue: true },
      { propertyPath: [ 'changegroups', '2', 'forecast', 'visibility' ],
        propertyValue: { unit: null, value: null } } ]);
  });
  it('Performs method updateValue for changegroup validity - one timestamp provided', () => {
    let values;
    const _component = mount(<TafTable
      taf={TestTafJSON}
      setTafValues={(propsToUpdate) => { values = propsToUpdate; }} />);
    const inputMock = {
      name: 'changegroups-3-validity',
      value: '041020'
    };
    const _instance = _component.instance();
    _instance.updateValue(inputMock);
    expect(values).to.eql([
      { propertyPath: [ 'changegroups', '3', 'changeStart' ],
        propertyValue: '2017-08-04T10:20:00Z' },
      { propertyPath: [ 'changegroups', '3', 'changeEnd' ],
        propertyValue: null } ]);
  });
  it('Performs method updateValue for changegroup validity - two timestamps provided', () => {
    let values;
    const _component = mount(<TafTable
      taf={TestTafJSON}
      setTafValues={(propsToUpdate) => { values = propsToUpdate; }} />);
    const inputMock = {
      name: 'changegroups-3-validity',
      value: '0410/0413'
    };
    const _instance = _component.instance();
    _instance.updateValue(inputMock);
    expect(values).to.eql([
      { propertyPath: [ 'changegroups', '3', 'changeStart' ],
        propertyValue: '2017-08-04T10:00:00Z' },
      { propertyPath: [ 'changegroups', '3', 'changeEnd' ],
        propertyValue: '2017-08-04T13:00:00Z' } ]);
  });
  it('Performs method updateValue for changegroup validity - halfway', () => {
    let values;
    const _component = mount(<TafTable
      taf={TestTafJSON}
      setTafValues={(propsToUpdate) => { values = propsToUpdate; }} />);
    const inputMock = {
      name: 'changegroups-3-validity',
      value: '0410/04'
    };
    const _instance = _component.instance();
    _instance.updateValue(inputMock);
    expect(values).to.deep.include(
      { propertyPath: [ 'changegroups', '3', 'changeEnd' ],
        propertyValue: null }
    );
    expect(values).to.have.nested.property(
      '[0].propertyValue.fallback.value', '0410/04'
    );
    expect(values).to.have.deep.nested.property(
      '[0].propertyPath', [ 'changegroups', '3', 'changeStart' ]
    );
  });
});
