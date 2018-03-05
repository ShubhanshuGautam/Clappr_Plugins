## ESPxSocial Clappr Plugin

# Install
Run `npm install` to install all dependencies.

# Build
Run `npm run build` to build the plugin. <br>
It uses `rollup` as module bundler.

# Run
Run index.html to run the sample video.

# Sample Usage
      p = new Clappr.Player({
        source: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
        ds_server:'interns.espx.cloud:8000',
        prog_id:'Happy CNY !!',
        height: 440,
        width: 640,
        plugins: [EspxVideoAnnotator],
        parentId: '#player',
      }); 


 # Parameter option to share
 Pass `ds_server` to the player, from the html page, as an option. <br>
 For Example: `ds_server:'interns.espx.cloud:8000'`
 
 # Rollup Config (rollup.config.js)
   1. Comment out line: `strip({debugger: true, sourceMap: false})` to enable console.log and other debuggers to be available in compiled version of plugin.
   
   2. Comment out line: `uglify({}, minify)` to get the readable version of plugin.
