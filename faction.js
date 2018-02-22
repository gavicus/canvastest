Domains = {ground:0, air:1, sea:2};

Units = {
	types: {
		pod:{
			typeid: 'pod',
			domain: Domains.ground,
			speed:[1, 0],
			attack:[0,0],
			defense:[1,0],
			range:[0,0],
		},
		infantry:{
			typeid: 'infantry',
			domain: Domains.ground,
			speed:[1, 0.1],
			attack:[1,0.2],
			defense:[1,0.2],
			range:[1,0],
		},
		fighter:{
			typeid: 'fighter',
			domain: Domains.air,
			speed:[8, 0],
			attack:[1,0.2],
			defense:[1,0.2],
			range:[5,0],
		},
		cutter:{
			typeid: 'cutter',
			domain:Domains.sea,
			speed:[3,0],
			attack:[2,0.1],
			defense:[2,0.1],
			range:[1,0],
		},
	},
};

class Unit {
	constructor(typeData){
		this.typeid = typeData.typeid;
		this.domain = typeData.domain;
		this.speed = typeData.speed;
		this.attack = typeData.attack;
		this.defense = typeData.defense;
		this.xp = 0;
		this.damage = 0;
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
	getDomain(){
		let domain = Domains.ground;
		for(let u of this.units){
			if(u.domain > domain){ domain = u.domain; }
		}
		return domain;
	}
	getSpeed(tileDomain){
		let domain = this.getDomain();
	}
}

class Faction {
	constructor(){
		this.groups = [];
	}
	initNew(coord){
		let g;
		
		g = new Group(coord);
		g.addUnit(new Unit(Units.types.pod));
		this.groups.push(g);

		g = new Group(coord);
		g.addUnit(new Unit(Units.types.infantry));
		this.groups.push(g);

		g = new Group(coord);
		g.addUnit(new Unit(Units.types.fighter));
		this.groups.push(g);

		g = new Group(coord);
		g.addUnit(new Unit(Units.types.cutter));
		this.groups.push(g);
	}
}