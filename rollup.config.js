import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-js';
import strip from 'rollup-plugin-strip';
import image from 'rollup-plugin-image';


export default {
  entry: 'src/index.js',
  external: ['clappr'],
  globals: {'clappr': 'Clappr'},
  plugins: [
    nodeResolve({
      jsnext: true,
      browser: true,
    }),
    // set debugger to `false` to NOT remove console.log() and other debug statements -- Uncomment for prod
    //strip({debugger: true, sourceMap: false}), 
    commonjs(),
    babel(),
    image()
    //uglify({}, minify), // These will make the miniaturised version of plugin -- Uncomment for prod
  ],
  targets: [
    {dest: 'dist/EspxSocial.min.js', format: 'umd', moduleName: 'EspxSocial'},
  ],
};
