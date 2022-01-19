## Web Deployment 

### 1. clone git
https://gitlab.com/nadi.ocms/ocms1.x/runtime

### 2. put in Linux
put directory **runtime** in **/home/{username}/**

* runtime include web/build and web/ocms3d

### 3. install nginx

### 4. revise nginx config
change directory to **/etc/nginx/**
```linux
$cd /etc/nginx
```
editor **nginx.conf**
```conf
...
...
http{
    ...
    ...
    
    # add following code
    server {
        listen       80;
        server_name  localhost;

        charset utf-8;

        allow all;
        location / {
            root   /home/nadi/runtime/web/build;
            index  index.html index.htm;
        }

        location /ocms3d {
            root   /home/nadi/runtime/web;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```
