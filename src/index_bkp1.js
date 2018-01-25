import {UICorePlugin, Events, template, Styler} from 'clappr'
import * as deepstream from 'deepstream.io-client-js'

//import wbStyle from './public/wbStyle.scss'

export default class EspxWhiteboard extends UICorePlugin {
	  constructor(core) {
	    super(core);
	    // this.core is created in a super class. Hence created after this constructor finishes
	    this.progId = core._options.prog_id;
	    //console.log(this);
	    this.isBanner = false;
	    this.drawing = false;
	    this.drawn = false; 
	    this.points = [];
	    this.ESP = this;
	    this.brushType = 	{	brush1:'brush1',
	    						brush2:'brush2',
	    						erase1:'eraser'}
	    //this.deepstream = require('deepstream.io-client-js');
	  }


	  bindEvents() {
	  	//console.log("BindEvents");
	    this.listenToOnce(this.core.mediaControl, Events.MEDIACONTROL_RENDERED, this.initialize);
	    this.listenTo(this.core.mediaControl, Events.MEDIACONTROL_HIDE, this.onHide)
	    this.listenTo(this.core.mediaControl, Events.MEDIACONTROL_SHOW , this.onShow)
	  }

	  initialize(){
	  	this.render();

	  	//console.log(this.core.getCurrentPlayback().options.shareURL)
	  }

	  test1(){
	  	//console.log(this.recordPts);
	  }

	  get name() { return 'level_selector' }
	  get template() { return template(this.myBannerTemplate) }
	 
	  onShow() {
	  	if(this.isBanner) return;
	  	this.$el.show();
	  }

	  onHide() {
	  	if(this.isBanner) return;
	  	this.$el.hide()
	  }

	  onPlay() { alert('Play') }

	  onPause() { alert('Pause') }

	get myBtnTemplate (){ 
	  	return (`
	        <!-- SHARE BUTTON -->
	  		<img id="shareBtn" data-open-wb style="height: 20px;width: 20px;top: 15px;right: 15px;position: absolute;z-index: 1000;background: rgba(6, 16, 25, 0.57);border-radius: 10px;"
	        	src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjMycHgiIGhlaWdodD0iMzJweCIgdmlld0JveD0iMCAwIDUxMS42MjYgNTExLjYyNyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTExLjYyNiA1MTEuNjI3OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTUwNi4yMDYsMTc5LjAxMkwzNjAuMDI1LDMyLjgzNGMtMy42MTctMy42MTctNy44OTgtNS40MjYtMTIuODQ3LTUuNDI2cy05LjIzMywxLjgwOS0xMi44NDcsNS40MjYgICBjLTMuNjE3LDMuNjE5LTUuNDI4LDcuOTAyLTUuNDI4LDEyLjg1djczLjA4OWgtNjMuOTUzYy0xMzUuNzE2LDAtMjE4Ljk4NCwzOC4zNTQtMjQ5LjgyMywxMTUuMDZDNS4wNDIsMjU5LjMzNSwwLDI5MS4wMywwLDMyOC45MDcgICBjMCwzMS41OTQsMTIuMDg3LDc0LjUxNCwzNi4yNTksMTI4Ljc2MmMwLjU3LDEuMzM1LDEuNTY2LDMuNjE0LDIuOTk2LDYuODQ5YzEuNDI5LDMuMjMzLDIuNzEyLDYuMDg4LDMuODU0LDguNTY1ICAgYzEuMTQ2LDIuNDcxLDIuMzg0LDQuNTY1LDMuNzE1LDYuMjc2YzIuMjgyLDMuMjM3LDQuOTQ4LDQuODU5LDcuOTk0LDQuODU5YzIuODU1LDAsNS4wOTItMC45NTEsNi43MTEtMi44NTQgICBjMS42MTUtMS45MDIsMi40MjQtNC4yODQsMi40MjQtNy4xMzJjMC0xLjcxOC0wLjIzOC00LjIzNi0wLjcxNS03LjU2OWMtMC40NzYtMy4zMzMtMC43MTUtNS41NjQtMC43MTUtNi43MDggICBjLTAuOTUzLTEyLjkzOC0xLjQyOS0yNC42NTMtMS40MjktMzUuMTE0YzAtMTkuMjIzLDEuNjY4LTM2LjQ0OSw0Ljk5Ni01MS42NzVjMy4zMzMtMTUuMjI5LDcuOTQ4LTI4LjQwNywxMy44NS0zOS41NDMgICBjNS45MDEtMTEuMTQsMTMuNTEyLTIwLjc0NSwyMi44NDEtMjguODM1YzkuMzI1LTguMDksMTkuMzY0LTE0LjcwMiwzMC4xMTgtMTkuODQyYzEwLjc1Ni01LjE0MSwyMy40MTMtOS4xODYsMzcuOTc0LTEyLjEzNSAgIGMxNC41Ni0yLjk1LDI5LjIxNS00Ljk5Nyw0My45NjgtNi4xNHMzMS40NTUtMS43MTEsNTAuMTA5LTEuNzExaDYzLjk1M3Y3My4wOTFjMCw0Ljk0OCwxLjgwNyw5LjIzMiw1LjQyMSwxMi44NDcgICBjMy42MiwzLjYxMyw3LjkwMSw1LjQyNCwxMi44NDcsNS40MjRjNC45NDgsMCw5LjIzMi0xLjgxMSwxMi44NTQtNS40MjRsMTQ2LjE3OC0xNDYuMTgzYzMuNjE3LTMuNjE3LDUuNDI0LTcuODk4LDUuNDI0LTEyLjg0NyAgIEM1MTEuNjI2LDE4Ni45Miw1MDkuODIsMTgyLjYzNiw1MDYuMjA2LDE3OS4wMTJ6IiBmaWxsPSIjRkZGRkZGIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />
	    `)
	}
 

