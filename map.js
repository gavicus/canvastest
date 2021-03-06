class Tile {
	constructor(x,y){
		this.coord = new Point(x,y);
		this.type=0;
		this.screen = null;
		this.elevation = 0;
	}
	isLandTile(){
		return this.type > 0;
	}
}

class Map {
	constructor(context, width, height){
		this.context = context;
		this.screenWidth = width;
		this.screenHeight = height;
		this.hexRad = 10;
		this.tiles = [];
		this.mapColumns = 20;
		this.mapRows = 10;
		this.focus = new Point(0, this.mapRows/2);
		this.generateMap(this.mapColumns, this.mapRows);
		this.hoveredTile = null;
		this.clickedTile = null;
		this.colors = {
			hexLine: 'gray',
			water: '#40a4df',
		};
		this.factions = [];

		this.createFaction();
	}
	click(){
		this.clickedTile = this.hoveredTile;
		this.focusOnPoint(this.clickedTile.coord);
		console.log(this.clickedTile.coord.toString());
	}
	createFaction(){
		let f = new Faction();
		let tile = this.getRandomLandTile();
		f.initNew(tile.coord);
		this.factions.push(f);
	}
	draw(){
		let c = this.context;

		for(let i=0; i<this.tiles.length; ++i){
			c.save();
			let tile = this.tiles[i];

			let position = this.getDrawLocation(tile.coord);

			c.translate(position.x, position.y);
			this.drawHex(tile);
			tile.screen = position;
			c.restore();
		}

		for(let faction of this.factions){
			for(let group of faction.groups){
				let position = this.getDrawLocation(group.coord);
				c.save();
				c.strokeStyle = '#888'; // get stroke style from faction
				c.translate(position.x, position.y);
				this.drawGroup(group);
				c.restore();
			}
		}

		this.drawHoveredHex();
		this.drawClickedHex();
	}
	drawGroup(group){
		let c = this.context;
		let domain = group.getDomain();
		c.beginPath();
		if(domain === Domains.ground){
			let halfw = this.hexRad * 0.3;
			c.moveTo(-halfw, -halfw);
			c.lineTo(halfw, -halfw);
			c.lineTo(halfw, halfw);
			c.lineTo(-halfw, halfw);
		}
		else if(domain === Domains.air){
			let halfw = this.hexRad * 0.8;
			let theta = -Math.PI/2;
			c.moveTo(0, halfw*Math.sin(theta));
			theta += Math.PI * 2/3;
			c.lineTo(halfw*Math.cos(theta), halfw*Math.sin(theta));
			theta += Math.PI * 2/3;
			c.lineTo(halfw*Math.cos(theta), halfw*Math.sin(theta));
		}
		else if(domain === Domains.sea){
			let rad = this.hexRad * 0.7;
			c.arc(0,0,rad,0,2*Math.PI);
		}
		c.closePath();
		c.stroke();
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

		if(tile.type===0){ // water
			if(options && options.fillStyle){ c.fillStyle = options.fillStyle; }
			else{ c.fillStyle=this.colors.water; }
			c.fill();
		}

		c.strokeStyle = this.colors.hexLine;
		c.stroke();
	}
	drawHoveredHex(){
		let h = this.hoveredTile;
		if(!h){ return; }
		let position = this.getDrawLocation(h.coord);
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
		let position = this.getDrawLocation(h.coord);
		let c = this.context;
		c.save();
		c.translate(position.x, position.y);
		c.beginPath();
		c.arc(0,0, this.hexRad, 0, Math.PI*2);
		c.strokeStyle = 'red';
		c.stroke();

		c.restore();
	}
	generateMap(){
		this.generateBlankMap();
		this.generateContourMap();
	}
	generateBlankMap(){
		this.tiles = [];
		for(let x=0; x<this.mapColumns; ++x){
			for(let y=0; y<this.mapRows; ++y){
				let t = new Tile(x, (y*2)+x%2);
				this.tiles.push(t);
			}
		}
	}
	generateContourMap(){
		let getRing = function(tile,tiles,distance){ // returns Point[]
			let ring = [];
			if(distance === 0){ return [tile.coord]; }
			let p = tile.coord;
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
		let bomb = function(target, map){
			let height = utility.randomInt(-20,4);
			for(let dist = 0; dist<height; ++dist){
				let points = getRing(target, map.tiles, dist);
				for(let p of points){
					if(p.x >= map.mapColumns){ p.x -= map.mapColumns; }
					else if(p.x < 0){ p.x += map.mapColumns; }
					let tile = map.getTileAtCoords(p);
					if(tile){
						tile.elevation = height - dist;
					}
				}
			}
		}
		let bombCount = 150;
		for(let i=0; i<bombCount; ++i){
			let tile = this.tiles[utility.randomInt(0,this.tiles.length-1)];
			bomb(tile, this);
		}
		for(let tile of this.tiles){
			if(tile.elevation > 0){ tile.type = 1; }
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
	getRandomLandTile(){
		let tile = null;
		while(tile === null){
			let roll = utility.randomInt(0,this.tiles.length-1);
			let t = this.tiles[roll];
			if(t.isLandTile()){ tile = t; }
		}
		return tile;
	}
	getTileAtCoords(p){
		for(let tile of this.tiles){
			if(tile.coord.equals(p)){ return tile; }
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
