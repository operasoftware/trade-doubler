/* by Scott Andrew (http://www.scottandrew.com/) */
var Cookies = {
    create: function(name, value, days) {
        if (days) {
          var date = new Date();
          date.setTime(date.getTime()+(days*24*60*60*1000));
          var expires = "; expires="+date.toGMTString();
        } else expires = "";
        
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    read: function(name, value, days) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) == 0) 
              return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    erase: function(name, value, days) {
        cookies.create(name,"",-1);
    }
};

//Images loader
var ImageStorage = function (){
		var toLoad = [];
		var images = {};
		var listeners = [];
		var ready = false;
		
		var loadNext = function(){
				if(toLoad.length>0){
						var name = toLoad.shift();
						var src = images[name]
						images[name] = new Image();
						images[name].onload = function(){
								loadNext();
						};
						images[name].src = src;
				}	else {
						ready = true;
						for(var i=0;i<listeners.length;i++)listeners[i]();
						listeners = [];		
				};
		};
		window.addEventListener("load",function(){
				loadNext();
		},false);
		
		return {
				add: function(name,src){
						if(arguments.length==1){
								src = name;
								name = src.substring(src.lastIndexOf('/')+1,src.lastIndexOf('.')!=-1?src.lastIndexOf('.'):src.length);
						};
						
						toLoad.push(name);
						images[name] = src;
						if(ready){
								ready = false;
								loadNext();
						};
				},
				get: function(name){
						return images[name];						
				},
				addLoadedListener: function(fn){
						listeners.push(fn);
				}
		};		
}();