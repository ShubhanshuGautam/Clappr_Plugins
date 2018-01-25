import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-js';
import strip from 'rollup-plugin-strip';
import image from 'rollup-plugin-image';
import * as ds from 'deepstream.io-client-js'; 


export default {
  entry: 'src/index.js',
  external: ['clappr','deepstream.io-client-js'], // IMP: names of node_modules to be imported in .js class files
  globals: {
    'clappr': 'Clappr',
    'deepstream.io-client-js':'deepstream' // this is the name of the global corresponding to the external module put abo 
  },
/*  external: ['clappr'], 
  globals: {'clappr': 'Clappr'},*/
  plugins: [
    nodeResolve({
      jsnext: true,
      browser: true,
    }),
    // set debugger to `false` to NOT remove console.log() and other debug statements -- Uncomment for prod
    //strip({debugger: true, sourceMap: false}), 
    commonjs(),
    babel(
    //{exclude: 'node_modules/**'}
    ),
    image()
    //uglify({}, minify), // These will make the miniaturised version of plugin -- Uncomment for prod
  ],
  targets: [
    {dest: 'dist/EspxWhiteboard.min.js', format: 'iife', moduleName: 'EspxWhiteboard'},
  ],
};
