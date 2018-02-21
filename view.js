class View {
	constructor () {
		this.debug = false;
		this.canvas = $('#canvas').get(0);
		console.log('canvas',this.canvas);
		this.context = this.canvas.getContext('2d');

		if(!this.debug){
			$('#canvas').width=400;
			$('#canvas').height=400;
		}
		this.map = new Map(this.context, this.canvas.width, this.canvas.height);
		if(this.debug){
			this.map.colors.hexLine = '#eee';
			this.map.colors.water = '#eee';
		}
	}
	clear(){
		let c = this.context;
		c.fillStyle='#ffffff';
		c.rect(0,0,200,200);
		c.fill();
	}
	click(){
		this.map.click();
		this.draw();
	}
	draw(){
		this.clear();
		this.map.draw();
	}
	moveFocus(p){
		this.map.moveFocus(p);
	}
}
