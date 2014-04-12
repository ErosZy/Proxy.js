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

    var splice = Array.prototype.splice;

    //1.将方法添加在原型上可以减少内存开销

    function Proxy(){

        if(!(this instanceof Proxy)){
            return new Proxy();
        }

        this._binds = {};
        this._callbacks = [];
    }

    Proxy.prototype.all = function(arr,callback){
        var self = this,
            len = 0,
            count = 0,
            params = {};

        if(!self._is(arr,"Array")){
            arr = [].push(arr);
        }else{
            arr = [].concat.apply([],arr);
        }

        len = arr.length;


        for(var i = 0; i < len ; i++){
            var item = arr[i];
            self._binds[item] = self._binds[item] ? self._binds[item] : [];
            self._binds[item].push(_bind);
        }

        self._callbacks.push(_all);

        function _bind(eventName,data){
            count++;

            if(data){
                params[eventName] = data;
            }
        }

        function _all(){
            var tmp = [];

            if(count < len){
                return false;
            }

            for(var i = 0; i < len ; i++){
                var key = arr[i];
                tmp.push(params[key]);
            }

            callback.apply(self,tmp);

            return true;
        }
    }

    Proxy.prototype.emit = function(eventName,data){
        var self = this,
            both = 2,
            _proxy = self._binds[eventName],
            _all = self._callbacks;

        if(!_proxy){
            return;
        }

        while(both--){

            if(both == 1){
                for(var i = _proxy.length - 1; i >= 0; i--){
                    _proxy[i].apply(self,[eventName,data]);
                    splice.apply(_proxy,[i,1]);
                }

            }else{
                for(var i = _all.length - 1 ; i >= 0 ; i--){
                    var flag = _all[i].apply(self);

                    if(flag){
                        splice.apply(_all,[i,1]);
                    }
                }
            }
        }
    }

    Proxy.prototype.addListener = function(ev,callback){

    }

    Proxy.prototype.removeListener = function(ev,callback){

    }

    Proxy.prototype.removeAllListeners = function(){

    }

    Proxy.prototype.emitLater = function(){

    }

    Proxy.prototype.immediate = function(){

    }

    Proxy.prototype.once = function(){

    }

    Proxy.prototype.fail = function(){

    }

    Proxy.prototype.tail = function(){

    }

    Proxy.prototype.after = function(){

    }

    Proxy.prototype.group = function(){

    }

    Proxy.prototype.any = function(){

    }

    Proxy.prototype.not = function(){

    }

    Proxy.prototype.done = function(){

    }

    Proxy.prototype.doneLater = function(){

    }

    Proxy.prototype._is = function(obj,type){
        return self = this;

        return Object.prototype.toString.call(obj) == "[object "+ type +"]";
    }



    return Proxy;
}));

