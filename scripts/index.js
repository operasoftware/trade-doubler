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
								logo: products[i].getElementsByTagName('fields')[0].getElementsByTagName('logo_bigger')[0].textContent || products[i].getElementsByTagName('programLogoPath')[0].textContent,
								brand: products[i].getElementsByTagName('name')[0].textContent,
								name: products[i].getElementsByTagName('shortDescription')[0].textContent,
								tag: products[i].getElementsByTagName('promoText')[0].textContent,
								description: products[i].getElementsByTagName('description')[0].textContent
						};
						
						if((item.name.length==0&&item.tag.length!=0)||item.name==item.tag){
								item.name = item.tag;
								item.tag = '';
						}
						data.push(item);
				};
				console.log(products[0].getElementsByTagName('fields')[0].getElementsByTagName('logo_bigger')[0].textContent||products[i].getElementsByTagName('programLogoPath')[0].textContent);
				
				
				return data;
		};
		
		rq.addEventListener('readystatechange',function(){
				if (rq.readyState==4 && rq.status==200){
						self.data = parseData(rq.responseXML.querySelectorAll('products product'));
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
		this.fill = function(section,data){
				section.getElementsByTagName('img')[0].src = data.logo;
				section.getElementsByTagName('img')[0].alt = data.brand;
				section.getElementsByClassName('promoName')[0].textContent = data.name;
				section.getElementsByTagName('h2')[0].textContent = data.tag;
				section.getElementsByTagName('p')[0].textContent = data.description;
		};
		elements[0].style.left = 0;
		this.fill(elements[1],Data.data[0]);
		var intv = null;
		this.rotate = function(){
				if(lock)return;
				lock = true;
				current = (current+1)%Data.data.length;
				
				if(intv!=null){
						clearTimeout(intv);
						intv = null;
				}
				
				if(parseInt(elements[0].style.left)==0){
						elements[1].style.left = 0;
						elements[0].style.left = '-150%';
				} else {
						elements[0].style.left = 0;
						elements[1].style.left = '-150%';
				};
				
				
				setTimeout(function(){ 
						
						if(document.body.classList.contains('loading'))document.body.classList.remove('loading');
						
						var next = elements[parseInt(elements[0].style.left) == 0?1:0];
						
						next.style.OTransitionProperty = 'none';
						
						next.style.left = '150%';
						
						setTimeout(function(){
								lock = false;
								self.fill(next,Data.data[(current+1)%Data.data.length]);
								next.style.OTransitionProperty = 'left';
								
								intv = setTimeout(function(){
										self.rotate();
								},parseInt(widget.preferences.getItem('time'))*1000);
								
								
						},100);
						
				},500);
		};
		setTimeout(function(){
				self.rotate();
		},600);
		
		
};

Data = new Data('http://centrumkuponow.com/feed?a=2136980');
opera.contexts.speeddial.url = 'list.html';

//initialize app
window.addEventListener("load",function(e){
		domLoaded = true;
		if(Data.data!=null&&typeof Carousel == 'function')Carousel = new Carousel();    
},false);


