var domLoaded = false;

var Data = function(url){
		var self = this;
		this.loaded = false;
		
		this.data = null;
		this.rq = new XMLHttpRequest();
		var rq = this.rq;
		function parseData(products){
				var data = [];
				for(var i=0;i<products.length;i++){
						var item = {
								id: parseInt(products[i].getElementsByTagName('TDProductId')[0].textContent),
								category: parseInt(products[i].getElementsByTagName('TDCategoryID')[0].textContent),
								logo: products[i].getElementsByTagName('fields')[0].getElementsByTagName('logo_bigger')[0].textContent || products[i].getElementsByTagName('programLogoPath')[0].textContent,
								brand: products[i].getElementsByTagName('name')[0].textContent,
								name: products[i].getElementsByTagName('shortDescription')[0].textContent,
								tag: products[i].getElementsByTagName('promoText')[0].textContent,
								description: products[i].getElementsByTagName('description')[0].textContent
						};
						
						if((item.name.length==0&&item.tag.length!=0)||item.name==item.tag){
								item.name = item.tag;
								item.tag = '';
						};
						data[i] = item;
				};
				
				return data;
		};
		
		var cData = null;
		var categories = '';
		var updateList = function(){
				var cats = widget.preferences.categories.split(',').sort();
				
				if(categories==('|'+cats.join('|')+'|'))return;
				
				cData = [];
				
				if(widget.preferences.categories.length==0){
						
						for(var i=0;i<self.data.length;i++)cData.push(i);

						return;	
				};
						
				categories = '|'+cats.join('|')+'|';
				
				for(var i=0;i<self.data.length;i++)if(cats.indexOf(String(self.data[i].category))!=-1)cData.push(i);				
		};
		this.length = function(){
				return cData.length;	
		};
		this.getNext = function(index){
				updateList();
				
				if(cData.length==0)return -1;
				
				if(index<0)return cData[0];
				
				var item = cData.indexOf(index);
				
				if(item==-1)for(var i=0;i<cData.length;i++)if(index<cData[i]){
						item = i;
						break;
				};
				
				return item+1==cData.length?-1:cData[item+1];
		};
		
		rq.addEventListener('readystatechange',function(){
				if (rq.readyState==4 && rq.status==200){
						self.data = parseData(rq.responseXML.querySelectorAll('products product'));
						updateList();
						if(domLoaded&&(typeof Carousel == 'function'))Carousel = new Carousel();
				};
		},false);
		
		rq.open('GET',url,true);
		rq.send();
		
		
		
};

