class Point {
	constructor(px,py){
		this.x = px;
		this.y = py;
	}
	copy(){ // returns a new Point
		return new Point(this.x, this.y);
	}
	getDistanceSquared(p){
		return Math.pow(this.x-p.x, 2) + Math.pow(this.y-p.y, 2);
	}
	equals(p){
		return p.x === this.x && p.y === this.y;
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
		this.screen = null;
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
		this.hoveredTile = null;
		this.clickedTile = null;
	}
	click(){
		this.clickedTile = this.hoveredTile;
	}
	draw(){
		let c = this.context;
		for(let i=0; i<this.tiles.length; ++i){
			c.save();
			let tile = this.tiles[i];

			let position = this.getDrawLocation(tile.location);

			c.translate(position.x, position.y);
			this.drawHex(tile);
			tile.screen = position;
			c.restore();
		}
		this.drawHoveredHex();
		this.drawClickedHex();
	}
	traceHex(){
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

	}
	drawHex(tile, options){
		let c = this.context;
		
		this.traceHex();

		if(tile.type===1){
			if(options && options.fillStyle){ c.fillStyle = options.fillStyle; }
			else{ c.fillStyle='#eee'; }
			c.fill();
		}

		c.strokeStyle = '#eee';
		c.stroke();
	}
	drawHoveredHex(){
		let h = this.hoveredTile;
		if(!h){ return; }
		let position = this.getDrawLocation(h.location);
		let c = this.context;
		c.save();
		c.translate(position.x, position.y);

		this.traceHex();
		c.strokeStyle = 'gray';
		c.stroke();

		c.restore();
	}
	drawClickedHex(){
		let h = this.clickedTile;
		if(!h){ return; }
		let position = this.getDrawLocation(h.location);
		let c = this.context;
		c.save();
		c.translate(position.x, position.y);
		c.beginPath();
		c.arc(0,0, this.hexRad, 0, Math.PI*2);
		c.strokeStyle = 'red';
		c.stroke();

		c.restore();
	}
	generateMap(w,h){
		this.generateBlankMap(w,h);
		this.generateContourMap();
	}
	generateBlankMap(w,h){
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
	generateContourMap(){
		let getRing = function(tile,tiles,distance){ // returns Point[]
			let ring = [];
			if(distance === 0){ return [tile.location]; }
			let p = tile.location;
			for(let i=0; i<distance; ++i){
				ring.push( new Point(p.x + i, p.y - distance*2 + i) ); // n
				ring.push( new Point(p.x+distance, p.y-distance + i*2) ); // ne
				ring.push( new Point(p.x+distance - i, p.y+distance + i) ); // se
				ring.push( new Point(p.x - i, p.y+distance*2 - i) ); // s
				ring.push( new Point(p.x-distance, p.y+distance - i*2) ); // sw
				ring.push( new Point(p.x-distance + i, p.y-distance - i) ); // nw
			}
			return ring;
		}
		let ring = getRing(this.tiles[0], this.tiles, 3);
		for(let p of ring){
			if(p.x > this.mapColumns){ p.x -= this.mapColumns; }
			else if(p.x < 0){ p.x += this.mapColumns; }
			let tile = this.getTileAtCoords(p);
			if(tile){ tile.type = 1; }
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
	getDrawLocation(coord){
		let position = this.getCoordScreetPosition(coord);
		let mapWidth = this.getMapWidth();
		if(position.x < -this.hexRad){ position.x += mapWidth; }
		else if(position.x > mapWidth){ position.x -= mapWidth; }
		return position;
	}
	getTileAtCoords(p){
		for(let tile of this.tiles){
			if(tile.location.equals(p)){ return tile; }
		}
	}
	getTileFromHover(p){
		let result = null;
		let minDist = Math.pow(this.hexRad,2);
		let dist = 0;
		for(let tile of this.tiles){
			let d = p.getDistanceSquared(tile.screen);
			if(d < minDist && (!result || d < dist)){
				result = tile;
				dist = d;
			}
		}
		return result;
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
	setHoveredTile(p){
		let h = this.getTileFromHover(p);
		if(h === this.hoveredTile){ return false; }
		this.hoveredTile = h;
		return true;
	}
}
