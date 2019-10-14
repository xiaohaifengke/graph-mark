const presets = [
  [
    '@babel/preset-env',
    {
      modules: false,
      targets: {
        edge: '17',
        firefox: '48',
        chrome: '58',
        safari: '11.1',
      },
      useBuiltIns: false,
    }
  ]
]
const plugins = [
  '@babel/plugin-proposal-class-properties',
  ['@babel/transform-runtime']
]

module.exports = {presets, plugins}