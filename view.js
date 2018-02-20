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
		this.type=0;
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
		this.generateMap(20,10);
	}
	draw(){
		let c = this.context;
		for(let i=0; i<this.tiles.length; ++i){
			c.save();
			let tile = this.tiles[i];
			let position = this.getCoordScreetPosition(tile.location);
			let mapWidth = this.getMapWidth();
			if(position.x < -this.hexRad){ position.x += mapWidth; }
			else if(position.x > mapWidth){ position.x -= mapWidth; }
			c.translate(position.x, position.y);
			this.drawHex(tile);
			c.restore();
		}
	}
	drawHex(tile){
		let c = this.context;

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

		if(tile.type===1){
			c.fillStyle='#eee';
			c.fill();
		}

		c.strokeStyle = '#eee';
		c.stroke();
	}
	generateMap(w,h){
		this.mapColumns = w;
		this.mapRows = h;
		this.tiles = [];
		for(let x=0; x<w; ++x){
			for(let y=0; y<h; ++y){
				let t = new Tile(x, (y*2)+x%2);
				if(x===0&&y===0){t.type=1;}
				this.tiles.push(t);
			}
		}
	}
	getMapHeight(){
		return this.hexRad * Math.sin(Math.PI/3) * 2 * this.mapRows;
	}
	getMapWidth(){
		return this.mapColumns * this.hexRad * 1.5;
	}
	getCoordScreetPosition(coord){
		let shift = new Point(
			this.screenWidth/2 - this.focus.x,
			this.screenHeight/2 - this.focus.y
		);
		let halfHeight = this.hexRad * Math.sin(Math.PI/3);
		let tx = shift.x + coord.x * this.hexRad * 1.5;
		let ty = shift.y + coord.y * halfHeight
		return new Point(tx,ty);
	}
	moveFocus(delta){
		this.focus.subtract(delta);

		let mapWidth = this.getMapWidth();
		if(this.focus.x > mapWidth){ this.focus.x -= mapWidth; }
		if(this.focus.x < 0){ this.focus.x += mapWidth; }

		let miny = 0;
		let maxy = this.getMapHeight();
		if(this.focus.y > maxy){ this.focus.y = maxy; }
		else if(this.focus.y < miny){ this.focus.y = miny; }
	}
	focusOnPoint(p){
		let halfHeight = this.hexRad * Math.sin(Math.PI/3);
		let screen = new Point(
			p.x * this.hexRad * 1.5,
			p.y * halfHeight
		);
		this.focus = screen;
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
		c.fillStyle='#ffffff';
		c.rect(0,0,200,200);
		c.fill();
	}
	draw(){
		this.clear();
		this.map.draw();

		let c = this.context;
		c.beginPath()
		c.moveTo(0,0);
		c.lineTo(200,200);
		c.moveTo(200,0);
		c.lineTo(0,200);
		c.strokeStyle = '#eee';
		c.stroke();
	}
	moveFocus(p){
		this.map.moveFocus(p);
	}
}
