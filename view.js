class View {
	constructor () {
		this.canvas = $('#canvas').get(0);
		console.log('canvas',this.canvas);
		this.context = this.canvas.getContext('2d');
		this.map = new Map(this.context, this.canvas.width, this.canvas.height);
	}
	clear(){
		let c = this.context;
		c.fillStyle='#ffffff';
		c.rect(0,0,200,200);
		c.fill();
	}
	draw(){
		this.clear();
		this.map.draw();
	}
	moveFocus(p){
		this.map.moveFocus(p);
	}
}
