import {UICorePlugin, Events, template, Styler} from 'clappr'
import * as deepstream from 'deepstream.io-client-js'

//import wbStyle from './public/wbStyle.scss'

export default class EspxSocial extends UICorePlugin {
	  constructor(core) {
	    super(core);
	    this.isBanner = false;
	    this.drawing = false;
	    this.ESP = this;
	    this.points = [];
	    //this.deepstream = require('deepstream.io-client-js');
	  }


	  bindEvents() {
	  	console.log("BindEvents");
	    this.listenToOnce(this.core.mediaControl, Events.MEDIACONTROL_RENDERED, this.initialize);
	    this.listenTo(this.core.mediaControl, Events.MEDIACONTROL_HIDE, this.onHide)
	    this.listenTo(this.core.mediaControl, Events.MEDIACONTROL_SHOW , this.onShow)
	  }

	  initialize(){
	  	this.render();

	  	console.log(this.core.getCurrentPlayback().options.shareURL)
	  }

	  test1(){
	  	console.log(this.recordPts);
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
	  		<img id="shareBtn" data-share-btn style="height: 20px;width: 20px;top: 15px;right: 15px;position: absolute;z-index: 1000;background: rgba(6, 16, 25, 0.57);border-radius: 10px;"
	        	src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjMycHgiIGhlaWdodD0iMzJweCIgdmlld0JveD0iMCAwIDUxMS42MjYgNTExLjYyNyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTExLjYyNiA1MTEuNjI3OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTUwNi4yMDYsMTc5LjAxMkwzNjAuMDI1LDMyLjgzNGMtMy42MTctMy42MTctNy44OTgtNS40MjYtMTIuODQ3LTUuNDI2cy05LjIzMywxLjgwOS0xMi44NDcsNS40MjYgICBjLTMuNjE3LDMuNjE5LTUuNDI4LDcuOTAyLTUuNDI4LDEyLjg1djczLjA4OWgtNjMuOTUzYy0xMzUuNzE2LDAtMjE4Ljk4NCwzOC4zNTQtMjQ5LjgyMywxMTUuMDZDNS4wNDIsMjU5LjMzNSwwLDI5MS4wMywwLDMyOC45MDcgICBjMCwzMS41OTQsMTIuMDg3LDc0LjUxNCwzNi4yNTksMTI4Ljc2MmMwLjU3LDEuMzM1LDEuNTY2LDMuNjE0LDIuOTk2LDYuODQ5YzEuNDI5LDMuMjMzLDIuNzEyLDYuMDg4LDMuODU0LDguNTY1ICAgYzEuMTQ2LDIuNDcxLDIuMzg0LDQuNTY1LDMuNzE1LDYuMjc2YzIuMjgyLDMuMjM3LDQuOTQ4LDQuODU5LDcuOTk0LDQuODU5YzIuODU1LDAsNS4wOTItMC45NTEsNi43MTEtMi44NTQgICBjMS42MTUtMS45MDIsMi40MjQtNC4yODQsMi40MjQtNy4xMzJjMC0xLjcxOC0wLjIzOC00LjIzNi0wLjcxNS03LjU2OWMtMC40NzYtMy4zMzMtMC43MTUtNS41NjQtMC43MTUtNi43MDggICBjLTAuOTUzLTEyLjkzOC0xLjQyOS0yNC42NTMtMS40MjktMzUuMTE0YzAtMTkuMjIzLDEuNjY4LTM2LjQ0OSw0Ljk5Ni01MS42NzVjMy4zMzMtMTUuMjI5LDcuOTQ4LTI4LjQwNywxMy44NS0zOS41NDMgICBjNS45MDEtMTEuMTQsMTMuNTEyLTIwLjc0NSwyMi44NDEtMjguODM1YzkuMzI1LTguMDksMTkuMzY0LTE0LjcwMiwzMC4xMTgtMTkuODQyYzEwLjc1Ni01LjE0MSwyMy40MTMtOS4xODYsMzcuOTc0LTEyLjEzNSAgIGMxNC41Ni0yLjk1LDI5LjIxNS00Ljk5Nyw0My45NjgtNi4xNHMzMS40NTUtMS43MTEsNTAuMTA5LTEuNzExaDYzLjk1M3Y3My4wOTFjMCw0Ljk0OCwxLjgwNyw5LjIzMiw1LjQyMSwxMi44NDcgICBjMy42MiwzLjYxMyw3LjkwMSw1LjQyNCwxMi44NDcsNS40MjRjNC45NDgsMCw5LjIzMi0xLjgxMSwxMi44NTQtNS40MjRsMTQ2LjE3OC0xNDYuMTgzYzMuNjE3LTMuNjE3LDUuNDI0LTcuODk4LDUuNDI0LTEyLjg0NyAgIEM1MTEuNjI2LDE4Ni45Miw1MDkuODIsMTgyLjYzNiw1MDYuMjA2LDE3OS4wMTJ6IiBmaWxsPSIjRkZGRkZGIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />
	    `)
	}
 

	get myBannerTemplate (){ 
	  	return (`
<!--
	  			<div style="height: 100%; width: 100%; position: relative; background-color: rgba(6, 16, 25, 0.6)"/>
-->


	  			<!-- CROSS -->
	  			<div data-share-ok style="position: absolute;right: 15px;top: 15px;z-index:1">
	  				<img style="height: 20px; width: 20px; background: rgba(6, 16, 25, 0.6);border-radius: 10px;"
	  					src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDIxLjkgMjEuOSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjEuOSAyMS45IiB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4Ij4KICA8cGF0aCBkPSJNMTQuMSwxMS4zYy0wLjItMC4yLTAuMi0wLjUsMC0wLjdsNy41LTcuNWMwLjItMC4yLDAuMy0wLjUsMC4zLTAuN3MtMC4xLTAuNS0wLjMtMC43bC0xLjQtMS40QzIwLDAuMSwxOS43LDAsMTkuNSwwICBjLTAuMywwLTAuNSwwLjEtMC43LDAuM2wtNy41LDcuNWMtMC4yLDAuMi0wLjUsMC4yLTAuNywwTDMuMSwwLjNDMi45LDAuMSwyLjYsMCwyLjQsMFMxLjksMC4xLDEuNywwLjNMMC4zLDEuN0MwLjEsMS45LDAsMi4yLDAsMi40ICBzMC4xLDAuNSwwLjMsMC43bDcuNSw3LjVjMC4yLDAuMiwwLjIsMC41LDAsMC43bC03LjUsNy41QzAuMSwxOSwwLDE5LjMsMCwxOS41czAuMSwwLjUsMC4zLDAuN2wxLjQsMS40YzAuMiwwLjIsMC41LDAuMywwLjcsMC4zICBzMC41LTAuMSwwLjctMC4zbDcuNS03LjVjMC4yLTAuMiwwLjUtMC4yLDAuNywwbDcuNSw3LjVjMC4yLDAuMiwwLjUsMC4zLDAuNywwLjNzMC41LTAuMSwwLjctMC4zbDEuNC0xLjRjMC4yLTAuMiwwLjMtMC41LDAuMy0wLjcgIHMtMC4xLTAuNS0wLjMtMC43TDE0LjEsMTEuM3oiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+Cg==" />
	  			</div>
	  			<canvas class="whiteboard" style="border: 1px solid #ccc; height: 100%; width: 100%; position: absolute; left: 0; right: 0; bottom: 0; top: 0; background-color: rgba(256, 256, 256, 1)"></canvas>
				  <div style="top:10px; position:relative;">
				  	<div class="btn-group" >
  						<button type="button" class="btn btn-primary">brush1</button>
  						<button type="button" class="btn btn-primary">brush2</button>
  						<button id="erase" type="button" class="btn btn-secondary">eraser</button>
					</div>
				    <div class="color black" style="display: inline-block;height: 30px;width: 30px; background-color: black;"></div>
				    <div class="color red" style="display: inline-block;height: 30px;width: 30px; background-color: red;"></div>
				    <div class="color green" style="display: inline-block;height: 30px;width: 30px; background-color: green;"></div>
				    <div class="color blue" style="display: inline-block;height: 30px;width: 30px; background-color: blue;"></div>
				    <div class="color yellow" style="display: inline-block;height: 30px;width: 30px; background-color: yellow;"></div>
				  </div>
<!--
	  			<div id="sharePanel" style="position: absolute;top:50%;margin-top:-65px;left:0;right:0;padding:0 10%;">


				 	<h3 style="color: whitesmoke; padding-bottom: 10px; font-size: large;"> Share </h3>
					<input readonly class="row" type="text" value="<%= shareURL %>" style="font-size: 15px;width=80%;border-radius: 5px;width: 80%;border: hidden;background: mistyrose;padding-top: 3px;padding-bottom: 3px;padding-left: 6px;padding-right: 6px;color: brown;"/>
					<div id='svcBtnRow' class="row" style="padding-top: 15px; text-align: -webkit-center;">
					<div id='svcBtn' style="padding-top: 15px; width:50%">
						<a 	style="padding: 3px;" class="ytp"
							href="https://www.facebook.com/sharer/sharer.php?u=<%= shareURL %>" target="_blank" title="Facebook">
							<svg height="10%" version="1.1" viewBox="0 0 38 38" width="10%"><rect fill="#fff" height="34" width="34" x="2" y="2"></rect><path d="M 34.2,0 3.8,0 C 1.70,0 .01,1.70 .01,3.8 L 0,34.2 C 0,36.29 1.70,38 3.8,38 l 30.4,0 C 36.29,38 38,36.29 38,34.2 L 38,3.8 C 38,1.70 36.29,0 34.2,0 l 0,0 z m -1.9,3.8 0,5.7 -3.8,0 c -1.04,0 -1.9,.84 -1.9,1.9 l 0,3.8 5.7,0 0,5.7 -5.7,0 0,13.3 -5.7,0 0,-13.3 -3.8,0 0,-5.7 3.8,0 0,-4.75 c 0,-3.67 2.97,-6.65 6.65,-6.65 l 4.75,0 z" fill="#39579b"></path>
							</svg>
						</a>

						<a  style="padding: 3px;" class="ytp"
							href="https://twitter.com/share?url=<%= shareURL %>" target="_blank" title="Twitter">
							<svg height="10%" version="1.1" viewBox="0 0 38 38" width="10%"><rect fill="#fff" height="34" width="34" x="2" y="2"></rect><path d="M 34.2,0 3.8,0 C 1.70,0 .01,1.70 .01,3.8 L 0,34.2 C 0,36.29 1.70,38 3.8,38 l 30.4,0 C 36.29,38 38,36.29 38,34.2 L 38,3.8 C 38,1.70 36.29,0 34.2,0 l 0,0 z M 29.84,13.92 C 29.72,22.70 24.12,28.71 15.74,29.08 12.28,29.24 9.78,28.12 7.6,26.75 c 2.55,.40 5.71,-0.60 7.41,-2.06 -2.50,-0.24 -3.98,-1.52 -4.68,-3.56 .72,.12 1.48,.09 2.17,-0.05 -2.26,-0.76 -3.86,-2.15 -3.95,-5.07 .63,.28 1.29,.56 2.17,.60 C 9.03,15.64 7.79,12.13 9.21,9.80 c 2.50,2.75 5.52,4.99 10.47,5.30 -1.24,-5.31 5.81,-8.19 8.74,-4.62 1.24,-0.23 2.26,-0.71 3.23,-1.22 -0.39,1.23 -1.17,2.09 -2.11,2.79 1.03,-0.14 1.95,-0.38 2.73,-0.77 -0.47,.99 -1.53,1.9 -2.45,2.66 l 0,0 z" fill="#01abf0"></path>
							</svg>
						</a>
						<a  style="padding: 3px;" class="ytp"
							href="https://plus.google.com/share?url=<%= shareURL %>" target="_blank" title="Google+">
							<svg height="10%" version="1.0" viewBox="0 0 38 38" width="10%"><rect fill="#fff" height="34" width="34" x="2" y="2"></rect><path d="M34.3,0H3.7C1.7,0,0,1.7,0,3.7v30.5c0,2,1.7,3.7,3.7,3.7h30.5c2,0,3.7-1.7,3.7-3.7V3.7C38,1.7,36.3,0,34.3,0z M13.3,28.5c-5.2,0-9.5-4.3-9.5-9.5c0-5.2,4.3-9.5,9.5-9.5c2.6,0,4.7,.9,6.4,2.5l-2.7,2.7c-1-0.9-2.2-1.4-3.6-1.4 c-3.1,0-5.6,2.6-5.6,5.7s2.5,5.7,5.6,5.7c2.8,0,4.7-1.6,5.1-3.8h-5.1v-3.6h8.9c0.1,.6,.2,1.3,.2,2C22.4,24.6,18.8,28.5,13.3,28.5 z M34.2,19.6H31v3.2h-2.2v-3.2h-3.2v-2.2h3.2v-3.2H31v3.2h3.2V19.6z" fill="#dc4537"></path>
							</svg>
						</a>
						<a  id="ytp4" style="padding: 3px;" data-copy-clipboard type="button">
							<img style="width: 9%;"
								src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MDMuMTE4IDUwMy4xMTgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUwMy4xMTggNTAzLjExODsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxwYXRoIHN0eWxlPSJmaWxsOiNGRkQxNUM7IiBkPSJNMzM1LjE1MSwxNjcuOTY3YzEwLjQ0OSwxMC40NDksMTguODA4LDIyLjk4OCwyNS4wNzgsMzUuNTI3ICBjMjIuOTg4LDQ4LjA2NSwxNS42NzMsMTA4LjY2OS0yNS4wNzgsMTQ4LjM3NUwyMjMuMzQ3LDQ2NC43MThjLTUxLjIsNTEuMi0xMzMuNzQ3LDUxLjItMTgzLjkwMiwwICBjLTUxLjItNTEuMi01MS4yLTEzMy43NDcsMC0xODMuOTAybDc5LjQxMi03OS40MTJjLTkuNDA0LDMxLjM0Ny04LjM1OSw2NC43ODQsMy4xMzUsOTUuMDg2bC0zMy40MzcsMzMuNDM3ICBjLTIyLjk4OCwyMi45ODgtMjIuOTg4LDYxLjY0OSwwLDg1LjY4MmMyNC4wMzMsMjQuMDMzLDYxLjY0OSwyNC4wMzMsODUuNjgyLDBsMTExLjgwNC0xMTEuODA0ICBjMTEuNDk0LTExLjQ5NCwxNy43NjMtMjcuMTY3LDE3Ljc2My00Mi44NDFzLTYuMjY5LTMxLjM0Ny0xNy43NjMtNDIuODQxYy0xMS40OTQtMTEuNDk0LTI3LjE2Ny0xNy43NjMtNDIuODQxLTE3Ljc2M2w1Ni40MjQtNTYuNDI0ICBDMzEyLjE2MywxNDkuMTU5LDMyMy42NTcsMTU3LjUxOCwzMzUuMTUxLDE2Ny45Njd6Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiNGRjcwNTg7IiBkPSJNMTY3Ljk2NywzMzUuMTUxYy0xMC40NDktMTAuNDQ5LTE4LjgwOC0yMi45ODgtMjUuMDc4LTM1LjUyNyAgYy0yMi45ODgtNDguMDY1LTE1LjY3My0xMDguNjY5LDI1LjA3OC0xNDguMzc2TDI3OS43NzEsMzguNGM1MS4yLTUxLjIsMTMzLjc0Ny01MS4yLDE4My45MDIsMGM1MS4yLDUxLjIsNTEuMiwxMzMuNzQ3LDAsMTgzLjkwMiAgbC03OS40MTIsNzkuNDEyYzkuNDA0LTMxLjM0Nyw4LjM1OS02NC43ODQtMy4xMzUtOTUuMDg2bDMzLjQzNy0zMy40MzdjMjIuOTg4LTIyLjk4OCwyMi45ODgtNjEuNjQ5LDAtODUuNjgyICBjLTI0LjAzMy0yNC4wMzMtNjEuNjQ5LTI0LjAzMy04NS42ODIsMEwyMTguMTIyLDIwMC4zNTljLTExLjQ5NCwxMS40OTQtMTcuNzYzLDI3LjE2Ny0xNy43NjMsNDIuODQxczYuMjY5LDMxLjM0NywxNy43NjMsNDIuODQxICBjMTEuNDk0LDExLjQ5NCwyNy4xNjcsMTcuNzYzLDQyLjg0MSwxNy43NjNsLTU2LjQyNCw1Ni40MjRDMTkwLjk1NSwzNTMuOTU5LDE3OS40NjEsMzQ1LjYsMTY3Ljk2NywzMzUuMTUxeiIvPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />
						</a>
						

					</div>

				</div>
-->
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

	  myAnimate(){
	  	$('.ytp').hover(
    		function() {
        		$(this).animate({ 'width': '40px' }, 400);
    		},
    		function() {
        		$(this).animate({ 'width': '30px' }, 400);
    		});
	  }


	get events(){
		return{
			//'click':'onShareBtnClicked',
			'click [data-share-btn]': 'onShareBtnClicked',
			'click [data-share-ok]': 'onOkBtnClicked',
			'click [data-copy-clipboard]': 'onCopyBtnClicked',
		}
	}


	

	//------------ CANVAS -----------
	setupCanvas(){
		console.log("SETUP");
	
		this.canvas = document.getElementsByClassName('whiteboard')[0];
  		this.colors = document.getElementsByClassName('color');
  		this.eraser = document.getElementById('erase');
  		this.context = this.canvas.getContext('2d');
  		this.current = { color: 'black' };
  		this.drawing = false;
		console.log(this);
  		console.log(this.canvas);

  		  this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
		  this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false);
		  this.canvas.addEventListener('mouseout', this.onMouseUp.bind(this), false);
		  this.canvas.addEventListener('mousemove', this.throttle(this.onMouseMove.bind(this), 10), false);
		  //this.canvas.addEventListener('mousemove', this.ferji, false);

		for (var i = 0; i < this.colors.length; i++){
    		this.colors[i].addEventListener('click', this.onColorUpdate.bind(this), false);
  		}

  		window.addEventListener('resize', this.onResize.bind(this), false);
  		this.onResize();
  		this.setupDeepstream();
	}

