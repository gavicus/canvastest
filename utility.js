utility = {
	randomInt: function(min, max){
		return Math.floor(Math.random() * (max-min) ) + min;
	}
};

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
