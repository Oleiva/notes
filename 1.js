var log_trigger =false;
BlStatic = (function() {
    console.log("Hello from static.js for developers");

    var conf_token;
    var conf_access_token_life = 7200000; //#in miliseconds (2 hours)
    var conf_host;

    var request = new XMLHttpRequest();
    var headers = request.getAllResponseHeaders().toLowerCase();
    log("headers");
    log(headers);

    sc = document.getElementsByTagName("script");

    for (idx = 0; idx < sc.length; idx++) {
        s = sc.item(idx);
        if (s.src && s.src.includes('static.js')) {
            var url = new URL(s.src);
            conf_token  = url.searchParams.get('token');
            conf_host = url.searchParams.get('host');
        }
    }

    console.log('TOCKEN :'+conf_token);
     console.log('HOST :'+conf_host);

    var conf_ssl_header = request.getResponseHeader("x-forwarded-proto");
    var conf_tocken_header = request.getResponseHeader("token");
    
     console.log(conf_ssl_header);


    var conf_protocol;
    if (conf_ssl_header !== null && conf_ssl_header.contains("https")) {
        conf_protocol = "https";
    } else {
        conf_protocol = "http";
    }

 


    log(headers);
    log(conf_protocol);
    
    }