var Carousel = function(){
		
		var self = this;
		var lock = false;
		var current = -1;
		var elements = [document.getElementById('current'),document.getElementById('next')];
		
		this.fill = function(section,i,callback){
				section.classList.remove('empty');
				
				if(i==-1){
						section.classList.add('empty');
						current = -1;
						callback();
						return;
				};
				
				
				
				
				
				var maxW, maxH;
				
				if(window.outerWidth>249){
						maxW = parseInt(window.getComputedStyle(document.querySelector('#list section .logo img')).maxWidth);
						maxH = parseInt(window.getComputedStyle(document.querySelector('#list section .logo img')).maxHeight);
				} else {
						maxW = parseInt(window.outerWidth)-10;
						maxH = parseInt(window.outerHeight)-10;
				};
				
				var image = new Image();
				var img = section.getElementsByTagName('img')[0];
				if(window.outerWidth<340&&current!=-1){
						
						var src = Data.data[current].logo;
						
						while(Data.data[i].logo==src&&i!=current){
								i = Data.getNext(i);
						};
						
						if(Data.data[i].logo==src){
								section.classList.add('empty');
								current = -1;
								callback();
								return;
						};						
				};
				
				current = i;
				
				var data = Data.data[i];
				
				image.onload = function(){
						var ow = this.width;
						var oh = this.height;
						
						img.setAttribute('data-width',ow);
						img.setAttribute('data-height',oh);
						
						if(ow/oh>maxW/maxH){
								var w = ow>maxW?maxW:ow;
								img.style.width = w+'px';
								img.style.height = 'auto';
								img.style.marginTop = parseInt((maxH-w*oh/ow)*0.5)+'px';
						} else {
								var h = oh>maxH?maxH:oh;
								img.style.height = h+'px';
								img.style.width = 'auto';
								img.style.marginTop = parseInt((maxH-h)*0.5)+'px';
						};
						
						callback();
				};
				image.src = data.logo;
				img.src = data.logo;
				img.alt = data.brand;
		
				section.getElementsByClassName('promoName')[0].textContent = data.name;
				section.getElementsByTagName('h2')[0].textContent = data.tag;
				section.getElementsByTagName('p')[0].textContent = data.description;
				
		};
		elements[0].style.left = 0;
		
		var intv = null;
		
		var loadedIntv = null;
		var rotateMove = function(){
				if(loadedIntv==null)return;
						
				clearTimeout(loadedIntv);
				loadedIntv = null;		
				
				intv = setTimeout(function(){
						self.rotate();
				},widget.preferences.time*1000);
				
				if(elements[0].classList.contains('empty')&&elements[1].classList.contains('empty')){
						lock = false;
						return;
				};
				
				
				if(parseInt(elements[0].style.left)==0){
						elements[1].style.left = 0;
						elements[0].style.left = '-150%';
				} else {
						elements[0].style.left = 0;
						elements[1].style.left = '-150%';
				};
				
				setTimeout(function(){
						
						var next = elements[parseInt(elements[0].style.left) == 0?1:0];
						
						next.style.OTransitionProperty = 'none';						
						next.style.left = '150%';
						
						setTimeout(function(){
								next.style.OTransitionProperty = 'left';
								lock = false;								
						},100);
						
				},500);			
				
		};
		this.rotate = function(){
				if(lock)return;
				lock = true;
						
				if(intv!=null){
						clearTimeout(intv);
						intv = null;
				};
				
				loadedIntv = setTimeout(function(){
						clearTimeout(loadedIntv);
						loadedIntv = null;
						
						lock = false;
						
						intv = setTimeout(function(){
								self.rotate();
						},widget.preferences.time*1000);						
						
				},10000);
				self.fill(elements[parseInt(elements[0].style.left)==0?1:0],Data.getNext(current),rotateMove);				
		};
		
		intv = setTimeout(function(){
				self.rotate();
		},600);
};
Data = new Data('http://centrumkuponow.com/feed?a=2136980&foo='+(new Date()).getTime());
opera.contexts.speeddial.url = 'list.html';

//initialize app
window.addEventListener("load",function(e){
		domLoaded = true;
		if(Data.data!=null&&typeof Carousel == 'function')Carousel = new Carousel();    
},false);
window.addEventListener('resize',function(e){
		var maxW, maxH;
		
		if(window.outerWidth>249){
				maxW = parseInt(window.getComputedStyle(document.querySelector('#list section .logo img')).maxWidth);
				maxH = parseInt(window.getComputedStyle(document.querySelector('#list section .logo img')).maxHeight);
		} else {
				maxW = parseInt(window.outerWidth)-10;
				maxH = parseInt(window.outerHeight)-10;
		};
		
		var img = document.getElementsByTagName('img');
		
		for(var i=0;i<img.length;i++)if(img[i].getAttribute('data-width')!=undefined&&img[i].getAttribute('data-height')!=undefined){
		
				var ow = parseInt(img[i].getAttribute('data-width'));
				var oh = parseInt(img[i].getAttribute('data-height'));
				
				if(ow/oh>maxW/maxH){
						var w = ow>maxW?maxW:ow;
						img[i].style.width = w+'px';
						img[i].style.height = 'auto';
						img[i].style.marginTop = parseInt((maxH-w*oh/ow)*0.5)+'px';
				} else {
						var h = oh>maxH?maxH:oh;
						img[i].style.height = h+'px';
						img[i].style.width = 'auto';
						img[i].style.marginTop = parseInt((maxH-h)*0.5)+'px';
				};		
		};		
},false);

