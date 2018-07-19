import { mergeInTemplate } from './json';

describe('(Utils) json', () => {
  it('should be a function', () => {
    expect(mergeInTemplate).to.be.a('function');
  });
  it('should fail without template', () => {
    const incoming = {
      a: 0,
      b: 0
    };
    let result = mergeInTemplate(incoming, 'test');
    expect(result).to.eql(null);
    result = mergeInTemplate(incoming, 'test', { another: 'value' });
    expect(result).to.eql(null);
  });
  it('should merge a \'flat\' array', () => {
    const incoming = [
      1,
      2,
      3
    ];
    const template = {
      test: [null]
    };
    let result = mergeInTemplate(incoming, 'test', template);
    expect(template).to.eql({
      test: [null]
    });
    expect(result).to.eql([
      1,
      2,
      3
    ]);
  });
  it('should merge a \'flat\' object', () => {
    const incoming = {
      a: 1,
      b: 2,
      c: 3
    };
    const template = {
      test: {
        a: null,
        b: null
      }
    };
    let result = mergeInTemplate(incoming, 'test', template);
    expect(template).to.eql({
      test: {
        a: null,
        b: null
      }
    });
    expect(result).to.eql({
      a: 1,
      b: 2
    });
  });
  it('should merge an array of \'flat\' objects', () => {
    const incoming = [
      { a: 1 },
      { a: 2, b: 3 },
      { a: 4, b: 5, c: 6 }
    ];
    const template = {
      test: [
        { a: null }
      ]
    };
    let result = mergeInTemplate(incoming, 'test', template);
    expect(template).to.eql({
      test: [
        { a: null }
      ]
    });
    expect(result).to.eql([
      { a: 1 },
      { a: 2 },
      { a: 4 }
    ]);
  });
  it('should merge a doubly nested array-objects', () => {
    const incoming = [
      { a: 1 },
      {
        a: [
          { b: 2 }
        ],
        c: 3
      },
      { a: [
        { b: 4, d: 5 }
      ] },
      {
        a: [
          { b: { c: 6 } }
        ]
      },
      {
        a: [
          { b: { c: 'value7' } }
        ]
      }
    ];
    const template = {
      test: [
        { a: [
          { b: {
            c: null
          } }
        ] }
      ]
    };
    let result = mergeInTemplate(incoming, 'test', template);
    expect(template).to.eql({
      test: [
        { a: [
          { b: {
            c: null
          } }
        ] }
      ]
    });
    expect(result).to.eql([
      { a: [
        { b: { c: null } }
      ] },
      { a: [
        { b: { c: null } }
      ] },
      { a: [
        { b: { c: null } }
      ] },
      { a: [
        { b: { c: 6 } }
      ] },
      { a: [
        { b: { c: 'value7' } }
      ] }
    ]);
  });
  it('should merge directly nested array-objects', () => {
    const incoming = [
      [{ a: 1, c: 2 }, { b:3 }]
    ];
    const template = {
      test: [
        [{ a: null, b: null }]
      ]
    };
    let result = mergeInTemplate(incoming, 'test', template);
    expect(template).to.eql({
      test: [
        [{ a: null, b: null }]
      ]
    });
    expect(result).to.eql([
      [{ a: 1, b: null }, { a: null, b: 3 }]
    ]);
  });
  it('should merge deep nested array-objects', () => {
    let incoming = [
      [[[{ a: 1, c: 2 }, { b: 3 }]]]
    ];
    let template = {
      test: [
        [[[{ a: null, b: null }]]]
      ]
    };
    let result = mergeInTemplate(incoming, 'test', template);
    expect(template).to.eql({
      test: [
        [[[{ a: null, b: null }]]]
      ]
    });
    expect(result).to.eql([
      [[[{ a: 1, b: null }, { a: null, b: 3 }]]]
    ]);

    incoming = {
      d: [[[{ a: 1, c: 2 }, { b: 3 }]]]
    };
    template = {
      d: [[[{ a: null, b: null }]]]
    };
    template.test = {
      d: template.d
    };
    result = mergeInTemplate(incoming, 'test', template);
    expect(template).to.eql({
      d: [[[{ a: null, b: null }]]],
      test: {
        d: [[[{ a: null, b: null }]]]
      }
    });
    expect(result).to.eql({
      d: [[[{ a: 1, b: null }, { a: null, b: 3 }]]]
    });

    incoming = [{
      d: [[[{ a: 1, c: 2 }, { b: 3 }]]]
    }];
    template = {
      d: [[[{ a: null, b: null }]]]
    };
    template.test = [{
      d: template.d
    }];
    result = mergeInTemplate(incoming, 'test', template);
    expect(template).to.eql({
      d: [[[{ a: null, b: null }]]],
      test: [{
        d: [[[{ a: null, b: null }]]]
      }]
    });
    expect(result).to.eql([{
      d: [[[{ a: 1, b: null }, { a: null, b: 3 }]]]
    }]);
  });
});
