import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-js';
import strip from 'rollup-plugin-strip';
import image from 'rollup-plugin-image';
import alias from 'rollup-plugin-alias';

export default {
  entry: 'src/index.js',
  external: ['clappr','deepstream.io-client-js'],
  globals: {
    'clappr': 'Clappr',
    'deepstream.io-client-js':'deepstream' // this is the name of the global corresponding to the external module put abo 
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main:true,
      browser: true,
    }),
    // set debugger to `false` to NOT remove console.log() and other debug statements -- Uncomment for prod
    //strip({debugger: true, sourceMap: false}), 
    commonjs({
            include: 'node_modules/**',
            // if true then uses of `global` won't be dealt with by this plugin
            ignoreGlobal: false, // Default: false
            // if false then skip sourceMap generation for CommonJS modules
            sourceMap: false // Default: true
        }),
    babel(
      {exclude: 'node_modules/**'}
    ),
    image()
    //uglify({}, minify), // These will make the miniaturised version of plugin -- Uncomment for prod
  ],
  targets: [
    {dest: 'dist/EspxVideoAnnotator.min.js', format: 'iife', moduleName: 'EspxVideoAnnotator'},
  ],
};
