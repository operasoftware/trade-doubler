var Categories = function(instance){
		var self = this;
		var links = document.getElementById('summary').getElementsByTagName('span');
		var cats = [];
		var all = null;
		var linksLength = links.length;
		var swap = [];
		for(var l = 0;l<linksLength;l++){
				if(links[l].getAttribute('data-id')==0){
						all = links[l];
						all.addEventListener('click',function(e){
								
								e.preventDefault();
								
								if(this.classList.contains('selected'))return;
								
								self.restore();
								
								this.classList.add('selected');
								
								self.save();
								self.update();								
						},false);
				} else {
						swap.push(links[l]);
						links[l].addEventListener('click',function(e){
								
								var select = !this.classList.contains('selected');
								
								self.restore();
										
								all.classList.remove('selected');
								
								if(select)this.classList.add('selected');
								else {
										this.classList.remove('selected');
										if(document.getElementById('summary').getElementsByClassName('selected').length==0)all.classList.add('selected');
								};
								
								
								if(document.getElementById('summary').getElementsByClassName('selected').length==linksLength)all.classList.add('selected');
								
								self.save();
								self.update();
								
								e.preventDefault();
								
						},false);
				};
		};
		
		links = swap;
		
		linksLength = links.length;
		var lastCategories = null;
		
		this.update = function(){
				
				if(lastCategories!=widget.preferences.categories.split(',').sort().join(',')&&FilteredList.update){
						lastCategories = widget.preferences.categories.split(',').sort().join(',');
						FilteredList.update();						
				};
		};
		this.restore = function(){
				
				if(widget.preferences.categories.length==0){
						for(var l = 0;l<linksLength;l++)links[l].classList.remove('selected');
						all.classList.add('selected');
						input.textContent = all.textContent;
						cats = [];
						return;
				};
				
				cats = widget.preferences.categories.split(',');				
				var title = [];
				
				all.classList.remove('selected');
				
				for(var l = 0;l<linksLength;l++){
						if(cats.indexOf(links[l].getAttribute('data-id'))!=-1){
								title.push(links[l].textContent);
								links[l].classList.add('selected');
						} else links[l].classList.remove('selected');														
				};				
				
				input.textContent = title.join(', ');				
		};
		this.save = function(){
				
				if(all.classList.contains('selected')){
						widget.preferences.categories = '';
						this.restore();	
						return;
				};
				
				var c = [];
				
				for(var l = 0;l<linksLength;l++)if(links[l].classList.contains('selected'))c.push(links[l].getAttribute('data-id'));
				
				widget.preferences.categories = c.join(',');
				
				this.restore();				
		};
		
		this.getActiveCatsData = function(){				
				
				var cData = [];
				var lg = Data.data.length;
				
				if(cats.length==0)for(var i=0;i<lg;i++)cData.push(i);			
				else for(var i=0;i<lg;i++)if(cats.indexOf(String(Data.data[i].category))!=-1)cData.push(i);
				
				return cData;
		
				
		};
		
		var input = instance.getElementsByTagName('dd')[0];
		
		input.addEventListener('click',function(e){
				if(instance.classList.contains('open'))instance.classList.remove('open');
				else {
						self.restore();
						self.update();
						instance.classList.add('open');
				};
				
				e.preventDefault();
		},false);		
		
		this.restore();
		
};


var Data = function(url,onready){
		var self = this;
		this.data = null;
		this.rq = new XMLHttpRequest();
		var rq = this.rq;
		this.couponOfTheWeekIndex = -1;
		function parseData(products){
				var data = [];
				for(var i=0;i<products.length;i++){
						var fields = products[i].getElementsByTagName('fields')[0];
						var item = {
								id: parseInt(products[i].getElementsByTagName('TDProductId')[0].textContent),
								category: parseInt(products[i].getElementsByTagName('TDCategoryID')[0].textContent),
								logo: fields.getElementsByTagName('logo_bigger')[0].textContent || products[i].getElementsByTagName('programLogoPath')[0].textContent,
								brand: products[i].getElementsByTagName('name')[0].textContent,
								name: products[i].getElementsByTagName('shortDescription')[0].textContent,
								tag: products[i].getElementsByTagName('promoText')[0].textContent,
								description: products[i].getElementsByTagName('description')[0].textContent,
								ends: fields.getElementsByTagName('endDate')[0].textContent,
								isCoupon: fields.getElementsByTagName('couponcode')[0].textContent.length>0?true:false
						};
						
						if((item.name.length==0&&item.tag.length!=0)||item.name==item.tag){
								item.name = item.tag;
								item.tag = '';
						};
						item.ends = item.ends.substring(0,item.ends.indexOf(' '))+' r.';
						
						if(fields.getElementsByTagName('couponOfTheWeek').length>0&&fields.getElementsByTagName('couponOfTheWeek')[0].textContent=='true')self.couponOfTheWeekIndex = i;						

						data[i] = item;
						
				};
				return data;
		};
		
		rq.addEventListener('readystatechange',function(){
				if (rq.readyState==4 && rq.status==200){
						self.data = parseData(rq.responseXML.querySelectorAll('products product'));
						onready(self.data);
				};
		},false);
		
		rq.open('GET',url,true);
		rq.send();		
};
function getCoupon(href,rel){
		var Tabs = opera.extension.bgProcess.opera.extension.tabs;
		//var TabList = Tabs.getAll();
		var Current = Tabs.getSelected();
		//var index = TabList.indexOf(Tabs.getSelected());
						
						
		Tabs.create({url: href,focused: true});
						
		if(rel&&rel.length>0){					
				var x = window.outerWidth/2 - 300;
				var y = window.outerHeight/2 - 150;
				
				var coupon = window.open(rel,"coupon", "width=600,height=300,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no");
				coupon.moveTo(x<0?0:x,y<0?0:y);								
		};
}

