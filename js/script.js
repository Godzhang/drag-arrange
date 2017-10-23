(function(){
	var IS_TOUCH_DEVICE = ('ontouchstart' in document.documentElement);

	var dragEvents = (function(){
		if(IS_TOUCH_DEVICE){
			return {
				START: 'touchstart',
				MOVE: 'touchmove',
				END: 'touchend'
			}
		}else{
			return {
				START: 'mousedown',
				MOVE: 'mousemove',
				END: 'mouseup'
			}
		}
	})();

	var Drag = function(options){
		this.opt = Object.assign({}, options);
		this.container = this.opt.container;
		this.items = this.getByClass(this.container || document, this.opt.targetClass);
		this.dragSelector = this.opt.dragSelector;
		this.touchDown = false;
		this.dragElement = null;
		this.downX = 0;
		this.downY = 0;
	}
	Drag.prototype = {
		init: function(){
			var self = this;

			this.items.forEach(function(cur, index){
				if(self.dragSelector){
					var dragArea = self.getByClass(cur, self.dragSelector);
					self.addEvent(dragArea, dragEvents.START, self.dragStartHandler, false);
				}else{
					self.addEvent(cur, dragEvents.START, self.dragStartHandler, false);
				}
			});






		},
		dragStartHandler: function(event){
			event.stopPropagation();
			this.touchDown = true;

			this.downX = event.clientX || event.changedTouches[0].clientX;
			this.downY = event.clientY || event.changedTouches[0].clientY;
			
			
		},
		getByClass: function(container, className){
			var elems = container.getElementsByTagName('*'),
				reg = new RegExp("(^|\\s+)" + className + "(\\s+|$)"),
				res = [],
				elem;

			for(var i = 0, len = elems.length; i < len; i++){
				elem = elems[i];
				if(reg.test(elem.className)){
					res.push(elem);
				}
			}

			return res.length === 1 ? res[0] || res;
		},
		addEvent: function(elem, type, fn, bubble){
			if(document.addEventListener){
				elem.addEventListener(type, fn, bubble);
			}else if(document.attachEvent){
				elem.attachEvent('on' + type, function(){
					fn.call(elem);
				});
			}else{
				elem['on' + type] = fn;
			}
		}
	}










	window.Drag = Drag;
})();