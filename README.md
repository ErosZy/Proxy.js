Proxy.js
======

#1.简介
Proxy.js -- 简单的eventProxy异步转同步库


#2.兼容性

IE6+、Chrome、Firefox、Safari、Opera等浏览器

#3.使用

###3.1：创建对象
```
    var proxy = new Proxy(); // or var proxy = Proxy();
```

###3.2：API

####all:
```
	proxy.all([eventName...],function(evData1,evData2){
		//...
	})
```

####addListener:
```
	proxy.addListner(eventName,function(data){
		//..
	})
```

####removeListener:
```
	proxy.removeListener();
	
	proxy.removeListener(eventName);
	
	proxy.removeListener(eventName,function(data){
		//...
	})
```


####removeAllListeners:
```
	proxy.removeAllListeners(eventName);
	
	proxy.removeAllListener();
```

####once:
```
	proxy.once(eventName,function(data){
		//...
	})
```

####emit:
```
	proxy.emit(eventName,data);
```


####emitLater:
```
	proxy.emitLater(eventName,data);
```

####immediate:
```
	proxy.immediate(eventName,data);
```


####fail:
```
	proxy.fail(function(data){
		//...
	})
```

####tail:
```
	proxy.tail([eventName...],function(data){
		//...
	})
```

####after:
```
	proxy.after(eventName,times,function(data){
		//...
	})
```

####any:
```
	proxy.any([eventName..],function(data){
		//...
	})
```

####not:
```
	proxy.not([eventName..],function(data){
		//...
	})
```