var PromotedList = function(instance,data){
		var self = this;
		this.data = null;
		if(data.length==0||Data.couponOfTheWeekIndex==-1){
				instance.classList.add('empty');
				instance.classList.remove('loading');
				return;
		};
		this.data = data[Data.couponOfTheWeekIndex];
			
		this.fill(instance.getElementsByTagName('article')[0],this.data);
		
		instance.addEventListener('click',function(e){
				
				if(e.target.tagName.toLowerCase()=='a'&&e.target.parentNode.tagName.toLowerCase()=='footer'){
						e.preventDefault();
						getCoupon(e.target.href,e.target.rel);						
				};				
		},false);
		
		
		instance.classList.remove('loading');
		
};
var FilteredList = function(instance,data){
		var self = this;
		this.data = null;
		if(data.length==0){
				instance.classList.add('empty');
				instance.classList.remove('loading');
				return;
		};
		var tpl = instance.getElementsByTagName('article')[0];
		instance.removeChild(tpl);
		
		this.pagination = new Pagination(instance.getElementsByClassName('pagination')[0],function(){
				if(self.pagination.total<2)instance.classList.add('single');
				else instance.classList.remove('single');
				
				var from = (self.pagination.current-1)*5;
				var to = from+4;
				if(to>self.data.length-1)to = self.data.length-1;
				
				self.show(from,to);
		});
		
		this.update = function(){
				this.data = Categories.getActiveCatsData(data);
				
				if(this.data.length==0){
						instance.classList.add('empty');
						this.pagination.refresh(1,1);
				} else {
						instance.classList.remove('empty');
						this.pagination.refresh(1,Math.floor(this.data.length/5)+(this.data.length%5==0?0:1));
				};
		};
		
		this.show = function(from,to){
				instance.classList.add('loading');
				//remove items
				while(instance.getElementsByTagName('article').length>0)instance.removeChild(instance.getElementsByTagName('article')[0]);
				
				var insert = instance.getElementsByClassName('pagination')[0];
				for(var i=from;i<=to;i++){
						var section = tpl.cloneNode(true);
						
						this.fill(section,data[i])
						
						if(i==to)section.classList.add('last');
						instance.insertBefore(section,insert);
				};
				
				instance.classList.remove('loading');
		};
		
		this.update();
				
		instance.addEventListener('click',function(e){
				
				if(e.target.tagName.toLowerCase()=='a'&&e.target.parentNode.tagName.toLowerCase()=='footer'){
						e.preventDefault();
						getCoupon(e.target.href,e.target.rel);						
				};				
		},false);
		
		instance.classList.remove('loading');
};
FilteredList.prototype.fill = PromotedList.prototype.fill = function(section, data){
		section.getElementsByTagName('h1')[0].textContent = data.name;
		section.getElementsByTagName('h2')[0].textContent = data.tag;
		section.getElementsByTagName('p')[0].textContent = data.description;
		
		var maxW = parseInt(window.getComputedStyle(document.querySelector('.brand img')).maxWidth);
		var maxH = parseInt(window.getComputedStyle(document.querySelector('.brand img')).maxHeight);
		
		var img = section.getElementsByTagName('img')[0];
		img.style.opacity = 0;
		img.onload = function(){
				var ow = this.width;
				var oh = this.height;
				if(ow/oh>maxW/maxH){
						var w = ow>maxW?maxW:ow;
						this.style.width = w+'px';
						this.style.marginTop = parseInt(maxH*0.5-w*oh/ow*0.5)+'px';
				} else {
						var h = oh>maxH?maxH:oh;
						this.style.height = h+'px';
						this.style.marginTop = parseInt(maxH*0.5-h/2)+'px';
				};							
				this.style.opacity = 1;
		};
		img.src = data.logo;
		img.alt = data.brand;
		var link = section.getElementsByTagName('footer')[0].getElementsByTagName('a')[0];
		link.href = "http://centrumkuponow.com/?a=2136980&r=" + data.id;
		
		section.getElementsByTagName('dd')[0].textContent = data.ends;
		if(data.isCoupon){
				section.classList.add('coupon');
				link.textContent = 'Pobierz kupon';
				link.rel = "http://centrumkuponow.com/?a=2136980&c=" + data.id;
		};
}


