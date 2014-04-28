/**
 * Created by mac on 14-4-11.
 */

(function(name,definition){

    var hasDefine = typeof define == "function",
        hasModuleExports = typeof module != "undefined" && module.exports;

    if(hasDefine){
        define("./"+name,definition);
    }else if(hasModuleExports){
        module.exports = definition();
    }else{
        this[name] = definition();
    }

}("Proxy",function(){
    var splice = Array.prototype.splice,
        indexOf = Array.prototype.indexOf,
        every = Array.prototype.every,
        later = typeof process != "undefined" ? process.nextTick : setTimeout;

    /**
     * 构造函数
     * @returns {Proxy}
     * @constructor
     */
    function Proxy(){

        if(!(this instanceof Proxy)){
            return new Proxy();
        }

        this._binds = {};
        this._callbacks = [];
    }

    /**
     * 注册事件
     * @param ev 事件名
     * @param callback 回调函数
     */
    Proxy.prototype._assign = function(arr,callback){
        var self = this,
            len = 0,
            count = 0,
            params = {},
            reg = /\s+/g,
            _fnStr = callback.toString();

        arr = self._makeArray(arr);

        len = arr.length;

        _fnStr = _fnStr.replace(reg,'');

        for(var i = 0; i < len ; i++){
            var item = arr[i];
            self._binds[item] = self._binds[item] ? self._binds[item] : [];
            self._binds[item].push({
                callback : callback,
                fnStr : _fnStr,
                proxy : arr,
                bind : _bind
            });
        }

        self._callbacks.push({
            fnStr : _fnStr,
            binds : arr,
            callback:_all
        });

        function _bind(eventName,data){
            count++;

            if(data){
                params[eventName] = data;
            }
        }

        function _all(eventName,data,index){
            var dataArr = [],
                all;

            if(count < len){
                return false;
            }

            all = self._callbacks[index];

            if(self._inArray(eventName,all.binds) == -1){
                return false;
            }

            for(var i = 0; i < len ; i++){
                var key = arr[i];
                dataArr.push(params[key]);
            }

            callback.apply(self,dataArr);
        }
    }

    /**
     * 添加事件
     * @param eventName
     * @param callback
     */
    Proxy.prototype.addListener = function(eventName,callback){
        var self = this;

        self._assign.apply(self,arguments);

        return self;
    }

    /**
     * 删除事件
     * @param eventName 事件名
     * @param callback 回调函数
     */
    Proxy.prototype.removeListener = function(eventName,callback){
        var self = this,
            len = arguments.length,
            fnStr,_binds,fn,item,_all;

        //删除所有回调事件
        if(!len){
            self._binds = {};
            self._callbacks = [];
        }else if(len < 2){
            //删除对应事件的所有回调
            _binds = self._binds[eventName];
            for(var i = 0 ,len = _binds.length; i < len; i++){
                fn = _binds[i].callback;
                self.removeListener(eventName,fn);
            }
        }else{
            //删除对应事件所有回调，并且找到对应的回调进行删除
            fnStr = callback.toString().replace(/\s+/g,'');

            _binds = self._binds[eventName];
            _all = self._callbacks;

            loop:for(var i = _binds.length - 1; i >= 0 ; i--){
                item = _binds[i];
                if(item.fnStr == fnStr){
                    splice.apply(_binds,[i,1]);
                    for(var j = _all.length - 1; j >= 0; j--){
                        if(_all[j].fnStr == fnStr &&
                            self._inArray(eventName,_all[j].binds) != -1
                          ){
                            splice.apply(_all,[j,1]);
                            continue loop;
                        }
                    }
                }
            }
        }

        return self;
    }

    /**
     * 删除对应事件的所有回调函数
     * @param eventName
     */
    Proxy.prototype.removeAllListeners = function(eventName){
        var self = this,
            len = arguments.length;

        if(!len){
            self.removeListener();
        }else{
            self.removeListener(eventName);
        }

        return self;
    }

    /**
     * 一次触发事件
     * @param arr
     * @param callback
     */
    Proxy.prototype.once = function(arr,callback){
        var self = this,
            fn;

        arr = self._makeArray(arr);

        fn = function(){
            callback.apply(self,arguments);

            for(var i = 0, len = arr.length ; i < len ; i++){
                self.removeListener(arr[i],fn);
            }

        };

        self._assign(arr,fn);

        return self;
    }

    /**
     * 触发对应的事件
     * @param eventName 触发的事件名
     * @param data 传入的参数
     */
    Proxy.prototype.emit = function(eventName,data){
        var self = this,
            both = 2,
            _proxy = self._binds[eventName] || [],
            _all = self._callbacks;

        while(both--){
            if(both){
                for(var i = _proxy.length - 1; i >= 0; i--){
                    _proxy[i].bind.apply(self,[eventName,data]);
                }
            }else{
                for(var i = _all.length - 1 ; i >= 0 ; i--){
                    _all[i].callback.apply(self,[eventName,data,i]);
                }
            }
        }

        return self;
    }

    /**
     * 延迟触发
     * @param eventName
     * @param data
     */
    Proxy.prototype.emitLater = function(eventName,data){
        var self = this;

        later(function(){
            self.emit(eventName,data);
        },0);

        return self;
    }

    /**
     * all函数，所有事件触发后才会被触发
     * @param ev 事件名
     * @param callback 回调函数
     */
    Proxy.prototype.all = function(arr,callback){
        var self = this,
            len = arguments.length;

        if(len < 2){
            return;
        }

        self.once(arr,callback);

        return self;
    }

    /**
     * 注册事件后立即触发
     * @param arr
     * @param callback
     */
    Proxy.prototype.immediate = function(arr){
        var self = this,
            len = arguments.length,
            item,callback,data;

        if(len < 3){
            data = [];
            callback = arguments[1];
        }else{
            data = self._makeArray(arguments[1]);
            callback = arguments[2];
        }

        arr = self._makeArray(arr);

        self.once(arr,callback);

        for(var i = 0 , len = arr.length ; i < len ; i++){
            item = arr[i];
            self.emit(arr[i],data[i]);
        }

        return self;
    }

    /**
     * 错误事件的封装
     * @param errHandler
     */
    Proxy.prototype.fail = function(callback){
        var self = this;

        self.once("error",function(err){
            self.removeAllListeners();
            callback.call(self,err);
        });

        return self;
    }

    /**
     * 整体触发一次后，之后每一项分别可以触发一次原有回调
     * @param arr
     * @param callback
     */
    Proxy.prototype.tail = function(arr,callback){
        var self = this;

        arr = self._makeArray(arr);

        self.once(arr,function(){

            callback.apply(self,arguments);

            for(var i = 0, len = arr.length; i < len;i++){
                (function(item){
                    later(function(){
                        self.once(item,callback);
                    },0);
                }(arr[i]))
            }
        })

        return self;
    }

    /**
     * 事件被触发times次后callback触发，触发一次
     * @param eventName
     * @param times
     * @param callback
     * @returns {Proxy}
     */
    Proxy.prototype.after = function(eventName,times,callback){
        var self = this,
            len = arguments.length,
            count = 0,
            dataArr = [],
            reg = /\s+/g,
            _binds = self._binds,
            _fnStr;

        if(len < 3 || !self._is(callback,"Function")){
            return self;
        }

        _fnStr = callback.toString().replace(reg,'');

        _binds[eventName] = _binds[eventName] ? _binds[eventName] : [];

        _binds[eventName].push({
            callback : callback,
            fnStr : _fnStr,
            bind : _bind
        });

        self._callbacks.push({
            fnStr : _fnStr,
            binds : [eventName],
            callback:_all
        });

        function _bind(eventName,data){
            count++;

            if(data){
                dataArr.push(data);
            }
        }

        function _all(eventName,data,index){
            var all;

            if(count < times){
                return false;
            }

            all = self._callbacks[index];

            if(self._inArray(eventName,all.binds) == -1){
                return false;
            }

            callback.call(self,dataArr);

            self.removeListener(eventName,callback);
        }

        return self;
    }

    /**
     * 注册事件中任一事件被触发，则触发回调
     * @param arr
     * @param callback
     * @returns {Proxy}
     */
    Proxy.prototype.any = function(arr,callback){
        var self = this,
            len = arguments.length,
            reg = /\s+/g,
            _fnStr;

        if(len < 2){
            return false;
        }

        arr = self._makeArray(arr);

        _fnStr = callback.toString().replace(reg,'');

        self._callbacks.push({
            fnStr : _fnStr,
            binds : arr,
            callback:_all
        });

        function _all(eventName,data,index){
            var all = self._callbacks[index];

            if(self._inArray(eventName,all.binds) == -1){
                return false;
            }

            callback.call(self,data);
            splice.apply(self._callbacks,[index,1]);
        }

        return self;
    }

    /**
     * 若不为注册的事件，那么就触发callback回调
     * @param arr
     * @param callback
     * @returns {Proxy}
     */
    Proxy.prototype.not = function(arr,callback){
        var self = this,
            len = arguments.length,
            reg = /\s+/g,
            _fnStr;

        if(len < 2){
            return false;
        }

        arr = self._makeArray(arr);

        _fnStr = callback.toString().replace(reg,'');

        self._callbacks.push({
            fnStr : _fnStr,
            binds : arr,
            callback:_all
        });

        function _all(eventName,data,index){
            var all = self._callbacks[index];

            if(self._inArray(eventName,all.binds) != -1){
                return false;
            }

            callback.call(self,data);
            splice.apply(self._callbacks,[index,1]);
        }

        return self;
    }

    /**
     * 工具函数，判断对象是否在数组中
     * @param item
     * @param arr
     * @returns {number}
     * @private
     */
    Proxy.prototype._inArray = function(item,arr){
        var self = this,
            index = -1;

        if([].indexOf){
            return indexOf.call(arr,item);
        }else{
            for(var i = 0, len = arr.length ; i < len ; i++){
                if(arr[i] == item){
                    index = i;
                    break;
                }
            }
        }

        return index;
    }

    /**
     * 工具函数，生成数据
     * @param arr
     * @returns {Array}
     * @private
     */
    Proxy.prototype._makeArray = function(arr){
        var self = this;

        if(!self._is(arr,"Array")){
            arr = [arr];
        }else{
            arr = [].concat.apply([],arr);
        }

        return arr;
    }


    Proxy.prototype._equal = function(a1,a2){
        var self = this;

        if(a1.length != a2.length){
            return false;
        }

        self._every(a1,function(item,index,arr){
            if(self._inArray(item,a2) != -1){
                return true;
            }else{
                return false;
            }
        });
    }


    Proxy.prototype._every = function(arr,fn){
        var self = this;

        arr = self._makeArray(arr);

        if(every){
            return every.call(arr,fn);
        }else{
            for(var i = 0,len = arr.length; i < len; i++){
                var flag = fn.call(self);
                if(!flag){
                    return false;
                }
            }

            return true;
        }
    }

    /**
     * 工具函数，进行类型判断
     * @param obj
     * @param type
     * @returns {boolean}
     * @private
     */
    Proxy.prototype._is = function(obj,type){
        return Object.prototype.toString.call(obj) == "[object "+ type +"]";
    }

    return Proxy;
}));

