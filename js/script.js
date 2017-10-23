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
		this.dragging = false;
		this.dragElement = null;
		this.clone = null;
		this.downX = 0;
		this.downY = 0;
		this.leftOffset = 0;
		this.topOffset = 0;
		this.init();
	}
	Drag.prototype = {
		init: function(){
			var self = this;

			this.items.forEach(function(cur, index){
				if(self.dragSelector){
					var dragArea = self.getByClass(cur, self.dragSelector);
					self.addEvent(dragArea, dragEvents.START, function(event){
						self.dragStartHandler(event, cur);
					}, false);
				}else{
					self.addEvent(cur, dragEvents.START, function(event){
						self.dragStartHandler(event, cur);
					}, false);
				}
				
			});

			this.addEvent(document, dragEvents.MOVE, function(event){
				self.dragMoveHandler.call(self, event);
			}, false);
			this.addEvent(document, dragEvents.END, function(event){
				self.dragEndHandler.call(self, event);
			}, false);
		},
		dragStartHandler: function(event, cur){
			event.stopPropagation();
			this.touchDown = true;

			this.downX = event.clientX || event.changedTouches[0].clientX;
			this.downY = event.clientY || event.changedTouches[0].clientY;
			this.dragElement = cur;		
		},
		dragMoveHandler: function(event){
			if(!this.touchDown) return;

			var moveX = (event.clientX || event.changedTouches[0].clientX) - this.downX;
			var moveY = (event.clientY || event.changedTouches[0].clientY) - this.downY;
			
			if(this.dragging){
				event.stopPropagation();

				this.clone.style.left = this.leftOffset + moveX + "px";
				this.clone.style.top = this.topOffset + moveY + "px";

				this.shiftHoveredElement(this.clone, this.dragElement, this.items);
			}else{
				this.clone = this.cloneNode(this.dragElement);

				this.leftOffset = this.dragElement.offsetLeft - this.getStyle(this.dragElement, 'margin-left');
				this.topOffset = this.dragElement.offsetTop - this.getStyle(this.dragElement, 'margin-top');
				
				this.clone.style.left = this.leftOffset + "px";
				this.clone.style.top = this.topOffset + "px";
				this.dragElement.parentNode.appendChild(this.clone);

				this.dragElement.style.visibility = 'hidden';
				this.dragging = true;
			}
		},
		dragEndHandler: function(event){
			if(this.dragging){
				event.stopPropagation();
				this.dragging = false;
				this.clone.parentNode.removeChild(this.clone);
				this.dragElement.style.visibility = 'visible';
			}

			this.touchDown = false;
		},
		shiftHoveredElement: function(clone, dragElement, items){
			var hoveredElement = this.getHoveredElement(clone, dragElement, items);

			if(hoveredElement !== dragElement){
				var hoveredElementIndex = this.getIndex(items, hoveredElement);  //重合元素的索引值
				var dragElementIndex = this.getIndex(items, dragElement);        //被拖动元素的索引值
				// console.log(hoveredElementIndex);
				console.log(dragElementIndex);
				// if(hoveredElementIndex < dragElementIndex){
				// 	this.container.insertBefore(dragElement, hoveredElement);
				// }else{
				// 	this.container.insertBefore(dragElement, items[hoveredElementIndex+1]);
				// }
			}

			this.shifeElementPosition(items, dragElementIndex, hoveredElementIndex);
		},
		getHoveredElement: function(clone, dragElement, items){
			var cloneWidth = clone.offsetWidth,
				cloneHeight = clone.offsetHeight,
				cloneLeftPosition = clone.offsetLeft,
				cloneRightPosition = cloneLeftPosition + cloneWidth,
				cloneTopPosition = clone.offsetTop,
				cloneBottomPosition = cloneTopPosition + cloneHeight,
				currentElement,
				horizontalMidPosition,
				verticalMidPosition,
				overlappingX,
				overlappingY,
				inRange;

			for(var i = 0, len = items.length; i < len; i++){
				currentElement = items[i];

				if(currentElement === dragElement) continue;

				horizontalMidPosition = currentElement.offsetLeft + currentElement.offsetWidth * 0.5;
				verticalMidPosition = currentElement.offsetTop + currentElement.offsetHeight * 0.5;

				overlappingX = (horizontalMidPosition < cloneRightPosition) && (horizontalMidPosition > cloneLeftPosition);
				overlappingY = (verticalMidPosition < cloneBottomPosition) && (verticalMidPosition > cloneTopPosition);

				inRange = overlappingX && overlappingY;

				if(inRange){
					return currentElement;
				}
			}
		},
		shifeElementPosition: function(arr, fromIndex, toIndex){
			var temp = arr.splice(fromIndex, 1);
			arr.splice(toIndex, 0, temp);
		},
		getIndex: function(arr, item){
			for(var i = 0, len = arr.length; i < len; i++){
				if(arr[i] === item){
					return i;
				}
			}
			return -1;
		},
		getStyle: function(elem, attr){
			return parseInt(window.getComputedStyle(elem)[attr]);
		},
		cloneNode: function(elem){
			var res = elem.cloneNode(true);
			
			res.style.position = "absolute";
			res.style.width = elem.offsetWidth;
			res.style.height = elem.offsetHeight;
			res.style.zIndex = 10000;

			return res;
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

			return res.length === 1 ? res[0] : res;
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