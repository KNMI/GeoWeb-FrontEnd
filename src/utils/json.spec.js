import { safeMerge, clearNullPointersAndAncestors } from './json';

describe('(Utils) json', () => {
  it('.safeMerge should be a function', () => {
    expect(safeMerge).to.be.a('function');
  });
  it('.safeMerge should fail without template', () => {
    const incoming = {
      a: 0,
      b: 0
    };
    try {
      safeMerge(incoming, 'test');
      expect(true).to.eql(false);
    } catch (error) {
      expect(error.message).to.eql(`Argument 'templates' is missing a proper value`);
    };
  });
  it('.safeMerge should merge a \'flat\' array', () => {
    const incoming = [
      1,
      2,
      3
    ];
    const template = {
      test: [null]
    };
    let result = safeMerge(incoming, 'test', template);
    expect(template).to.eql({
      test: [null]
    });
    expect(result).to.eql([
      1,
      2,
      3
    ]);
  });
  it('.safeMerge should merge a \'flat\' object', () => {
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
    let result = safeMerge(incoming, 'test', template);
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
  it('.safeMerge should merge an array of \'flat\' objects', () => {
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
    let result = safeMerge(incoming, 'test', template);
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
  it('.safeMerge should merge a doubly nested array-objects', () => {
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
    let result = safeMerge(incoming, 'test', template);
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
  it('.safeMerge should merge directly nested array-objects', () => {
    const incoming = [
      [{ a: 1, c: 2 }, { b:3 }]
    ];
    const template = {
      test: [
        [{ a: null, b: null }]
      ]
    };
    let result = safeMerge(incoming, 'test', template);
    expect(template).to.eql({
      test: [
        [{ a: null, b: null }]
      ]
    });
    expect(result).to.eql([
      [{ a: 1, b: null }, { a: null, b: 3 }]
    ]);
  });
  it('.safeMerge should merge deep nested array-objects', () => {
    let incoming = [
      [[[{ a: 1, c: 2 }, { b: 3 }]]]
    ];
    let template = {
      test: [
        [[[{ a: null, b: null }]]]
      ]
    };
    let result = safeMerge(incoming, 'test', template);
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
    result = safeMerge(incoming, 'test', template);
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
    result = safeMerge(incoming, 'test', template);
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
  it('.safeMerge should clean deep nested array-objects', () => {
    let incoming = [
      [[[]]]
    ];
    let template = {
      test: [
        [[[{ a: 1 }, { b: null }]]]
      ]
    };
    let result = safeMerge(incoming, 'test', template);
    expect(template).to.eql({
      test: [
        [[[{ a: 1 }, { b: null }]]]
      ]
    });
    expect(result).to.eql([
      [[[]]]
    ]);
  });

  it('.clearNullPointersAndAncestors should be a function', () => {
    expect(clearNullPointersAndAncestors).to.be.a('function');
  });
  it('.clearNullPointersAndAncestors should clear an \'empty\' object', () => {
    const incoming = {
      a: null
    };
    clearNullPointersAndAncestors(incoming);
    expect(incoming).to.eql({});
  });
  it('.clearNullPointersAndAncestors should clear a \'shallow\' object', () => {
    const incoming = {
      a: { b: null },
      c: 'test'
    };
    clearNullPointersAndAncestors(incoming);
    expect(incoming).to.eql({
      c: 'test'
    });
  });
  it('.clearNullPointersAndAncestors should clear a flat array with a single null', () => {
    const incoming = {
      a: [ null ],
      b: 'test'
    };
    clearNullPointersAndAncestors(incoming);
    expect(incoming).to.eql({
      b: 'test'
    });
  });
  it('.clearNullPointersAndAncestors should clear a flat array with a null at index 0', () => {
    const incoming = {
      a: [null, 1],
      b: 'test'
    };
    clearNullPointersAndAncestors(incoming);
    expect(incoming).to.eql({
      a: [1],
      b: 'test'
    });
  });
  it('.clearNullPointersAndAncestors should clear a flat array with a null at index 1', () => {
    const incoming = {
      a: [1, null],
      b: 'test'
    };
    clearNullPointersAndAncestors(incoming);
    expect(incoming).to.eql({
      a: [1],
      b: 'test'
    });
  });
  it('.clearNullPointersAndAncestors should clear a flat array with a null at two indices', () => {
    const incoming1 = {
      a: [undefined, null],
      b: 'test'
    };
    clearNullPointersAndAncestors(incoming1);
    expect(incoming1).to.eql({
      b: 'test'
    });
    const incoming2 = {
      a: [null, null],
      b: 'test'
    };
    clearNullPointersAndAncestors(incoming2);
    expect(incoming2).to.eql({
      b: 'test'
    });
    const incoming3 = {
      a: [null],
      b: 'test'
    };
    incoming3.a[4] = null;
    clearNullPointersAndAncestors(incoming3);
    expect(incoming3).to.eql({
      b: 'test'
    });
  });
});
