class Point {
	constructor(px,py){
		this.x = px;
		this.y = py;
	}
	copy(){ // returns a new Point
		return new Point(this.x, this.y);
	}
	add(p){ // in-place
		this.x += p.x;
		this.y += p.y;
	}
	subtract(p){ // in-place
		this.x -= p.x;
		this.y -= p.y;
	}
	minus(p){ // returns a new Point
		let result = this.copy();
		result.subtract(p);
		return result;
	}
	toString(){
		return '('+this.x+','+this.y+')';
	}
}

class Tile {
	constructor(x,y){
		this.location = new Point(x,y);
	}
}

class Map {
	constructor(context, width, height){
		this.context = context;
		this.screenWidth = width;
		this.screenHeight = height;
		this.hexRad = 10;
		this.focus = new Point(0,0);
		this.tiles = [];
		this.generateMap(16,8);
	}
	draw(){
		let c = this.context;
		let shift = new Point(
			this.screenWidth/2 - this.focus.x,
			this.screenHeight/2 - this.focus.y
		);
		let halfHeight = this.hexRad * Math.sin(Math.PI/3);
		for(let i=0; i<this.tiles.length; ++i){
			c.save();
			let tile = this.tiles[i];
			let tx = shift.x + tile.location.x * this.hexRad * 1.5;
			let ty = shift.y + tile.location.y * halfHeight
			
			console.log(tile.location.toString(),tx,ty);

			c.translate(tx, ty);
			this.drawHex();
			c.restore();
		}
	}
	drawHex(){
		let c = this.context;
		c.strokeStyle = '#ccc';
		c.beginPath();
		for(let i=0; i<6; ++i){
			if(i===0){ c.moveTo(this.hexRad,0); }
			else{
				c.lineTo(
					this.hexRad*Math.cos(i*Math.PI/3),
					this.hexRad*Math.sin(i*Math.PI/3)
				);
			}
		}
		c.closePath();
		c.stroke();
	}
	generateMap(w,h){
		this.tiles = [];
		for(let x=0; x<w; ++x){
			for(let y=0; y<h; ++y){
				this.tiles.push(new Tile(x, (y*2)+x%2));
			}
		}
	}
	moveFocus(p){
		this.focus.subtract(p);
	}
}

class View {
	constructor () {
		this.canvas = $('#canvas').get(0);
		console.log('canvas',this.canvas);
		this.context = this.canvas.getContext('2d');
		this.map = new Map(this.context, this.canvas.width, this.canvas.height);
	}
	clear(){
		let c = this.context;
		c.fillStyle='#eee';
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
