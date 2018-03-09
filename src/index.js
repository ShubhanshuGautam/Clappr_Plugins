import {UICorePlugin, Events, template, Styler} from 'clappr'
import * as deepstream from 'deepstream.io-client-js'


export default class EspxWhiteboard extends UICorePlugin {
	  constructor(core) {
	    super(core);
	    this.firstLoad = true;
	    // this.core is created in a super class. Hence created after this constructor finishes
	    this.progId = core._options.prog_id;
	    this.curMedContTime=0;
	    this.rPos = 0; 
	    this.isBanner = false;
	    this.drawing = false;
	    this.drawn = false; 
	    this.points = [];
	    this.ESP = this;
	    this.lastTimeout;
	    this.brushType = 	{	brush1:'brush1',
	    						brush2:'brush2',
	    						erase1:'eraser'}
	  }


	  bindEvents() {
	    this.listenToOnce(this.core.mediaControl, Events.MEDIACONTROL_RENDERED, this.initialize);
	    this.listenTo(this.core.mediaControl, Events.MEDIACONTROL_HIDE, this.onHide)
	    this.listenTo(this.core.mediaControl, Events.MEDIACONTROL_SHOW , this.onShow)
	  }

	  initialize(){
	  	this.render();
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

	  onTimeUpdate(progress) {
	  	this.curMedContTime = progress.current;
	  }

	  onReplay(progress) {
	  	console.log('=== onReplay ===');
	  	if(!this.points || !this.points.length>0 || !this.points[this.rPos] || !this.points[this.rPos].timeEl) return ;

	  	while(this.rPos<this.points.length && progress.current >= this.points[this.rPos].timeEl ){
	  		console.log('~~~DRAWING replay~~',this.rPos, this.points[this.rPos].timeEl);
	  		var w = this.canvas.width;
	    	var h = this.canvas.height;
	  		let l = this.points[this.rPos];
	  		this.drawLine(l.x0*w, l.y0*h, l.x1*w, l.y1*h, l.color, l.brush);
	  		// auto erase timeout
	  		window.setTimeout(this.eraseLine.bind(this, l.x0*w, l.y0*h, l.x1*w, l.y1*h), 2000);
	  		this.rPos++;
	  	}
	  }

	get myBtnTemplate (){ 
	  	return (`
	        <!-- Annotate Button -->
	        <img id="shareBtn" data-open-wb style="height: 20px; width: 20px;top: 15px; right: 15px; position: absolute; z-index: 1000;" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAiIHkxPSIyNTcuOTk5NiIgeDI9IjUxMiIgeTI9IjI1Ny45OTk2IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgNTEzLjk5OTYpIj4KCTxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6IzgwRDhGRiIvPgoJPHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRUE4MEZDIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMV8pOyIgZD0iTTQ5MiwxNy45OTdIMjBjLTExLjA0NiwwLTIwLDguOTU0LTIwLDIwdjMyMGMwLDExLjA0Niw4Ljk1NCwyMCwyMCwyMGgxNjAuMTY5bC0yMy41MzIsOTAuOTkyICBjLTIuNzY2LDEwLjY5NCwzLjY2MiwyMS42MDUsMTQuMzU1LDI0LjM3MWMxMC43NDEsMi43NzksMjEuNjE3LTMuNzA5LDI0LjM3MS0xNC4zNTVsMjYuMTIzLTEwMS4wMDhoNjkuMDI4bDI2LjEyMywxMDEuMDA4ICBjMi43NTMsMTAuNjQzLDEzLjYyNiwxNy4xMzQsMjQuMzcxLDE0LjM1NWMxMC42OTMtMi43NjYsMTcuMTIxLTEzLjY3NywxNC4zNTUtMjQuMzcxbC0yMy41MzItOTAuOTkySDQ5MmMxMS4wNDYsMCwyMC04Ljk1NCwyMC0yMCAgdi0zMjBDNTEyLDI2Ljk1MSw1MDMuMDQ2LDE3Ljk5Nyw0OTIsMTcuOTk3eiBNNDcyLDMzNy45OTdINDB2LTI4MGg0MzJWMzM3Ljk5N3oiLz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />
	    `)
	}
 

	get myBannerTemplate (){ 
	  	return (`
	  			<!-- CROSS -->
	  			<div data-close-wb style="position: absolute;right: 15px;top: 15px;z-index:1">
	  				<img style="height: 20px; width: 20px; box-shadow: 0 0 8px 2px grey;border-radius: 10px;" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxLjk3NiA1MS45NzYiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxLjk3NiA1MS45NzY7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8Zz4KCTxwYXRoIGQ9Ik00NC4zNzMsNy42MDNjLTEwLjEzNy0xMC4xMzctMjYuNjMyLTEwLjEzOC0zNi43NywwYy0xMC4xMzgsMTAuMTM4LTEwLjEzNywyNi42MzIsMCwzNi43N3MyNi42MzIsMTAuMTM4LDM2Ljc3LDAgICBDNTQuNTEsMzQuMjM1LDU0LjUxLDE3Ljc0LDQ0LjM3Myw3LjYwM3ogTTM2LjI0MSwzNi4yNDFjLTAuNzgxLDAuNzgxLTIuMDQ3LDAuNzgxLTIuODI4LDBsLTcuNDI1LTcuNDI1bC03Ljc3OCw3Ljc3OCAgIGMtMC43ODEsMC43ODEtMi4wNDcsMC43ODEtMi44MjgsMGMtMC43ODEtMC43ODEtMC43ODEtMi4wNDcsMC0yLjgyOGw3Ljc3OC03Ljc3OGwtNy40MjUtNy40MjVjLTAuNzgxLTAuNzgxLTAuNzgxLTIuMDQ4LDAtMi44MjggICBjMC43ODEtMC43ODEsMi4wNDctMC43ODEsMi44MjgsMGw3LjQyNSw3LjQyNWw3LjA3MS03LjA3MWMwLjc4MS0wLjc4MSwyLjA0Ny0wLjc4MSwyLjgyOCwwYzAuNzgxLDAuNzgxLDAuNzgxLDIuMDQ3LDAsMi44MjggICBsLTcuMDcxLDcuMDcxbDcuNDI1LDcuNDI1QzM3LjAyMiwzNC4xOTQsMzcuMDIyLDM1LjQ2LDM2LjI0MSwzNi4yNDF6IiBmaWxsPSIjRDgwMDI3Ii8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />
	  				<!--
	  				<img style="height: 20px; width: 20px; background: rgba(6, 16, 25, 0.6); border-radius: 10px;" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDIxLjkgMjEuOSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjEuOSAyMS45IiB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4Ij4KICA8cGF0aCBkPSJNMTQuMSwxMS4zYy0wLjItMC4yLTAuMi0wLjUsMC0wLjdsNy41LTcuNWMwLjItMC4yLDAuMy0wLjUsMC4zLTAuN3MtMC4xLTAuNS0wLjMtMC43bC0xLjQtMS40QzIwLDAuMSwxOS43LDAsMTkuNSwwICBjLTAuMywwLTAuNSwwLjEtMC43LDAuM2wtNy41LDcuNWMtMC4yLDAuMi0wLjUsMC4yLTAuNywwTDMuMSwwLjNDMi45LDAuMSwyLjYsMCwyLjQsMFMxLjksMC4xLDEuNywwLjNMMC4zLDEuN0MwLjEsMS45LDAsMi4yLDAsMi40ICBzMC4xLDAuNSwwLjMsMC43bDcuNSw3LjVjMC4yLDAuMiwwLjIsMC41LDAsMC43bC03LjUsNy41QzAuMSwxOSwwLDE5LjMsMCwxOS41czAuMSwwLjUsMC4zLDAuN2wxLjQsMS40YzAuMiwwLjIsMC41LDAuMywwLjcsMC4zICBzMC41LTAuMSwwLjctMC4zbDcuNS03LjVjMC4yLTAuMiwwLjUtMC4yLDAuNywwbDcuNSw3LjVjMC4yLDAuMiwwLjUsMC4zLDAuNywwLjNzMC41LTAuMSwwLjctMC4zbDEuNC0xLjRjMC4yLTAuMiwwLjMtMC41LDAuMy0wLjcgIHMtMC4xLTAuNS0wLjMtMC43TDE0LjEsMTEuM3oiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+Cg==">
	  				-->
	  			</div>

	  			<div data-play style="position: absolute;left: 15px;top: 15px;z-index:1">
	  				<img style="height: 20px;width: 20px; border-radius: 10px;box-shadow: 0 0 8px 2px grey;background-color: mediumseagreen;" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjMycHgiIGhlaWdodD0iMzJweCIgdmlld0JveD0iMCAwIDMxNC4wNjggMzE0LjA2OCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzE0LjA2OCAzMTQuMDY4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGcgaWQ9Il94MzNfNTYuX1BsYXkiPgoJCTxnPgoJCQk8cGF0aCBkPSJNMjkzLjAwMiw3OC41M0MyNDkuNjQ2LDMuNDM1LDE1My42MTgtMjIuMjk2LDc4LjUyOSwyMS4wNjhDMy40MzQsNjQuNDE4LTIyLjI5OCwxNjAuNDQyLDIxLjA2NiwyMzUuNTM0ICAgICBjNDMuMzUsNzUuMDk1LDEzOS4zNzUsMTAwLjgzLDIxNC40NjUsNTcuNDdDMzEwLjYyNywyNDkuNjM5LDMzNi4zNzEsMTUzLjYyLDI5My4wMDIsNzguNTN6IE0yMTkuODM0LDI2NS44MDEgICAgIGMtNjAuMDY3LDM0LjY5Mi0xMzYuODk0LDE0LjEwNi0xNzEuNTc2LTQ1Ljk3M0MxMy41NjgsMTU5Ljc2MSwzNC4xNjEsODIuOTM1LDk0LjIzLDQ4LjI2ICAgICBjNjAuMDcxLTM0LjY5LDEzNi44OTQtMTQuMTA2LDE3MS41NzgsNDUuOTcxQzMwMC40OTMsMTU0LjMwNywyNzkuOTA2LDIzMS4xMTcsMjE5LjgzNCwyNjUuODAxeiBNMjEzLjU1NSwxNTAuNjUybC04Mi4yMTQtNDcuOTQ5ICAgICBjLTcuNDkyLTQuMzc0LTEzLjUzNS0wLjg3Ny0xMy40OTMsNy43ODlsMC40MjEsOTUuMTc0YzAuMDM4LDguNjY0LDYuMTU1LDEyLjE5MSwxMy42NjksNy44NTFsODEuNTg1LTQ3LjEwMyAgICAgQzIyMS4wMjksMTYyLjA4MiwyMjEuMDQ1LDE1NS4wMjYsMjEzLjU1NSwxNTAuNjUyeiIgZmlsbD0iI0ZGRkZGRiIvPgoJCTwvZz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K">
	  			</div>
	  			<div data-pause style="display: none; position: absolute; left: 15px;top: 15px; z-index:1">
	  				<img style="height: 20px; width: 20px; border-radius: 10px; box-shadow: 0 0 8px 2px grey; background-color: yellow;" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjMycHgiIGhlaWdodD0iMzJweCIgdmlld0JveD0iMCAwIDUxMCA1MTAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMCA1MTA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8ZyBpZD0icGF1c2UtY2lyY2xlLW91dGxpbmUiPgoJCTxwYXRoIGQ9Ik0xNzguNSwzNTdoNTFWMTUzaC01MVYzNTd6IE0yNTUsMEMxMTQuNzUsMCwwLDExNC43NSwwLDI1NXMxMTQuNzUsMjU1LDI1NSwyNTVzMjU1LTExNC43NSwyNTUtMjU1UzM5NS4yNSwwLDI1NSwweiAgICAgTTI1NSw0NTljLTExMi4yLDAtMjA0LTkxLjgtMjA0LTIwNFMxNDIuOCw1MSwyNTUsNTFzMjA0LDkxLjgsMjA0LDIwNFMzNjcuMiw0NTksMjU1LDQ1OXogTTI4MC41LDM1N2g1MVYxNTNoLTUxVjM1N3oiIGZpbGw9IiNGRkZGRkYiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />
	  			</div>

	  			<canvas class="whiteboard" style="border: 2px solid #ccc; height: 100%; width: 100%; position: absolute; left: 0; right: 0; bottom: 0; top: 0; background-color: rgba(256, 256, 256, 0.2)"></canvas>
				<code style="position: relative;top:5px;font-size:large;"> <%= prog_id %> </code>

				<div style="top: 15px;position:  relative;">
				  	<div class="btn-group" style="position: absolute; width: 100%;">
	  					<button data-clear-wb type="button" class="btn btn-danger" style="box-shadow: 0 8px 6px -6px black">clear</button>
					</div>
					<div class="btn-group" style="left:10px;position:relative;width:  fit-content;float: left; box-shadow: 0 8px 6px -6px black">
  						<button type="button" class="brush brush1 btn btn-primary">brush1</button>
  						<button type="button" class="brush brush2 btn btn-primary">brush2</button>
  						<button type="button" class="brush eraser btn btn-primary">eraser</button>
					</div>

					<div style="position:relative;right:10px;width:  fit-content;float: right;line-height: 0;padding: 5px;background: lightgrey;border-radius: 0.3rem; box-shadow: 0 8px 6px -6px black">
					    <div class="color black" style="display: inline-block;height: 30px;width: 30px; background-color: black;border-radius:  0.5rem;"></div>
					    <div class="color red" style="display: inline-block;height: 30px;width: 30px; background-color: red;border-radius:  0.5rem;"></div>
					    <div class="color green" style="display: inline-block;height: 30px;width: 30px; background-color: green;border-radius:  0.5rem;"></div>
					    <div class="color blue" style="display: inline-block;height: 30px;width: 30px; background-color: blue;border-radius:  0.5rem;"></div>
					    <div class="color yellow" style="display: inline-block;height: 30px;width: 30px; background-color: yellow;border-radius:  0.5rem;"></div>
					    <div class="color aqua" style="display: inline-block; height: 30px; width: 30px; background-color: aqua;border-radius:  0.5rem;"></div>
					</div>
				</div>
	    `)
	}




	  render(){
	  	// This is the Vid Annotator button UI Object that has to be put onto player
	  	this.$el.html(this.myBtnTemplate);
	  	// append html of this plugin component to core's body
	    this.core.$el.append(this.el);
	    return this;
	  }

	get events(){
		return{
			'click [data-open-wb]'	: 'openWB',
			'click [data-close-wb]'	: 'closeWB',
			'click [data-clear-wb]'	: 'emitClear',
			'click [data-play]'		: 'playBGvid',
			'click [data-pause]'	: 'pauseBGvid',
		}
	}

	//------------ CANVAS -----------
	setupCanvas(){
		if(this.core.mediaControl.container){
	  		this.listenTo(this.core.mediaControl.container, Events.CONTAINER_TIMEUPDATE , this.onTimeUpdate);
	  		this.listenTo(this.core.mediaControl.container, Events.CONTAINER_TIMEUPDATE , this.onReplay);
	  	} 
		//console.log("SETUP");
	
		this.canvas 	= document.getElementsByClassName('whiteboard')[0];
  		this.colors 	= document.getElementsByClassName('color');
  		this.brushes 	= document.getElementsByClassName('brush');
  		this.context 	= this.canvas.getContext('2d'); 
  		this.current 	= { color: 'black' };

  		this.current.brush	= this.brushType.brush1; //default is brush1
  		this.drawing 	= false; //init

  		// MOUSE EVENT LISTENERS
  		this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
		this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false);
		this.canvas.addEventListener('mouseout', this.onMouseUp.bind(this), false);
		this.canvas.addEventListener('mousemove', this.throttle(this.onMouseMove.bind(this), 5), false);
		// TOUCH EVENT LISTENERS
		this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), false);
		this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), false);
		this.canvas.addEventListener('touchend',  this.onTouchEnd.bind(this), false);

		for (var i = 0; i < this.colors.length; i++){
    		this.colors[i].addEventListener('click', this.onColorUpdate.bind(this), false);
  		}
  		for (var i = 0; i < this.brushes.length; i++){
    		this.brushes[i].addEventListener('click', this.onBrushTypeSelect.bind(this), false);
  		}
  	
  		window.addEventListener('resize', this.onResize.bind(this), false);
  		this.setupDeepstream();

  		this.setCanvasSize();
	} // end setupCanvas

	  // make the canvas fill its parent
	  onResize() {
		this.setCanvasSize();
	  }

	  // make the canvas fill its parent(Player)
	  setCanvasSize() {
	    this.canvas.width  = this.core.$el[0].clientWidth;
	    this.canvas.height = this.core.$el[0].clientHeight;
	  }

	  // ~~~~~~~~~~ DEEPSTREAM ~~~~~~~~~
	  setupDeepstream(){
	  	console.log(deepstream);
	  	this.dsClient = deepstream(this.core.getCurrentPlayback().options.ds_server).login();
	    console.log(this.dsClient);
	    // OLD
	    this.recordPts = this.dsClient.record.getRecord(this.progId + '/drawing');
	    // TODO ---
	    this.recordPts.subscribe( 'allpts', this.initDrawing.bind(this)); // update sync'd drawing
	    this.dsClient.event.subscribe( 'allclr', this.clearCanvas.bind(this) );

	    this.line = this.dsClient.record.getRecord(this.progId + '/line');
	    this.line.subscribe( 'linepts', this.onDrawingEvent.bind(this));
	  }

	  initDrawing(data){
	  	console.log('initDrawing ---');
	  	if(data) this.points = data; // just syncing my complete drawing with others
	  	if(this.drawn) {return;}
	  	console.log(data);
 		//RM this.redrawCanvas();
  		this.drawn = true;

  		// UPDATING rPos--------------
  		if(this.points && this.points.length>0 && this.points[this.rPos].timeEl){
	  		while(Math.floor(this.curMedContTime) >= Math.floor(this.points[this.rPos].timeEl)) {
	  			this.rPos++;
	  		}
  		}
  		console.log(this.rPos);
	  }// end initDrawing

	  redrawCanvas(){
	  	console.log('redraw canvas ----------');
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
		
		console.log('end clearCanvas-------');
	  }

	  emitClear(){
	  	console.log('emit Clear -------');
		this.points=[]; // resetting local history
		console.log(this.recordPts.get());
		this.recordPts.set('allpts',[]); // resetting drawing remote history
		//this.line.set('linepts',{}); // resetting last point drawn
		this.dsClient.event.emit( 'allclr', 'Clear Everything!' );
		console.log(this.recordPts.get());
		console.log('end emit Clear -------');
	  }

	 // ~~~~~ DRAW LINE ~~~~~
	 drawLine(x0, y0, x1, y1, color, brush, emit){
	 	console.log(brush);
	 	if(brush == this.brushType.erase1) { this.eraseLine(x0, y0, x1, y1) ;}
	 	else if(brush == this.brushType.brush1){this.drawColorLineRound(x0, y0, x1, y1, color);}
	 	else if(brush == this.brushType.brush2){this.drawColorLineSquare(x0, y0, x1, y1, color);}
	 	else {	this.drawColorLineRound(x0, y0, x1, y1, color); } //default pen

	    if (!emit) { return; }
	    var w = this.canvas.width;
	    var h = this.canvas.height;
	    this.points.push({
	      x0: x0 / w,
	      y0: y0 / h,
	      x1: x1 / w,
	      y1: y1 / h,
	      color: color,
	      brush: brush,
	      timeEl: this.curMedContTime
	    });
	    // clear last timeout if exists
	    window.clearTimeout(this.lastTimeout);
	    this.lastTimeout = window.setTimeout( this.recordPts.set('allpts', this.points), 10000);
	    // sending total data
	    //this.recordPts.set(this.progId+'/drawing',this.points);
	    //var myVar = setInterval(function(){ myTimer() }, 1000);
	    //this.throttle(this.recordPts.set('allpts', this.points), 20000); // 3sec throttle
	    //this.recordPts.set('allpts', this.points);
	    // sending new line data to websocket
	   	console.log('******* YOYO *******',{
	      x0: x0 / w,
	      y0: y0 / h,
	      x1: x1 / w,
	      y1: y1 / h,
	      color: color,
	      brush: brush,
	      timeEl: this.curMedContTime
	    });
	    this.line.set('linepts', {
	      x0: x0 / w,
	      y0: y0 / h,
	      x1: x1 / w,
	      y1: y1 / h,
	      color: color,
	      brush: brush,
	      timeEl: this.curMedContTime // not required 
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

	drawColorLineSquare(x0, y0, x1, y1, color){
		this.context.globalCompositeOperation = "source-over";
		this.context.beginPath();
	    this.context.moveTo(x0, y0);
	    this.context.lineTo(x1, y1);
	    this.context.strokeStyle = color;
	    this.context.lineWidth = 12;
	    this.context.lineJoin = 'round';
	    this.context.lineCap = 'square';
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
	    window.setTimeout(this.eraseLine.bind(this, this.current.x, this.current.y, e.clientX, e.clientY),2000);
	    // 1. Provide a buuton 2. get a record(to sync clients) for autoerase functionality 3. run settimeout accordingly
	    this.current.x = e.clientX;
	    this.current.y = e.clientY;
	  }


	// TOUCH HANDLERS
	  onTouchStart(e){
	  	e.preventDefault();
	  	if (event.targetTouches.length == 1) {
    		let touch = e.targetTouches[0];
    		console.log('Start',touch);
	    	this.drawing = true;
		    this.current.x = touch.clientX;
		    this.current.y = touch.clientY;
    	}else{
    		console.log("Use only One Finger to draw !");
    	}
	  }

	  onTouchMove(e){
	  	e.preventDefault();
	  	if (event.targetTouches.length == 1) {
    		let touch = e.targetTouches[0];
    		console.log('Move',touch);
    		console.log(typeof touch.clientX);
    		if (!this.drawing) { return; }
		    this.drawLine(this.current.x, this.current.y, touch.clientX, touch.clientY, this.current.color,this.current.brush, true);
		    window.setTimeout(this.eraseLine.bind(this, this.current.x, this.current.y, touch.clientX, touch.clientY),2000);
		    // 1. Provide a buuton 2. get a record(to sync clients) for autoerase functionality 3. run settimeout accordingly
		    this.current.x = touch.clientX;
		    this.current.y = touch.clientY;
    	}else{
    		console.log("Use only One Finger to draw !");
    	}
	  }

	  onTouchEnd(e){
	  	e.preventDefault();
	  	console.log('Touch End',e);
	    this.drawing = false;
	  }

	  onColorUpdate(e){
	    this.current.color = e.target.className.split(' ')[1];
	  }

	  onBrushTypeSelect(e){
	  	//console.log('onBrushTypeSelect');
	  	//console.log(e);
	  	//console.log(e.target.classList);
	  	this.current.brush = e.target.classList[1];
	  	console.log("Current brush :" + this.current.brush);
	  	//this.current.brush = e.target.classname.split(' ')[1];
	  }

	  //This method is called when anything LIVE is drawn
	  onDrawingEvent(data){ 
	  	if(this.firstLoad ) {
	  		this.firstLoad = false;
	  		return;
	  	}
	  	if(Math.abs(data.timeEl - this.curMedContTime)>1) {return;}
	    var w = this.canvas.width;
	    var h = this.canvas.height;
	    if(data){
	    	this.drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.brush);
	    	window.setTimeout(this.eraseLine.bind(this, data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h),2000);
		}
	  }

	    // limit the number of events per second
	  throttle(callback, delay) {
	    var previousCall = new Date().getTime();
	    //console.log('--throt out--');
	    return function() {
	      var time = new Date().getTime();
	      if ((time - previousCall) >= delay) {
	      	//console.log('--throt in--');
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
		this.isBanner = true;
		this.setupCanvas(); // ~~~~~~~~~~~
	}


	closeWB(){
		//stopListening ( obj  name  callback )
		this.stopListening(this.core.mediaControl.container, Events.CONTAINER_TIMEUPDATE , this.unListen);

		this.drawn = false; // to handle closing wb and opening again
		this.core.getCurrentPlayback().play();
		this.$el.html(this.myBtnTemplate);
		this.isBanner = false;
		this.removeBackDrop();
	}

	unListen(){
		console.log('--- unListen called ---');
	}

	playBGvid(){
		this.core.getCurrentPlayback().play();
		$('[data-play]').hide();
		$('[data-pause]').show();
		console.log($('[data-play]'));
	}

	pauseBGvid(){
		this.core.getCurrentPlayback().pause();
		$('[data-play]').show();
		$('[data-pause]').hide();
		console.log($('[data-pause]'));
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