	  // make the canvas fill its parent
	  onResize() {
	  	console.log(this.core.$el[0]);
	    this.canvas.width  = this.core.$el[0].clientWidth;
	    this.canvas.height = this.core.$el[0].clientHeight;
	    console.log(this.canvas.width+','+this.canvas.height);
	  }

	  setupDeepstream(){
	  	//console.log(deepstream);
	  	this.dsClient = deepstream('localhost:6020').login();
	    console.log(this.dsClient);
	    this.recordPts = this.dsClient.record.getRecord('drawing');
	    this.recordPts.subscribe( 'drawing', this.test1.bind(this));
	    //this.recordPts = this.dsClient.record.getRecord('drawing');
	    console.log(this.recordPts);
	    
	    this.line = this.dsClient.record.getRecord('line');
	    console.log("-- init line --");
		console.log(this.line);
	    this.line.subscribe( 'line', this.onDrawingEvent.bind(this));
	  }

	 drawLine(x0, y0, x1, y1, color, emit){
	    this.context.beginPath();
	    this.context.moveTo(x0, y0);
	    this.context.lineTo(x1, y1);
	    this.context.strokeStyle = color;
	    this.context.lineWidth = 8;
	    this.context.lineJoin = this.context.lineCap = 'round';
	    this.context.stroke();
	    this.context.closePath();
//---------- TESTING WebSocket ------------
	    if (!emit) { return; }
	    var w = this.canvas.width;
	    var h = this.canvas.height;
	    this.points.push({
	    	x1: x1 / w,
	    	y1: y1 / h,
	    	color: color
	    });
	    this.recordPts.set('drawing',this.points);
	    // sending data to websocket
	    this.line.set('line', {
	      x0: x0 / w,
	      y0: y0 / h,
	      x1: x1 / w,
	      y1: y1 / h,
	      color: color
	    });
/*
// sending the stroke data with appropriate ratio normalization
    socket.emit('drawing', {
	      x0: x0 / w,
	      y0: y0 / h,
	      x1: x1 / w,
	      y1: y1 / h,
	      color: color
	    });
*/
	} // end drawline

