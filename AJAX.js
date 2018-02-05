
"use strict";
Object.defineProperty(AJAX,'CALLBACK_POOLS',{
    /**
    * Names of pools of events.
    * @type Array
    */
    value:['servererror','clienterror','success'],
    writable:false
});
/**
 * Array of functions used to create XMLHttpRequest object.
 * @type Array
 */
AJAX.XMLHttpFactories = [
    function (){return new XMLHttpRequest();},
    function (){return new ActiveXObject("Microsoft.XMLHTTP");},
    function (){return new ActiveXObject("MSXML2.XMLHTTP.3.0");}
];
/**
 * A class that can be used to simplfy AJAX requests.
 * @version 0.0.4
 * @author Ibrahim BinAlshikh <ibinshikh@hotmail.com>
 * @constructor
 * @returns {AJAX}
 */
function AJAX(){
    /**
     * Request method.
     */
    this.method = 'GET';
    /**
     * The URL of AJAX request
     */
    this.url = '';
    /**
     * Any parameters to send with the request.
     */
    this.params = '';
    /**
     * Enable or disable AJAX. used to ristrict access.
     */
    this.enabled = true;
    /**
     * Server response after processing the request.
     */
    this.serverResponse = null;
    /**
     * A callback function to call in case of file upload is completed. 
     * Similar to onreadystatechange.
     * @returns {undefined}
     */
    this.onload = function(){};
    this.onprogress = function(e){
        if (e.lengthComputable) {
            var percentComplete = (e.loaded / e.total) * 100;
            console.info('Uploaded: '+percentComplete+'%');
        }
    };
    /**
     * A pool of functions to call in case of successful request.
     */
    this.onsuccesspool = [
        {
            'id':0,
            'call':true,
            'func':function(){
                console.info('AJAX: Success '+this.status);
            }
        }
    ];
    /**
     * A pool of functions to call in case of server error.
     */
    this.onservererrorpool = [
        {
            'id':0,
            'call':true,
            'func':function(){
                console.info('AJAX: Server Error '+this.status);
            }
        }
    ];
    /**
     * A pool of functions to call in case of client error.
     */
    this.onclienterrorpool = [
        {
            'id':0,
            'call':true,
            'func':function(){
                console.info('AJAX: Client Error '+this.status);
            }
        }
    ];
    this.onreadystatechange = function(){
        if(this.readyState === 0){
            console.info('AJAX: Ready State = 0 (UNSENT)');
        }
        else if(this.readyState === 1){
            console.info('AJAX: Ready State = 1 (OPENED)');
        }
        else if(this.readyState === 2){
            console.info('AJAX: Ready State = 2 (HEADERS_RECEIVED)');
        }
        else if(this.readyState === 3){
            console.info('AJAX: Ready State = 3 (LOADING)');
        }
        else if(this.readyState === 4 && this.status >= 200 && this.status < 300){
            console.info('AJAX: Ready State = 4 (DONE)');
            for(var i = 0 ; i < this.onsuccesspool.length ; i++){
                this.onsuccesspool[i].status = this.status;
                this.onsuccesspool[i].response = this.responseText;
                this.onsuccesspool[i].xmlResponse = this.responseXML;
                try{
                    this.onsuccesspool[i].jsonResponse = JSON.parse(this.responseText);
                }
                catch(e){
                    this.onsuccesspool[i].jsonResponse = null;
                }
                if(this.onsuccesspool[i].call === true){
                    this.onsuccesspool[i].func();
                }
            }
        }
        else if(this.readyState === 4 && this.status >= 400 && this.status < 500){
            console.info('AJAX: Ready State = 4 (DONE)');
            var o = {get response(){}};
            for(var i = 0 ; i < this.onclienterrorpool.length ; i++){
                this.onclienterrorpool[i].func.status = this.status;
                this.onclienterrorpool[i].func.response = this.responseText;
                this.onclienterrorpool[i].func.xmlResponse = this.responseXML;
                try{
                    this.onclienterrorpool[i].func.jsonResponse = JSON.parse(this.responseText);
                }
                catch(e){
                    this.onclienterrorpool[i].func.jsonResponse = null;
                }
                if(this.onclienterrorpool[i].call === true){
                    this.onclienterrorpool[i].func();
                }
            }
        }
        else if(this.readyState === 4 && this.status >= 300 && this.status < 400){
            console.info('AJAX: Ready State = 4 (DONE)');
            console.info('Redirect');
        }
        else if(this.readyState === 4 && this.status >= 500 && this.status < 600){
            console.info('AJAX: Ready State = 4 (DONE)');
            for(var i = 0 ; i < this.onservererrorpool.length ; i++){
                this.onservererrorpool[i].func.status = this.status;
                this.onservererrorpool[i].func.response = this.responseText;
                this.onservererrorpool[i].func.xmlResponse = this.responseXML;
                try{
                    this.onservererrorpool[i].func.jsonResponse = JSON.parse(this.responseText);
                }
                catch(e){
                    this.onservererrorpool[i].func.jsonResponse = null;
                }
                if(this.onservererrorpool[i].call === true){
                    this.onservererrorpool[i].func();
                }
            }
        }
        else if(this.readyState === 4){
            console.log('Status: '+this.status);
        }
    };
    /**
     * A factory function used to create XHR object for diffrent browsers.
     * @returns {Mixed} False in case of failure. Other than that, it will 
     * return XHR object that can be used to send AJAX.
     */
    function createXhr(){
        for(var i = 0 ; i < AJAX.XMLHttpFactories.length ; i++){
            try{
                return AJAX.XMLHttpFactories[i]();
            }
            catch(e){

            }
        }
        return false;
    };
    /**
     * A utility function used to show warning in the console about the existance 
     * of events pool.
     * @param {String} p_name The name of the pool.
     * @returns {undefined}
     */
    function noSuchPool(p_name){
        console.warn('No such bool: '+p_name);
        var pools = '';
        for(var x = 0 ; x < AJAX.CALLBACK_POOLS.length ; x++){
            if(x === AJAX.CALLBACK_POOLS.length - 1){
               pools += ' or '+ AJAX.CALLBACK_POOLS[x];
            }
            else{
                if(x === AJAX.CALLBACK_POOLS.length - 2){
                   pools += AJAX.CALLBACK_POOLS[x]; 
                }
                else{
                    pools += AJAX.CALLBACK_POOLS[x]+', ';
                }
            }
        }
        console.info('Pool name must be one of the following: '+pools);
    }
    
    /**
     * Sets the value of the property serverResponse. Do not call this function 
     * manually.
     * @param {String} response
     * @returns {undefined}
     */
    this.setResponse = function(response){
        this.serverResponse = response;
    };
    /**
     * Return the value of the property serverResponse. Call this function after 
     * any complete AJAX request to get response load in case there is a load.
     * @returns {String}
     */
    this.getServerResponse = function(){
        return this.serverResponse;
    };
    /**
     * Return a JSON representation of response payload in case it can be convirted 
     * into JSON object. Else, in case the payload cannot be convirted, it returns 
     * undefined.
     * @returns {Object|undefined}
     */
    this.responseAsJSON = function(){
        try{
            return JSON.parse(this.getServerResponse());
        }
        catch(e){
            console.warn('responseAsJSON: Unable to convirt server response to JSON object!');
        }
        return undefined;
    };
    /**
     * Append a function to the pool of functions that will be called in case of 
     * server error (code 5xx). 
     * @param {Function} callback A function to call on server error. If this 
     * @param {Boolean} call If true, the method will be called. Else if i i false,
     * the method will be not called.
     * parameter is not a function, a warning will be shown in the console.
     * @returns {undefined|Number} Returns an ID for the function. If not added, 
     * the method will return undefined.
     */
    this.setOnServerError = function(callback,call=true){
        if(typeof callback === 'function'){
            var id = this.onservererrorpool[this.onservererrorpool.length - 1]['id'] + 1; 
            this.onservererrorpool.push({'id':id,'call':call,'func':callback});
            return id;
        }
        else{
            console.warn('setOnServerError: Provided parameter is not a function.');
        }
    };
    /**
     * Removes a callback function from a specific pool given its ID.
     * @param {String} pool_name The name of the pool. It should be one of the 
     * values in the array AJAX.CALLBACK_POOLS.
     * @param {Number} id The ID of the callback function.
     * @returns {undefined}
     */
    this.removeCall = function(pool_name,id){
        if(pool_name !== undefined && pool_name !== null){
            if(typeof pool_name === 'string'){
                pool_name = pool_name.toLowerCase();
                if(AJAX.CALLBACK_POOLS.indexOf(pool_name) !== -1){
                    pool_name = 'on'+pool_name+'pool';
                    for(var x = 0 ; x < this[pool_name].length ; x++){
                        if(this[pool_name][x]['id'] === id){
                            return this[pool_name].pop(this[pool_name][x]);
                        }
                    }
                    console.warn('removeCall: No callback was found with ID = '+id+' in the pool \''+pool_name+'\'');
                }
                else{
                    noSuchPool(pool_name);
                }
            }
            else{
                console.warn('removeCall: Invalid pool name type. Pool name must be string.');
            }
        }
        else{
            noSuchPool(pool_name);
        }
    };
    /**
     * Disable all callback functions except the one that its ID is given.
     * @param {String} pool_name The name of the pool. It should be a value from 
     * the array AJAX.CALLBACK_POOLS.
     * @param {Number} id The ID of the function that was provided when the function 
     * was added to the pool. If the ID does not exist, All callbacks will be disabled.
     * @returns {undefined}
     */
    this.disableCallExcept = function(pool_name,id){
        if(pool_name !== undefined && pool_name !== null){
            if(typeof pool_name === 'string'){
                pool_name = pool_name.toLowerCase();
                if(AJAX.CALLBACK_POOLS.indexOf(pool_name) !== -1){
                    pool_name = 'on'+pool_name+'pool';
                    for(var x = 0 ; x < this[pool_name].length ; x++){
                        //first two IDs are reserved. do not disable.
                        if(this[pool_name][x]['id'] !== id && this[pool_name][x]['id'] > 1){
                            this[pool_name][x]['call'] = false;
                        }
                        else{
                            this[pool_name][x]['call'] = true;
                        }
                    }
                    return;
                }
                else{
                    noSuchPool(pool_name);
                }
            }
            else{
                console.warn('disableCallExcept: Invalid pool name type. Pool name must be string.');
            }
        }
        else{
            noSuchPool(pool_name);
        }
    },
    /**
     * Enable or disable a callback on specific pool.
     * @param {String} pool_name The name of the pool. It must be one of the 
     * values in the aray AJAX.CALLBACK_POOLS.
     * @param {Number} id The ID of the callback. It is given when the callback 
     * was added.
     * @param {Boolean} call If set to true, the function will be called. Else 
     * if it is set to false, it will be not called.
     * @returns {undefined}
     */
    this.setCallEnabled = function(pool_name,id,call=true){
        if(pool_name !== undefined && pool_name !== null){
            if(typeof pool_name === 'string'){
                pool_name = pool_name.toLowerCase();
                if(AJAX.CALLBACK_POOLS.indexOf(pool_name) !== -1){
                    pool_name = 'on'+pool_name+'pool';
                    for(var x = 0 ; x < this[pool_name].length ; x++){
                        if(this[pool_name][x]['id'] === id){
                            this[pool_name][x]['call'] = call;
                            return;
                        }
                    }
                    console.warn('setCallEnabled: No callback was found with ID = '+id+' in the pool \''+pool_name+'\'');
                }
                else{
                    noSuchPool(pool_name);
                }
            }
            else{
                console.warn('setCallEnabled: Invalid pool name type. Pool name must be string.');
            }
        }
        else{
            noSuchPool(pool_name);
        }
    };
    /**
     * Returns an object that contains the information of a callback function. 
     * @param {type} pool_name The name of the pool. It must be in the array 
     * AJAX.CALLBACK_POOLS.
     * @param {Number} id The ID of the callback.
     * @returns {Object|undefined} Returns an object that contains the 
     * information of the callback. If it is not found, or the pool name is invalid, 
     * the method will show a warning in the console and returns undefined.
     */
    this.getCallBack = function(pool_name='',id){
        if(pool_name !== undefined && pool_name !== null){
            if(typeof pool_name === 'string'){
                pool_name = pool_name.toLowerCase();
                if(AJAX.CALLBACK_POOLS.indexOf(pool_name) !== -1){
                    pool_name = 'on'+pool_name+'pool';
                    for(var x = 0 ; x < this[pool_name].length ; x++){
                        if(this[pool_name][x]['id'] === id){
                            return this[pool_name][x];
                        }
                    }
                    console.warn('getCallBack: No callback was found with ID = '+id+' in the pool \''+pool_name+'\'');
                }
                else{
                    noSuchPool(pool_name);
                }
            }
            else{
                console.warn('getCallBack: Invalid pool name type. Pool name must be string.');
            }
        }
        else{
            noSuchPool(pool_name);
        }
    };
    /**
     * Append a function to the pool of functions that will be called in case of 
     * client error (code 4xx). 
     * @param {Boolean} call If true, the method will be called. Else if i i false,
     * the method will be not called.
     * @param {Function} callback A function to call on client error. If this 
     * parameter is not a function, a warning will be shown in the console.
     * @returns {undefined|Number} Returns an ID for the function. If not added, 
     * the method will return undefined.
     */
    this.setOnClientError = function(callback,call=true){
        if(typeof callback === 'function'){
            var id = this.onclienterrorpool[this.onclienterrorpool.length - 1]['id'] + 1; 
            this.onclienterrorpool.push({'id':id,'call':call,'func':callback});
            return id;
        }
        else{
            console.warn('setOnClientError: Provided parameter is not a function.');
        }
    };
    /**
     * Append a function to the pool of functions that will be called in case of 
     * successfull request (code 2xx). 
     * @param {Boolean} call If true, the method will be called. Else if i i false,
     * the method will be not called.
     * @param {Function} callback A function to call on server error. If this 
     * parameter is not a function, a warning will be shown in the console.
     * @returns {undefined|Number} Returns an ID for the function. If not added, 
     * the method will return undefined.
     */
    this.setOnSuccess = function(callback,call=true){
        if(typeof callback === 'function'){
            var id = this.onsuccesspool[this.onsuccesspool.length - 1]['id'] + 1; 
            this.onsuccesspool.push({'id':id,'call':call,'func':callback});
            return id;
        }
        else{
            console.warn('setOnSuccess: Provided parameter is not a function.');
        }
    };
    /**
     * Sets the request method.
     * @param {String} method get, post or delete. If the request method is not 
     * supported, A warning will be shown in the console and default (GET) will 
     * be used.
     * @returns {undefined}
     */
    this.setReqMethod = function(method){
        if(method !== undefined && method !== null){
            method = method.toUpperCase();
            if(method === 'GET' || method === 'POST' || method === 'DELETE'){
                this.method = method;
            }
        }
        else{
            console.warn('setReqMethod: Null, undefined or unsupported method. GET is used.');
            this.method = 'GET';
        }
    };
    /**
     * Returns request method.
     * @returns {String}
     */
    this.getReqMethod = function(){
        return this.method;
    };
    /**
     * Sets AJAX request URL (or URI)
     * @param {String} url
     * @returns {undefined}
     */
    this.setURL = function(url){
        this.url = url;
    };
    /**
     * Returns request URL.
     * @returns {String}
     */
    this.getURL = function(){
        return this.url;
    };
    /**
     * Sets request payload that will be send with it.
     * @param {String} params
     * @returns {undefined}
     */
    this.setParams = function(params){
        this.params = params;
    };
    /**
     * Returns request payload.
     * @returns {String}
     */
    this.getParams = function(){
        return this.params;
    };
    /**
     * Send AJAX request to the server.
     * @returns {Boolean} True in case of the status of AJAX request is open. 
     * else, it will return false.
     */
    this.send = function(){
        if(this.isEnabled()){
            var method = this.getReqMethod();
            var params = this.getParams();
            var url = this.getURL();
            console.info('Ajax Params: '+params);
            console.info('Request Method: '+method);
            console.info('URL: '+url);
            this.xhr.onreadystatechange = this.onreadystatechange;
            this.xhr.onload = this.onload;
            this.xhr.onprogress = this.onprogress;
            this.xhr.onsuccesspool = this.onsuccesspool;
            this.xhr.onservererrorpool = this.onservererrorpool;
            this.xhr.onclienterrorpool = this.onclienterrorpool;
            if(method === 'GET' || method === 'DELETE'){
                if(params !== undefined && params !== null && params !== ''){
                    this.xhr.open(method,url+'?'+params);
                }
                else{
                    this.xhr.open(method,url);
                }
                this.xhr.send();
                return true;
            }
            else if(method === 'POST'){
                this.xhr.open(method,url);
                this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                this.xhr.send(params);
                return true;
            }
            else{
                console.error('send: Method not supported: '+method);
            }
        }
        else{
            console.warn('send: AJAX is disabled.');
        }
        return false;
    };
    /**
     * Checks if AJAX is enabled or not.
     * @returns {Boolean}
     */
    this.isEnabled = function(){
        return this.enabled;
    };
    /**
     * Enable or disable AJAX.
     * @param {Boolean} boolean True to enable AJAX. False to disable.
     * @returns {undefined}
     */
    this.setEnabled = function(boolean){
        if(boolean === true){
            this.enabled = true;
        }
        else{
            this.enabled = false;
        }
    };
    
    //configuration 
    /**
     * The XMLHttpRequest object that is used to send AJAX.
     */
    this.xhr = createXhr();
    if(this.xhr === false){
        console.error('AJAX: Unable to creeate xhr object! Browser does not support it.');
    }
    var instance = this;
    var a = function(){
        instance.setResponse(instance.xhr.responseText);
    };
    this.setOnSuccess(a);
    this.setOnServerError(a);
    this.setOnClientError(a);
}