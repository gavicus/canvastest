Units = {
	enums: {
		types: {ground:0, air:1, sea:2},
	},
	types: [
		pod: {
			speed:[1, 0],
			type:Units.enums.types.ground,
			attack:0,
			defense:1,
		},
		infantry: {
			speed:[1, 0.1],
			type:Units.enums.types.ground,
			attack:[1,0.2],
			defense:[1,0.2],
		},
	],
};

class Unit {
	constructor(typeData){
		this.type=typeData.type;
		this.speed = typeData.speed;
		this.attack = typeData.attack;
		this.defense = typeData.defense;
		this.xp = 0;
	}
	computeStat(stat){
		return stat[0] + Math.floor(stat * this.getLevel());
	}
	getLevel(){
		return Math.floor(this.xp/10);
	}
	getSpeed(){ return this.computeStat(this.speed); }
	getAttack(){ return this.computeStat(this.attack); }
	getDefense(){ return this.computeStat(this.defense); }
}

class Group {
	constructor(coord){
		this.units = [];
		this.coord = coord.copy();
	}
	addUnit(u){ this.units.push(u); }
	getType(){
		let t = Units.enums.types;
		let type = t.ground;
		for(let u of this.units){
			if(u.type > type){ type = u.type; }
		}
		return type;
	}
	getSpeed(domain){
		let type = this.getType();
	}
}

class Faction {
	constructor(){
		this.groups = [];
	}
	initNew(coord){
		let g = new Group(coord);
		g.addUnit(new Unit(Units.types.pod));
		this.groups.push(g);
		g = new Group(coord);
		g.addUnit(new Unit(Units.types.infantry));
		this.groups.push(g);
	}
}