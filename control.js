class Control {
	constructor(){
		this.view = new View();
		this.view.draw();
		this.mouseDown = false;
		this.mouseLast = null;
		this.initMouseEvents();
		this.animating = false; // to block input (but allow move of focus)
	}
	initMouseEvents(){
		$('#canvas').mousedown(function(event){
			control.mouseLast = new Point(event.offsetX, event.offsetY);
			control.mouseDown = true;
		});
		$('#canvas').mouseup(function(event){
			control.mouseDown = false;
		});
		$('#canvas').mouseleave(function(event){
			control.mouseDown = false;
		});
		$('#canvas').mousemove(function(event){
			let current = new Point(event.offsetX, event.offsetY);
			if(control.mouseDown){
				let delta = current.minus(control.mouseLast);
				control.mouseLast = current;
				control.view.moveFocus(delta);
				control.view.draw();
			}
			else{
				let changed = control.view.map.setHoveredTile(current);
				if(changed){ control.view.draw(); }
			}
		});
	}
}