	eraseLine(){
		this.context.globalCompositeOperation = "copy";
		this.context.beginPath();
	    this.context.moveTo(x0, y0);
	    this.context.lineTo(x1, y1);
	    this.context.strokeStyle = color;
	    this.context.lineWidth = 8;
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
	    this.drawLine(this.current.x, this.current.y, e.clientX, e.clientY, this.current.color, true);

	    //---------- TESTING WebSocket ------------
	    //this.recordPts.set('sketch-line', {});
	  }

	  onMouseMove(e){
	  	//console.log("MOUSE MOVE-----------");
	  	//console.log(this);
	    if (!this.drawing) { return; }
	    this.drawLine(this.current.x, this.current.y, e.clientX, e.clientY, this.current.color, true);
	    this.current.x = e.clientX;
	    this.current.y = e.clientY;
	  }

	  onColorUpdate(e){
	    this.current.color = e.target.className.split(' ')[1];
	  }

	  onEraserSelect(e){
	  	this.current.color
	  }

	  onDrawingEvent(data){
	  	console.log("onDrawingEvent----");
	  	console.log(this);
	    var w = this.canvas.width;
	    var h = this.canvas.height;

	    console.log(data);
	    console.log("---LINE---");
	    console.log(this.line);
	    this.drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
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

	onShareBtnClicked(){
		this.core.getCurrentPlayback().pause();
		this.$el.html(this.template({ 'shareURL' : this.core.getCurrentPlayback().options.shareURL }));
		this.addBackDrop();
		//$('#svcBtn').animate({ 'width': '90%' }, 400);
		this.isBanner = true;
		this.setupCanvas(); // ~~~~~~~~~~~
	}


	onOkBtnClicked(){
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

	copyToClipboard(value) {
    var textArea = document.createElement("textarea");
    textArea.value = value;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      var successful = document.execCommand('copy');

      var msg = successful ? 'successful' : 'unsuccessful';
      if(msg=='successful') {
        console.log('Copying text command was ' + msg);
      }
    } catch (err) {
      console.log('Oops, unable to copy :' + err);
    }
    document.body.removeChild(textArea);
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