	get myBannerTemplate (){ 
	  	return (`
	  			<!-- CROSS -->
	  			<div data-close-wb style="position: absolute;right: 15px;top: 15px;z-index:1">
	  				<img style="height: 20px; width: 20px; background: rgba(6, 16, 25, 0.6);border-radius: 10px;"
	  					src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDIxLjkgMjEuOSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjEuOSAyMS45IiB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4Ij4KICA8cGF0aCBkPSJNMTQuMSwxMS4zYy0wLjItMC4yLTAuMi0wLjUsMC0wLjdsNy41LTcuNWMwLjItMC4yLDAuMy0wLjUsMC4zLTAuN3MtMC4xLTAuNS0wLjMtMC43bC0xLjQtMS40QzIwLDAuMSwxOS43LDAsMTkuNSwwICBjLTAuMywwLTAuNSwwLjEtMC43LDAuM2wtNy41LDcuNWMtMC4yLDAuMi0wLjUsMC4yLTAuNywwTDMuMSwwLjNDMi45LDAuMSwyLjYsMCwyLjQsMFMxLjksMC4xLDEuNywwLjNMMC4zLDEuN0MwLjEsMS45LDAsMi4yLDAsMi40ICBzMC4xLDAuNSwwLjMsMC43bDcuNSw3LjVjMC4yLDAuMiwwLjIsMC41LDAsMC43bC03LjUsNy41QzAuMSwxOSwwLDE5LjMsMCwxOS41czAuMSwwLjUsMC4zLDAuN2wxLjQsMS40YzAuMiwwLjIsMC41LDAuMywwLjcsMC4zICBzMC41LTAuMSwwLjctMC4zbDcuNS03LjVjMC4yLTAuMiwwLjUtMC4yLDAuNywwbDcuNSw3LjVjMC4yLDAuMiwwLjUsMC4zLDAuNywwLjNzMC41LTAuMSwwLjctMC4zbDEuNC0xLjRjMC4yLTAuMiwwLjMtMC41LDAuMy0wLjcgIHMtMC4xLTAuNS0wLjMtMC43TDE0LjEsMTEuM3oiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+Cg==" />
	  			</div>
	  			<canvas class="whiteboard" style="border: 1px solid #ccc; height: 100%; width: 100%; position: absolute; left: 0; right: 0; bottom: 0; top: 0; background-color: rgba(256, 256, 256, 1)"></canvas>
				  <code style="position: relative;"><%= prog_id %></code>
				  <div style="top:10px; position:relative;">
				  	<div class="btn-group" >
  						<button type="button" class="brush brush1 btn btn-primary">brush1</button>
  						<button type="button" class="brush brush2 btn btn-primary">brush2</button>
  						<button type="button" class="brush eraser btn btn-primary">eraser</button>
					</div>

				    <div class="color black" style="display: inline-block;height: 30px;width: 30px; background-color: black;"></div>
				    <div class="color red" style="display: inline-block;height: 30px;width: 30px; background-color: red;"></div>
				    <div class="color green" style="display: inline-block;height: 30px;width: 30px; background-color: green;"></div>
				    <div class="color blue" style="display: inline-block;height: 30px;width: 30px; background-color: blue;"></div>
				    <div class="color yellow" style="display: inline-block;height: 30px;width: 30px; background-color: yellow;"></div>

				    <div class="btn-group">
  						<button data-clear-wb type="button" class="btn btn-danger">clear</button>
					</div>
				  </div>
	    `)
	}




