/*Version v3.0.developer*/

var log_trigger =false;
BlStatic = (function() {
    console.log("Hello from static.js for developers");

    var conf_token = "development";

    var conf_access_token_life = 2000;
    var conf_host = 'localhost:5000';


    var request = new XMLHttpRequest();
    var headers = request.getAllResponseHeaders().toLowerCase();
    var conf_ssl_header = request.getResponseHeader("x-forwarded-proto");

    var conf_protocol;
    if (conf_ssl_header !== null && conf_ssl_header.contains("https")) {
        conf_protocol = "https";
    } else {
        conf_protocol = "http";
    }

    if (conf_token.valueOf()==="development"){
        log_trigger =true;
    }


    console.log(headers);
    console.log(conf_protocol);

    var BlConstants = {
        PR: 'bl_',     //PREFIX
        IT: 'init',    //INIT
        TP: '!t',      //TYPE
        BT: '!br',     //BROWSERTOKEN
        D: '!d',       //DATA
        SID: '!sn',    //SEANCEID
        _SID: '!psn',  //PREVIOUS SEANCEID
        U: '!u',       //USER
        _U: '!pu',     //PREVIOUS USER
        H: '!h',       //HREF
        _H: '!ph',     //HREF
        GA: '!ga',     //GOOGLE ANALYTICS
        TM: '!tm',     //TIME PAGE
        STB_LS: 'stb_ls',  //LAST SEANCE
        STB_BR: 'stb_br',
        AT: 'AT'
    };

    var BlConfig = {
        ST_SIZE: 3072,
        TOKEN: conf_token,
        URLTOKEN: conf_protocol+'://'+conf_host+'/v3.0/token',
        URL: conf_protocol+'://'+conf_host+'/v3.0/event',
        URLBATCH: conf_protocol+'://'+conf_host+'/v3.0/batch',
        NONE: 'staticb-none',
        // ATL: conf_access_token_life - 10000,   //AccessToken Life
        ATL: conf_access_token_life,   //AccessToken Life
        SELECTOR:{
            '.mainpage ul.list-dropmenu, .mainpage-inner':  ['click','mousemove','contextmenu','mousedown','mouseup'],
            '.mainpage-inner input[type=text], .mainpage-inner input[type=checkbox], .mainpage-inner input[type=radio], .mainpage-inner input[type=hidden], .mainpage-inner select': ['change','paste','focus','keydown','copy','cut','input'],
            '.staticb, .staticb-form':  ['click','mousemove','contextmenu','mousedown','mouseup'],
            '.staticb-form input, .staticb-form textarea, .staticb-form select': ['change','paste','focus','keydown','copy','cut','input']
        }
    };

    var BlEvent = (function(){
        log("BlEvent");

        function extend(Child, Parent) {
            var F = function() { };
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.prototype.constructor = Child;
            Child.superclass = Parent.prototype;
        }

        var Handler = {

            __default__ : function() {
                log("f");
                this.process = function () {console.log('__default__')};
                this.asJson  = function () {console.log('__default__')};
                this.store   = function () {console.log('__default__')};
            },

            __abstract__ : function(){
                log("f");
                this.__data__ = {ts: new Date().getTime() - BlMain.get('id')};

                this.asJson = function(){
                    return BlMain.sleepObject(this.__data__);
                };

                this.setPath = function(target){
                    log("f");
                    if(!target) return;
                    if(target.getAttribute('name')){
                        return this.__data__.name = target.getAttribute('name');
                    }else if (target.getAttribute('id')) {
                        return this.__data__.id = target.getAttribute('id');
                    }else{
                        return this.__data__.path = BlEvent.getElementCSSPath(target);
                    }
                };

                this.setDataAttributes = function(target) {
                    log("f");
                    if(!target) return;
                    var dataset = target.dataset;
                    (dataset && dataset.stbName) ? this.__data__['data-name'] = dataset.stbName : null;
                    (dataset && dataset.stbSection) ? this.__data__['data-section'] = dataset.stbSection : null;
                };

                this.store = function(key) {
                    BlStorage.persist(this, key);
                    //   console.log(BlMain.wake(key), this.__data__);
                }
            },

            'click' : function(){
                log("click");
                Handler['click'].superclass.constructor();
                this.process = function(e){
                    var target = e.target;
                    this.setPath(target);
                    this.setDataAttributes(target);
                    this.__data__.button = e.which;
                    if (target && target.getAttribute("href")) {
                        this.__data__.href = target.getAttribute("href");
                    }
                };
            },

            'mousemove' :  function(){
                log("mousemove");
                Handler['mousemove'].superclass.constructor();
                this.process = function(e){
                    this.setPath(e.target);
                    this.setDataAttributes(e.target);
                    if (e.pageX)
                        this.__data__.x = e.pageX;
                    if (e.pageY)
                        this.__data__.y = e.pageY;
                    if(BlMain.__mousedown__)
                        this.__data__.button = BlMain.__mousedown__;
                };
            },

            'change' : function(){
                log("change");
                Handler['change'].superclass.constructor();
                this.process = function(e){
                    //different value from checkbox and text input
                    var target = this.setPath(e.target);
                    this.setDataAttributes(e.target);
                    if ("checkbox" === e.target.type){
                        this.__data__.value = (e.target.checked) ? e.target.value || true : false;
                    }else{
                        this.__data__.value = e.target.value;
                    }
                    //remove artifacts from 'input' event
                    if (BlMain.__input__ && BlMain.__input__[target]) {
                        delete(BlMain.__input__[target]);
                    }
                    //calculate typing speed and remove artifacts from this
                    if(BlMain.__speed__[target]){
                        var last = BlMain.__speed__[target].lastTimeStamp;
                        var first = BlMain.__speed__[target].firstTimeStamp;
                        var count = BlMain.__speed__[target].count;
                        delete(BlMain.__speed__[target]);

                        if (first === 0 || count === 0 || last === 0 || last === first){
                            this.__data__.speed = count;
                        }else{
                            this.__data__.speed = (count/(last-first)*1000).toFixed(3);
                        }
                    }
                };
            },

            'paste' : function(){
                log("paste");
                Handler['paste'].superclass.constructor();
                this.process = function(e){
                    this.setPath(e.target);
                    this.setDataAttributes(e.target);
                    this.__data__.text = e.clipboardData.getData('text/plain') || e.clipboardData.getData('Text');
                };
            },

            'copy' : function(){
                log("copy");
                Handler['copy'].superclass.constructor();
                this.process = function(e){
                    this.setPath(e.target);
                    this.setDataAttributes(e.target);
                    this.__data__.text = BlEvent.getSelectedText(e.target);
                };
            },

            'cut' : function(){
                log("cut");
                Handler['cut'].superclass.constructor();
                this.process = function(e){
                    this.setPath(e.target);
                    this.setDataAttributes(e.target);
                    this.__data__.text = BlEvent.getSelectedText(e.target);
                };
            },

            'input': function(){
                log("input");
                Handler['input'].superclass.constructor();
                this.process = function(e) {
                    this.setPath(e.target);
                    this.setDataAttributes(e.target);
                    this.__data__.value = e.target.value;
                };
            },

            'focus' : function(){
                log("focus");
                Handler['focus'].superclass.constructor();
                this.process = function(e){
                    var key = this.setPath(e.target);
                    this.setDataAttributes(e.target);
                    BlMain.resetSpeed(key);
                    BlMain.resetInput(key);
                };
            },

            'keydown' : function(){
                log("keydown");
                Handler['keydown'].superclass.constructor();
                this.process = function(e){
                    var key = BlEvent.__target__(e.target); //DANGER use only if not store data
                    if(key && BlMain.__speed__[key]){
                        BlMain.__speed__[key].lastTimeStamp = e.timestamp;
                        BlMain.__speed__[key].count += 1;
                        if (0 === BlMain.__speed__[key].firstTimeStamp) {
                            BlMain.__speed__[key].firstTimeStamp = e.timestamp;
                        }
                    }
                };
                this.store = function(key) {};
            },

            'mousedown' : function(){
                log("mousedown");
                Handler['mousedown'].superclass.constructor();
                this.process = function(e){
                    BlMain.__mousedown__ = e.which;
                };
                this.store = function(key) {};
            },

            'mouseup' : function(){
                log("mouseup");
                Handler['mouseup'].superclass.constructor();
                this.process = function(e){
                    BlMain.__mousedown__ = null;
                };
                this.store = function(key) {};
            }
        };

        for (var prop in Handler) {
            if (!Handler.hasOwnProperty(prop) || prop.indexOf('__') == 0 ) continue;
            extend(Handler[prop],Handler.__abstract__);
        }

        return {
            handler: function(e){
                e = BlEvent.getDOMEvent(e);
                var type = (e.type === 'contextmenu') ? 'click' : e.type;
                if (BlFilter.build(type).isAllow(e)) {
                    var event = BlEvent.build(type);
                    event.process(e);
                    event.store(BlMain.sleep(type));
                }
            },

            build: function (type) {
                return (Handler[type]) ? new Handler[type]() : new Handler.__default__();
            },

            addEvent: function (elem, type, handler) {
                log("add event");
                if (elem.addEventListener)
                    elem.addEventListener(type, handler, false);
                else if (elem.attachEvent)
                    elem.attachEvent("on" + type, handler);
            },

            removeEvent:function (elem, type, handler){
                log("remove event");
                if (elem.removeEventListener)
                    elem.removeEventListener(type,handler);
                else if (elem.detachEvent)
                    elem.detachEvent("on" + type, handler);
            },

            /**
             *  SET OR REMOVE EVENT HANDLER
             */
            toggle: function (map, attach) {
                log("toggle");
                for (var selector in map) {
                    var elem = document.querySelectorAll(selector);
                    if ("object" !== typeof elem) {
                        continue;
                    }
                    for (var i = 0; i < elem.length; i++) {
                        for (var j = 0; j < map[selector].length; j++) {
                            (attach === true)
                                ? BlEvent.addEvent(elem[i], map[selector][j], BlEvent.handler)
                                : BlEvent.removeEvent(elem[i], map[selector][j], BlEvent.handler);
                        }
                    }
                }
            },

            getDOMEvent: function (event) {
                log("get DOomEVENT");
                event = event || window.event;

                // preventDefault/stopPropagation for IE
                event.preventDefault = event.preventDefault || function () {
                    event.returnValue = false
                };
                event.stopPropagation = event.stopPropagation || function () {
                    event.cancelBubble = true
                };

                // target for IE
                if (!event.target) {
                    event.target = event.srcElement
                }

                // relatedTarget for IE
                if (!event.relatedTarget && event.fromElement) {
                    event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
                }

                // pageX/pageY for IE
                if (event.pageX == null && event.clientX != null) {
                    var html = document.documentElement, body = document.body;
                    event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
                    event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
                }

                // 1 == left; 2 == middle; 3 == right
                if (!event.which && event.button) {
                    event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
                }

                if (window.clipboardData){
                    event.clipboardData = window.clipboardData;
                }

                // timestamp
                event.timestamp = new Date().getTime();

                return event;
                log(event.toString());
            },

            getElementCSSPath: function(element){
                var paths = [];

                for (; element && element.nodeType == 1; element = element.parentNode){

                    var label = element.localName.toLowerCase();

                    if(label === 'body' || label === 'html')
                        break;

                    if (element.getAttribute('id')) {
                        label += "#" + element.getAttribute('id');
                        paths.splice(1, 1, label);
                        break;
                    }

                    if (element.classList && element.classList.length > 0)
                        label += "." + element.classList.item(0);

                    paths.splice(1, 1, label);
                }
                return paths.length ? paths.reverse().join(" ") : null;
            },

            getSelectedText: function(element){
                log("get selected text");

                var text = "";
                if(element){
                    try{
                        text = element.value.substring(element.selectionStart, element.selectionEnd);
                    }catch(e){
                        BlMain.error('getSelectedText', e);
                    }
                }
                return text;
            },

            hasClass:function(element,thatClass){
                return (" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf(thatClass) > -1
            },

            __target__: function (target) {
                return target.getAttribute('name') ? target.name : target.getAttribute('id') ? target.id : BlEvent.getElementCSSPath(target);
            }
        }
    })();

    var BlFilter = (function(){
        log("blFilter");

        var Filter = {
            error: {
                isAllow: function (e) {
                    return false;
                }
            },

            success: {
                isAllow: function(e){
                    return e.target && BlEvent.hasClass(e.target, BlConfig.NONE) === false;
                },
                events: 'click,contextmenu,change,beforeunload,unload,paste,copy,cut,focus,keydown,mousedown,mouseup'
            },

            'mousemove': {
                interval: 500,
                lts:0,
                isAllow: function(e){
                    if (e.target && BlEvent.hasClass(e.target, BlConfig.NONE) === false &&
                        e.timestamp - Filter['mousemove'].lts > Filter['mousemove'].interval)
                    {
                        Filter['mousemove'].lts = e.timestamp;
                        return true;
                    }
                    return false;
                }
            },

            'input': {
                interval: 400,
                delta: 3,
                isAllow:  function(e){
                    var key =  BlEvent.__target__(e.target);
                    var data = (BlMain.__input__[key]) ? BlMain.__input__[key] : {lts:0, value:''};
                    var value = (e.target) ? e.target.value : "";

                    if (e.target && BlEvent.hasClass(e.target, BlConfig.NONE) === false
                        && e.timestamp - data.lts > Filter['input'].interval
                        && ((value.length >= Filter['input'].delta
                                && Math.abs(value.length - data.value.length) >= Filter['input'].delta)
                            || (value.length === data.value.length && value !== data.value)
                            || (value.length > 0 && data.value === '')
                            || (!isNaN(value) && !isNaN(data.value) && value !== data.value)
                            || (!isNaN(parseFloat(value)) && !isNaN(parseFloat(data.value)) && value !== data.value)
                        )
                    )
                    {
                        BlMain.__input__[key] = {lts: e.timestamp, value:e.target.value};
                        return true;
                    }
                    return false;
                }
            }
        };

        return {
            build: function(type) {
                return (Filter[type]) ? Filter[type] : (Filter.success.events.indexOf(type) > -1) ? Filter.success : Filter.error;
            }
        }
    })();

    var BlNetwork = (function(){
        log("blNetwork");

        var CORSSender = {
            successHandler: function(response, handler){
                if("function" === typeof handler)
                    handler(response);
            },

            errorHandler: function(response, handler){
                if("function" === typeof handler)
                    handler(response);
            },

            send: function(url, data, onSuccess, onError, async){
                log_er("post");
                log(url, data, onSuccess, onError, async);

                data['method'] = 'POST';
                if (BlMain.__token__) {
                    data[BlConstants.AT] = BlMain.__token__.access;
                }
                if (!data[BlConstants.BT]) {
                    data[BlConstants.BT] = BlMain.get('browser');
                }

                var request = BlNetwork.getCORSRequest(data['method'], url, async);
                try {request.setRequestHeader("Content-type", "application/json");} catch (e){}

                if ('onreadystatechange' in request) {
                    request.onreadystatechange = function(){
                        if (request.readyState === 4) {
                            if (request.status >= 200 && request.status < 400) {
                                CORSSender.successHandler(request.responseText, onSuccess);
                            } else {
                                CORSSender.errorHandler(request.responseText,onError);
                            }
                        }
                    };
                } else {
                    request.onprogress = function(){};
                    request.ontimeout = function(){};
                    request.onload = function() {
                        CORSSender.successHandler(request.responseText, onSuccess);
                    };
                    request.onerror = function() {
                        CORSSender.errorHandler(request.responseText, onError);
                    };
                }

                delete(data['method']);

                request.send(JSON.stringify(data));
            }
        };

        var __sender__ = CORSSender;

        return {

            send: function(url, data, onSuccess, onError, async) {
                return __sender__.send(url, data, onSuccess, onError, async);
            },

            getCORSRequest: function (type, url, async) {
                log("getCORS");

                async = async !== false;
                var xhr = null;
                if ("undefined" !== typeof XMLHttpRequest) {
                    xhr = new XMLHttpRequest();
                    if ("withCredentials" in xhr) {
                        xhr.open(type, url, async);
                    } else if("undefined" !== typeof XDomainRequest) {
                        xhr = new XDomainRequest();
                        xhr.open(type, url);
                    } else {
                        xhr.open(type, url, async);
                    }
                } else if ("undefined" !== typeof XDomainRequest) {
                    xhr = new XDomainRequest();
                    xhr.open(type, url);
                }
                return xhr;
            }

        }
    })();

    var BlStorage = (function(){

        log("BLSTOrage");

        var __memory__ = {};

        var StorageLocal = {
            get: function(key) {
                return  window.localStorage.getItem(key);
            },
            set: function(key,value) {
                window.localStorage.setItem(key,value);
            },
            keys: function() {
                var result = [];
                for ( var i = 0; i < localStorage.length; ++i ) {
                    result.push(localStorage.key(i));
                }
                return result;
            },
            remove: function(key){
                window.localStorage.removeItem(key);
            },
            isEnabled: function(){
                // return false;
                try {
                    var test = "test message12345_)(*&^%$#|קראטוןםפשדגכעיחלךףזסבהנמצתץ";
                    window.localStorage.setItem(test,test);
                    var getTest = window.localStorage.getItem(test);
                    window.localStorage.removeItem(test);
                    return test === getTest;
                } catch (e) {
                    return false;
                }
            },

            isStrong: false
        };

        var StorageMemory = {
            get: function(key) {
                log("f");
                return __memory__[key] || null;
            },
            set: function(key, value) {
                log("f");
                __memory__[key] = value;
            },
            keys: function() {
                log("f");
                var result = [];
                for (var key in __memory__) {
                    if (__memory__.hasOwnProperty(key)) {
                        result.push(key);
                    }
                }
                return result;
            },
            remove: function(key) {
                delete __memory__[key];
            },
            isEnabled: function() {
                return true;
            },

            isStrong: true
        };

        var StorageCookies = {
            get: function(key) {
                log("f");
                return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
            },
            set: function(key, value) {
                log("f");
                if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) {
                    return false;
                }
                var expires = '; expires=Fri, 31 Dec 3000 23:59:59 GMT';
                var domain = "; domain=" + StorageCookies.__domain__;
                var path = "; path=/";

                document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) +  expires + domain + path;
                return true;
            },
            keys: function () {
                var keys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
                for (var i = 0; i < keys.length; i++) {
                    keys[i] = decodeURIComponent(keys[i]);
                }
                return keys;
            },
            remove: function (key) {
                var domain = "; domain=" + StorageCookies.__domain__;
                document.cookie = encodeURIComponent(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + domain;
                return true;
            },
            isEnabled: function () {
                try {
                    var test = "testמצתץ";
                    StorageCookies.set(test,test);
                    var getTest = StorageCookies.get(test);
                    StorageCookies.remove(test);
                    return test === getTest;
                } catch (e) {
                    return false;
                }
            },
            __domain__: (function() {
                try {
                    var cookie_key ='_temp_top_level_domain';
                    var parts = document.location.hostname.split('.');

                    for(var i = parts.length - 1; i >= 0; i--) {
                        var host = "." + parts.slice(i).join('.');
                        document.cookie = cookie_key + '=cookie;domain=' + host + ';';
                        if(document.cookie.indexOf(cookie_key) >= 0 && (parts.length - i) >= 2){
                            document.cookie = cookie_key + '=;domain=' + host + ';expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                            return host;
                        }
                    }
                } catch (e) {
                    return '';
                }
            })()
        };

        var __storage__ = StorageLocal.isEnabled() ? StorageLocal : StorageMemory;
        var __cookies__ = StorageCookies.isEnabled() ? StorageCookies : StorageMemory;

        return {

            persist: function(blEvent, key){
                var seance = BlMain.getSeance();
                try {
                    var event = (seance[key]) ? JSON.parse(seance[key]) : [];
                    event.push(blEvent.asJson());
                    seance[key] = JSON.stringify(event);
                    if (BlMain.checkInitTime()) {
                        if(BlStorage.isOverflow(seance[key])) {
                            BlStorage.push({event: {key: key, data: event}});
                            delete seance[key];
                        }
                        BlMain.setSeance(seance);
                    } else if (!BlStorage.isOverflow(seance[key], 3)) {
                        BlMain.setSeance(seance);
                    }
                } catch (e) {
                    BlMain.error("Storage persist", e);
                    delete seance[key];
                    BlMain.setSeance(seance);
                }
            },

            isOverflow: function(value, multiplier) {
                var size = encodeURIComponent(value).length;
                return (multiplier) ? size > (BlConfig.ST_SIZE * multiplier) : size > BlConfig.ST_SIZE;
            },

            push: function(params, success, error){
                params = params ? params : {};
                var async = params.async === false ? false : null;
                if (params.event) {
                    BlNetwork.send(
                        BlConfig.URL,
                        BlMain.setRequest(params.event.key, params.event.data),
                        success,
                        error,
                        async
                    );
                } else if (params.seance) {
                    BlNetwork.send(
                        BlConfig.URLBATCH,
                        params.seance,
                        success,
                        error,
                        async
                    );
                } else {
                    var keys = BlStorage.keys();
                    for(var i = 0; i < keys.length; i++) {
                        if (keys[i].indexOf(BlConstants.PR) == 0) {
                            try {
                                var seance = JSON.parse(BlStorage.get(keys[i]));
                                (function(key, seance) {
                                    BlNetwork.send(
                                        BlConfig.URLBATCH,
                                        seance,
                                        success,
                                        function (data) {
                                            try {
                                                BlStorage.set(key, JSON.stringify(seance));
                                            } catch(e) {
                                                BlMain.error('BlStorage.push', e);
                                            }
                                            if("function" === typeof error) {
                                                error(data);
                                            }
                                        },
                                        async
                                    );
                                }) (keys[i], seance);
                                BlStorage.remove(keys[i])
                            } catch(e) {
                                BlMain.error("Storage push", e);
                            }
                        }
                    }
                }
            },

            get: function(key){
                return __storage__.get(key);
            },

            set: function(key, value){
                return __storage__.set(key, value);
            },

            remove: function(key){
                return __storage__.remove(key);
            },

            keys: function(){
                return __storage__.keys();
            },

            isStrong: function(){
                return __storage__.isStrong;
            },

            cookies: function(){
                return __cookies__;
            },

            useMemoryStorage: function () {
                __storage__ = StorageMemory;
            }

        }
    })();

    var BlMain = (function(){
        log("BlMain");
        var raygunQuotas = 6,
            seance = {},
            options = {
                //user url browser id timeoutPushIndex intervalStrongPushIndex
                initData: {
                    locale: window.navigator.userLanguage || window.navigator.language,
                    timezone: new Date().getTimezoneOffset() / -60,
                    width: window.screen.width,
                    height: window.screen.height
                }
            };

        var migrate = function() {
            var last_session = BlStorage.cookies().get('!ls');
            if (last_session) {
                BlStorage.cookies().set(BlConstants.STB_LS, last_session);
                BlStorage.cookies().remove('!ls');
            }

            var browser = BlStorage.cookies().get('!br');
            if (browser) {
                BlStorage.cookies().set(BlConstants.STB_BR, browser);
                BlStorage.cookies().remove('!br');
            }

        };

        var generateSeanceId = function () {
            var time = new Date().getTime();
            while (BlStorage.get(BlConstants.PR + time) !== null || BlStorage.cookies().get(BlConstants.STB_LS) === time) {
                time += 1;
            }
            BlStorage.cookies().set(BlConstants.STB_LS, time);
            return time;
        };

        var previousSeanceId = function(id) {
            var keys = BlStorage.keys().sort();
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].indexOf(BlConstants.PR) == 0) {
                    var prevId = parseInt(keys[i].substring(3));
                    if (id > prevId && id - prevId > 1000) {
                        return BlMain.getSeance(prevId);
                    }
                }
            }
        };

        var generateBrowserToken = function() {
            var token = BlStorage.cookies().get(BlConstants.STB_BR);
            if (token == null) {
                token = BlStorage.get(BlConstants.BT);
                if (null != token) {
                    BlStorage.remove(BlConstants.BT);
                }
                var tokenTime = (token != null) ? BlMain.wake(token).split("|")[3] : null;
                if (!(/^\d+$/.test(tokenTime))){
                    token = BlMain.__token__.browser;
                }
                BlStorage.cookies().set(BlConstants.STB_BR, token);
            }
            return token;
        };

        var initTimeoutPush = function () {
            console.log("BlConfig.ATL ");
            console.log(BlConfig.ATL);

            // push all data after 70%
            options.timeoutPushIndex = window.setTimeout(function () {
                console.log(BlMain.checkInitTime());
                if(BlMain.checkInitTime()){
                    BlStorage.push();
                }
            },((BlConfig.ATL/100|0)*70));
            //update timepage
            options.intervalUpdateTimepage = window.setInterval(function() {
                var seance = BlMain.getSeance();
                seance[BlConstants.TM] = BlMain.sleep(new Date().getTime());
                BlMain.setSeance(seance);
            }, 1000);
        };

        var initStrongMode = function() {
            BlConfig.ST_SIZE = 2048;
            BlEvent.addEvent(window, 'unload', function(){
                BlStorage.push({async: false});
            });
            options.intervalStrongPushIndex = window.setInterval(function () {
                console.log(BlMain.checkInitTime());
                if(BlMain.checkInitTime()) {
                    BlStorage.push();
                }
            }, 15000);
        };

        var start = function(params){
            //set options
            if (params && params.user) {
                options.user = params.user;
            }
            options.url = window.location.href;
            options.browser = generateBrowserToken();
            options.id = generateSeanceId();
            options.referrer = document.referrer;
            try {
                if ("undefined" !== typeof ga) {
                    options.ga = ga.getAll()[0].get('clientId')
                } else {
                    var _ga = BlStorage.cookies().get("_ga").split(".");
                    if (_ga[2] && _ga[3]) {
                        options.ga = _ga[2] + "." + _ga[3];
                    }
                }
            } catch(e) {
            }
            var prevSeance = previousSeanceId(options.id);
            if (prevSeance) {
                options.pid = prevSeance[BlConstants.SID];
                options.puser = prevSeance[BlConstants.U];
            }

            //push old data. Only after generateBrowserToken
            BlStorage.push();
            // set and store current seance
            seance[BlConstants.SID] =  BlMain.sleep(options.id);
            seance[BlConstants.U] =  BlMain.sleep(options.user);
            seance[BlConstants.H] = BlMain.sleep(options.url);
            seance[BlConstants.BT] = options.browser;

            BlMain.setSeance(seance);
            //Set global variables
            BlMain.__speed__ = {};
            BlMain.__input__ = {};
            BlMain.__mousedown__ = null;
            //push new seance
            BlStorage.push(
                {event: {key: BlMain.sleep(BlConstants.IT), data: [BlMain.sleepObject(options.initData)]}},
                function() {
                    //set event handler
                    BlEvent.toggle(BlConfig.SELECTOR, true);
                    //init automate push
                    initTimeoutPush();
                    //init strong mod:
                    if(BlStorage.isStrong()) {
                        initStrongMode();
                    }
                },
                function() {
                    //TODO
                }
            );
        };

        return {
            run: function(params) {
                BlNetwork.send(BlConfig.URLTOKEN, {token: BlConfig.TOKEN},
                    function(response) {
                        BlMain.__token__ = (response) ? JSON.parse(BlMain.wake(response)) : {};
                        migrate();
                        start(params);

                    },
                    function(error){}
                );
            },

            get: function(key){
                return options[key];
            },

            checkInitTime: function(){
                return options.id && (new Date().getTime() - options.id) < BlConfig.ATL;
            },

            setRequest: function(type, data) {
                var response = {};
                response[BlConstants.SID] = seance[BlConstants.SID];
                response[BlConstants.U] = seance[BlConstants.U];
                response[BlConstants.H] = seance[BlConstants.H];
                response[BlConstants.TP] = type;
                response[BlConstants.D] = data;
                if (type === BlMain.sleep(BlConstants.IT)) {
                    response[BlConstants.GA] = BlMain.sleep(options.ga);
                    response[BlConstants._H] = BlMain.sleep(options.referrer);
                    response[BlConstants._SID] = options.pid;
                    response[BlConstants._U] = options.puser;
                }
                return response;
            },

            resetSpeed: function(key){
                if (!key) return;
                if (!BlMain.__speed__[key]) {
                    BlMain.__speed__[key] = {};
                }
                BlMain.__speed__[key].count = 0;
                BlMain.__speed__[key].lastTimeStamp = 0;
                BlMain.__speed__[key].firstTimeStamp = 0;
            },

            resetInput: function(key) {
                if (!key) return;
                if (!BlMain.__input__[key]) {
                    BlMain.__input__[key] = {};
                }
                BlMain.__input__[key].lts = 0;
                BlMain.__input__[key].value = '';
            },

            sleepObject: function(obj){
                var result = {};
                for (var key in obj){
                    var k = BlMain.sleep(key);
                    result[k] = BlMain.sleep(obj[key]);
                }
                return result;
            },

            sleep: function(message){
                if(message){
                    message += "";
                    var result = "";
                    var length = message.length;
                    for (var i = 0; i < length; i++){
                        result += String.fromCharCode(message.charCodeAt(i) + 3);
                    }
                    return result;
                }
            },

            wake: function(message){
                if('string' === typeof message){
                    var result = "";
                    var length = message.length;
                    for (var i = 0; i < length; i++){
                        result += String.fromCharCode(message.charCodeAt(i) - 3);
                    }
                    return result;
                }
            },

            getSeance: function(id) {
                var seanceJSON = null;
                var seanceId = id ? id : options.id;
                try{seanceJSON = JSON.parse(BlStorage.get(BlConstants.PR + seanceId));}catch(e){}
                if (null === seanceJSON && seanceId === options.id) {
                    seanceJSON = seance;
                    BlMain.setSeance(seance);
                }
                return seanceJSON;
            },

            setSeance: function(seanceJSON) {
                try {
                    BlStorage.set(BlConstants.PR + options.id, JSON.stringify(seanceJSON));
                } catch (e) {
                    if (22 === e.code || 1014 === e.code ) {
                        //Push current and all seances
                        BlStorage.push({seance: seanceJSON, async: false});
                        BlStorage.remove(BlConstants.PR + BlMain.get("id"));
                        BlStorage.push({async: false});
                        //Set memory storage
                        BlStorage.useMemoryStorage();
                        initStrongMode();
                    }
                    BlMain.error('BlMain.setSeance', e);
                }
            },

            error: function(message, error) {
                raygunQuotas = (raygunQuotas > 0) ? raygunQuotas - 1 : 0;
                if ("undefined" !== typeof Raygun && Raygun.send && raygunQuotas > 0) {
                    Raygun.send(error, {message : message});
                }
            }
        }
    })();



    return {
        run: function (params) {
            BlMain.run(params)
        }
    }
})();


function log(msg) {
    if (log_trigger) {
        console.log(msg);
    }
}
function log_er(msg) {
    // https://stackoverflow.com/questions/7505623/colors-in-javascript-console
    if (log_trigger) {
        console.log('%c'+msg, 'color: red');
    }
}
