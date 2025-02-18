const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const preset = require('..');
// Used to distinguish webpack from metro
const WEBPACK_CALLER = { name: 'babel-loader' };

describe.each([['metro'], ['webpack', WEBPACK_CALLER]])('%s', (_name, caller) => {
  it(`compiles sample files`, () => {
    let options = {
      babelrc: false,
      presets: [preset],
      sourceMaps: true,
      caller,
    };
    let samplesPath = path.resolve(__dirname, 'samples');
    let filenames = fs.readdirSync(samplesPath);

    for (let filename of filenames) {
      let { code, map, ast } = babel.transformFileSync(path.join(samplesPath, filename), options);

      expect(code).toBeDefined();
      expect(map).toBeDefined();
      expect(ast).toBeDefined();
    }
  });

  it(`uses the platform's react-native import`, () => {
    let options = {
      babelrc: false,
      presets: [preset],
      filename: 'unknown',
      // Make the snapshot easier to read
      retainLines: true,
      caller,
    };

    let sourceCode = `
import { View } from 'react-native';
`;
    let { code } = babel.transform(sourceCode, options);

    expect(code).toMatchSnapshot();
  });

  it(`aliases @expo/vector-icons`, () => {
    let options = {
      babelrc: false,
      presets: [preset],
      filename: 'unknown',
      // Make the snapshot easier to read
      retainLines: true,
      caller,
    };

    let sourceCode = `
import 'react-native-vector-icons';
require('react-native-vector-icons');
imposter.require('react-native-vector-icons');
imposter.import('react-native-vector-icons');
`;
    let { code } = babel.transform(sourceCode, options);

    expect(code).toMatch(/"@expo\/vector-icons"/);
    expect(code).toMatchSnapshot();
  });

  it(`composes with babel-plugin-module-resolver`, () => {
    let options = {
      babelrc: false,
      presets: [preset],
      plugins: [
        [
          'module-resolver',
          {
            alias: { rn: 'react-native' },
          },
        ],
      ],
      filename: 'unknown',
      // Make the snapshot easier to read
      retainLines: true,
      caller,
    };

    let sourceCode = `
import 'rn';
import 'react-native-vector-icons';
`;
    let { code } = babel.transform(sourceCode, options);

    expect(code).toMatch(/"react-native"/);
    expect(code).toMatch(/"@expo\/vector-icons"/);
    expect(code).toMatchSnapshot();
  });
});
