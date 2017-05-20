function vue(oop) {
	var node = document.querySelector(oop.el);
	var data = oop.data;
	var vueArr = ['s-text', 's-show', 's-if', 's-model', 's-mustache'];//指令存储数组

	this.cache = [];

	this.addQuene = function(nodes) {
		var that = this;
		if (nodes.nodeType == 1) {
			this.cache.push(nodes);
			if (nodes.hasChildNodes()) {
				nodes.childNodes.forEach(function(item) {
					that.addQuene(item);	//递归实现所有的节点复制
				});
			}
		}
	};

	this.compile = function(dom) {
		this.addQuene(dom);
	};

	this.pasers = function() {
		//console.log(this.cache[1]);
		var that = this;
		this.cache = this.cache.map(function(node) {
			var temp = {node: node};
			//console.log(node.getAttribute('s-if'));
			vueArr.forEach(function(attr) {
				if (node.getAttribute(attr)) {
					temp[attr] = node.getAttribute(attr);
				}
				if (node.getAttribute('s-model')) {
					node.addEventListener('input', change);	//监听input值，实现data的双向改变
				}

				function change() {
					data[node.getAttribute(attr)] = event.target.value;
				};
			});
			return temp;
		});


	};

	this.toChange = function(node, attr, content) {
		//console.log(node, attr, content);
		switch(attr) {

			case 's-text':
				node.innerHTML = content;
				break;

			case 's-show':
				if (content) {
					node.style.display = 'block';
				} else {
					node.style.display = 'none';
				}
				break;

			case 's-if':
				if (content) {
					if (!node) {
						node.insertBefore(node, node.nextSbling);
					}
				} else {
					node.parentNode.removeChild(node);
				}
				break;

			case 's-model':
				node.value = content;
				break;

		};
	};

	this.render = function() {
		//分别实现
		var that = this;
		this.cache.forEach(function(item) {
			vueArr.forEach(function(attr) {
				if (item[attr]) {
					that.toChange(item.node, attr, data[item[attr]]);
				}
			});
		});
	};

	this.watch = function(obj, callback) {
		this.$observeObj = function() {
			var that = this;
			this.callback = callback;
			//console.log(Object.keys(obj));
			Object.keys(obj).forEach(function(prop) {
				var val = obj[prop];
				Object.defineProperty(obj, prop, {
					get: function() {
						return val;
					},
					set: function(newVal) {
						var temp = val;
						//console.log(newVal);
						val = newVal;
						//通知所有订阅者改变
						that.cache.forEach(function(item) {
							if (item[prop]) {
								item[prop] = newVal;
							}
						});
						that.callback();
					},
					enumerable: true,
    				configurable: true
				});
			});
		}

		this.$observeObj();
	};

	this.observe = function() {
		this.watch(data, this.render);
	};

	this.init = function() {
		this.compile(node);
		//console.log(this.cache);
		this.pasers();
		//console.log(this.cache);
		this.observe();
		this.render();
	};

	this.init();
}