	  render(){
	  	// inserting deepstream.js
	  	//this.core.$el.append('<script src="https://cdnjs.cloudflare.com/ajax/libs/deepstream.io-client-js/2.3.0/deepstream.js"></script>');
/*	  	if (!this.style) {
      		this.style = Styler.getStyleFor(wbStyle, { baseUrl: this.core.options.baseUrl })
    	}*/
	  	// This is the social share button UI Object that has to be put onto player
	  	this.$el.html(this.myBtnTemplate);
	  	// this.$el.append(this.style);
	  	// append html of this plugin component to core's body
	    this.core.$el.append(this.el);



	    return this;
	  }

	get events(){
		return{
			'click [data-open-wb]': 'openWB',
			'click [data-close-wb]': 'closeWB',
			'click [data-clear-wb]': 'clearCanvas',
		}
	}


	

	//------------ CANVAS -----------
	setupCanvas(){
		//console.log("SETUP");
	
		this.canvas 	= document.getElementsByClassName('whiteboard')[0];
  		this.colors 	= document.getElementsByClassName('color');
  		this.brushes 	= document.getElementsByClassName('brush');
  		this.context 	= this.canvas.getContext('2d'); 
  		this.current 	= { color: 'black' };

  		this.current.brush	= this.brushType.brush1; //default is brush1
  		this.drawing 	= false;
		//console.log(this);
  		//console.log(this.canvas);

  		  this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
		  this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false);
		  this.canvas.addEventListener('mouseout', this.onMouseUp.bind(this), false);
		  this.canvas.addEventListener('mousemove', this.throttle(this.onMouseMove.bind(this), 10), false);

		for (var i = 0; i < this.colors.length; i++){
    		this.colors[i].addEventListener('click', this.onColorUpdate.bind(this), false);
  		}
  		for (var i = 0; i < this.brushes.length; i++){
    		this.brushes[i].addEventListener('click', this.onBrushTypeSelect.bind(this), false);
  		}
  	
