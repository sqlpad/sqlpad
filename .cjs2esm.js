module.exports = {
  input: ['server'],
  ignore: ['server/node_modules', 'server/public'],
  output: 'server-esm',
  forceDirectory: null,
  modules: [],
  extension: {
    use: 'js',
    ignore: [],
  },
  addModuleEntry: false,
  addPackageJson: true,
  filesWithShebang: [],
  codemod: {
    path: '',
    files: ['cjs', 'exports', 'named-export-generation'],
  },
};
