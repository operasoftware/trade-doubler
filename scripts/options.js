//initialize app
window.addEventListener("load",function(e){
		var time = document.getElementById('intv');
		time.value = widget.preferences.time;
		time.addEventListener('change',function(e){
				widget.preferences.time = this.value;
				
		},false);
		
		
		
		var checkboxes = document.getElementsByClassName('row')[1].getElementsByTagName('input');
		var cl = checkboxes.length;
		
		function update(){
				var cats = widget.preferences.categories.split(',');
				
				if(widget.preferences.categories.length==0)for(var c = 0;c<cl;c++)checkboxes[c].checked = true;
				else for(var c = 0;c<cl;c++)checkboxes[c].checked = cats.indexOf(checkboxes[c].value)!=-1?true:false;
		};
		function save(){
				var cats = [];
				for(var c = 0;c<cl;c++)if(checkboxes[c].checked == true)cats.push(checkboxes[c].value);
				
				if(cats.length==cl)widget.preferences.categories = '';
				else widget.preferences.categories = cats.join(',');
		};
		
		for(var c = 0;c<cl;c++)checkboxes[c].addEventListener('change',function(){
				var checked = this.checked;
				
				update();
				
				this.checked = checked;
				
				save();
				
		},false);
		
		update();
		
		
},false);