  		window.addEventListener('resize', this.onResize.bind(this), false);
  		this.setupDeepstream();
  		this.initDrawing(this.recordPts.get( 'allpts'));
  		this.onResize();
  		//this.redrawCanvas();
  		
	} // end setupCanvas

	  // make the canvas fill its parent
	  onResize() {
	  	//console.log(this.core.$el[0]);
	    this.canvas.width  = this.core.$el[0].clientWidth;
	    this.canvas.height = this.core.$el[0].clientHeight;
	    this.redrawCanvas();

	    //console.log(this.canvas.width+','+this.canvas.height);
	  }

	  // ~~~~~~~~~~ DEEPSTREAM ~~~~~~~~~
	  setupDeepstream(){
	  	//console.log(deepstream);
	  	this.dsClient = deepstream('localhost:6020').login();
	    //console.log(this.dsClient);
	    this.recordPts = this.dsClient.record.getRecord(this.progId + '/drawing');
	    // TODO ---
	    this.recordPts.subscribe( 'allpts', this.initDrawing.bind(this)); // draw initial sync'd drawing

	    this.recordPts.subscribe( 'allclear', this.clearCanvas.bind(this), true); // clear whiteboard
	    //this.recordPts = this.dsClient.record.getRecord('drawing');
	    //console.log(this.recordPts);
	    
	    this.line = this.dsClient.record.getRecord(this.progId + '/line');
	    //console.log("-- init line --");
		//console.log(this.line);
	    this.line.subscribe( 'linepts', this.onDrawingEvent.bind(this));
	  }

	  initDrawing(data){
	  	console.log('initDrawing');
	  	if(data) this.points = data; // just syncing my complete drawing with others
	  	if(this.drawn) {return;}
	  	console.log(data);
 		this.redrawCanvas();
  		this.drawn = true;
	  }// end initDrawing

	  redrawCanvas(){
	  	console.log('redraw canvas ----------');
	  	//console.log(this.recordPts.get());
	  	//console.log(this.recordPts.get('allpts'));
	  	//if(this.recordPts.get('allpts')) this.points = this.recordPts.get('allpts');
	  	//else this.points = [];
	  	var w = this.canvas.width;
	    var h = this.canvas.height;
  		for (let l of this.points) {
  			this.drawLine(l.x0*w, l.y0*h, l.x1*w, l.y1*h, l.color, l.brush)
		}
	  }

	  clearCanvas(){
	  	console.log('clearCanvas-------');
	  	// https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
	  	this.context.save();
		// Use the identity matrix while clearing the canvas
		this.context.setTransform(1, 0, 0, 1, 0, 0);
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		// Restore the transform
		this.context.restore();

		this.points=[]; // resetting history
		console.log(this.recordPts.get());
		this.recordPts.set('allpts',[]);
		this.recordPts.set('allclear',{});
		console.log(this.recordPts.get());
	  }

	 drawLine(x0, y0, x1, y1, color, brush, emit){
	 	if(brush == this.brushType.erase1) { this.eraseLine(x0, y0, x1, y1) ;}
	 	else {	this.drawColorLineRound(x0, y0, x1, y1, color); }

/*	    this.context.beginPath();
	    this.context.moveTo(x0, y0);
	    this.context.lineTo(x1, y1);
	    this.context.strokeStyle = color;
	    this.context.lineWidth = 8;
	    this.context.lineJoin = this.context.lineCap = 'round';
	    this.context.stroke();
	    this.context.closePath();*/
	    if (!emit) { return; }
	    var w = this.canvas.width;
	    var h = this.canvas.height;
	    this.points.push({
	      x0: x0 / w,
	      y0: y0 / h,
	      x1: x1 / w,
	      y1: y1 / h,
	      color: color,
	      brush: brush
	    });
	    // sending total data
	    //this.recordPts.set(this.progId+'/drawing',this.points);
	    this.recordPts.set('allpts', this.points);
	    // sending data to websocket
	    this.line.set('linepts', {
	      x0: x0 / w,
	      y0: y0 / h,
	      x1: x1 / w,
	      y1: y1 / h,
	      color: color,
	      brush: brush
	    });
	} // end drawline

	drawColorLineRound(x0, y0, x1, y1, color){
		this.context.globalCompositeOperation = "source-over";
		this.context.beginPath();
	    this.context.moveTo(x0, y0);
	    this.context.lineTo(x1, y1);
	    this.context.strokeStyle = color;
	    this.context.lineWidth = 8;
	    this.context.lineJoin = this.context.lineCap = 'round';
	    this.context.stroke();
	    this.context.closePath();
	}

	eraseLine(x0, y0, x1, y1){
		//this.context.globalCompositeOperation = "copy";
		this.context.globalCompositeOperation = "destination-out";
		
		// And draw a thick line that removes what's already there
		this.context.lineWidth=20;
		this.context.beginPath();
	    this.context.moveTo(x0, y0);
	    this.context.lineTo(x1, y1);
	    this.context.strokeStyle = 'rgba(0,0,0,1.0)';
	    this.context.lineJoin = this.context.lineCap = 'round';
	    this.context.stroke();
	    this.context.closePath();
	}

	  onMouseDown(e){
	    this.drawing = true;
	    this.current.x = e.clientX;
	    this.current.y = e.clientY;
	  }

	  onMouseUp(e){
	    if (!this.drawing) { return; }
	    this.drawing = false;
	    this.drawLine(this.current.x, this.current.y, e.clientX, e.clientY, this.current.color,this.current.brush, true);

	    //---------- TESTING WebSocket ------------
	    //this.recordPts.set('sketch-line', {});
	  }

	  onMouseMove(e){
	  	//console.log("MOUSE MOVE-----------");
	  	//console.log(this);
	    if (!this.drawing) { return; }
	    this.drawLine(this.current.x, this.current.y, e.clientX, e.clientY, this.current.color,this.current.brush, true);
	    this.current.x = e.clientX;
	    this.current.y = e.clientY;
	  }

	  onColorUpdate(e){
	    this.current.color = e.target.className.split(' ')[1];
	  }

	  onBrushTypeSelect(e){
	  	console.log('onBrushTypeSelect');
	  	console.log(e);
	  	console.log(e.target.classList);
	  	this.current.brush = e.target.classList[1];
	  	console.log("Current brush :" + this.current.brush);
	  	//this.current.brush = e.target.classname.split(' ')[1];
	  }

	  onDrawingEvent(data){
	  	//console.log("onDrawingEvent----");
	  	//console.log(this);
	    var w = this.canvas.width;
	    var h = this.canvas.height;

	    //console.log(data);
	    //console.log("---LINE---");
	    //console.log(this.line);
	    this.drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.brush);
	  }

	    // limit the number of events per second
	  throttle(callback, delay) {
	    var previousCall = new Date().getTime();
	    return function() {
	      var time = new Date().getTime();
	      if ((time - previousCall) >= delay) {
	        previousCall = time;
	        callback.apply(null, arguments);
	      }
	    };
	  }
	// -------------------------------

	openWB(){
		this.core.getCurrentPlayback().pause();
		this.$el.html(this.template({ 	'shareURL' 	: this.core.getCurrentPlayback().options.shareURL ,
										'prog_id'	: this.core.getCurrentPlayback().options.prog_id
									}));
		this.addBackDrop();
		//$('#svcBtn').animate({ 'width': '90%' }, 400);
		this.isBanner = true;
		this.setupCanvas(); // ~~~~~~~~~~~
	}


	closeWB(){
		this.core.getCurrentPlayback().play();
		this.$el.html(this.myBtnTemplate);
		this.isBanner = false;
		this.removeBackDrop();
	}

	onCopyBtnClicked(){
		this.copyToClipboard(this.core.getCurrentPlayback().options.shareURL);
		// show URL of the source
		alert('Link copied to clipboard : \n' + this.core.getCurrentPlayback().options.shareURL);
		this.$el.html(this.myBtnTemplate);
		this.isBanner = false;
		this.removeBackDrop();
		this.core.getCurrentPlayback().play();
	}

  	addBackDrop(){
  		this.$el.css('height', '100%')
		this.$el.css('width', '100%')
  	}
  	removeBackDrop(){
  		this.$el.css('height', '')
		this.$el.css('width', '')
		//this.$el.removeAttribute("style")
  	}

}