var Pagination = function(instance,onChange){
		var tpl = {};
		tpl.next = instance.getElementsByClassName('next')[0];
		tpl.prev = instance.getElementsByClassName('prev')[0];
		tpl.sep = instance.getElementsByClassName('sep')[0];
		tpl.current = instance.getElementsByClassName('current')[0];
		tpl.page = instance.getElementsByClassName('page')[0];
		
		instance.removeChild(tpl.next);
		instance.removeChild(tpl.prev);
		instance.removeChild(tpl.sep);
		instance.removeChild(tpl.current);
		instance.removeChild(tpl.page);
		
		var self = this;
		
		this.total = 0;
		this.current = 0;		
		
		this.refresh = function(current,total){
				if(current<0)current = 0;
				else if(current>total)current = total;
				
				if(this.current!=current||this.total!=total){
						this.current = current;
						this.total = total;		
						
						this.build();
						onChange();
				};
		};
		
		this.build = function(){
				instance.innerHTML = '';
				
				if(this.total<2)return;//single
				
				
				var pages = ['prev'];
				for(var i=1;i<=this.total;i++)pages.push(i);
				pages.push('next');
				
				if(this.current==1)pages.shift();
				if(this.current==this.total)pages.pop();
				
				if(this.total==10&&this.current!=1&&this.current!=10){
						pages[this.current>5?2:8]='sep';
						pages.splice(this.current>5?3:9,1);
				} else if(this.total>10){
						var index = this.current==1?this.current:this.current+1;					
						if(index<6){
							pages.splice(8,pages.length-11);
							pages[pages.length-3] = 'sep';
						} else if(index>this.total-5){
							pages.splice(3,pages.length-11);
							pages[2] = 'sep';
						} else {
							pages[2] = 'sep';
							pages[pages.length-3] = 'sep';
							pages.splice(3,pages.length-6,this.current+2);
							pages.splice(3,0,this.current+1);
							pages.splice(3,0,this.current);
							pages.splice(3,0,this.current-1);
							pages.splice(3,0,this.current-2);
						};
				};
				
				
				
				for(var i=0;i<pages.length;i++)switch(pages[i]){
						case 'prev': instance.appendChild(tpl.prev.cloneNode(true));break;
						case 'next': instance.appendChild(tpl.next.cloneNode(true));break;
						case 'sep': instance.appendChild(tpl.sep.cloneNode(true));break;
						default: {
								var p = pages[i]==this.current?tpl.current.cloneNode(true):tpl.page.cloneNode(true);
								p.textContent = pages[i];
								instance.appendChild(p);
						}; break;
				};
				
		};
		
		instance.addEventListener('click',function(e){
				var link = e.target;
				
				if(link.tagName.toLowerCase()!='span'&&!link.classList.contains('current')&&!link.classList.contains('sep'))return;
				
				if(e.target.classList.contains('page'))self.refresh(parseInt(e.target.textContent),self.total);	
				else if(e.target.classList.contains('next'))self.refresh(self.current+1,self.total);
				else if(e.target.classList.contains('prev'))self.refresh(self.current-1,self.total);
				
				document.documentElement.scrollTop = 0;
				
				e.preventDefault();
		},false);
		
};


//initialize app
window.addEventListener("DOMContentLoaded",function(e){
		Categories = new Categories(document.getElementById('top'));
},false);

window.addEventListener("load",function(e){
		Data = new Data('http://centrumkuponow.com/feed?a=2136980&foo='+(new Date()).getTime(),function(data){		
				PromotedList = new PromotedList(document.getElementById('promoted'),data);				
				FilteredList = new FilteredList(document.getElementById('filtered'),data);
		});
},false);