#!/usr/bin/env dash

__setup() {
    # REF:
    #   https://stackoverflow.com/questions/50112186/error-listen-eacces-0-0-0-0443

    local _node="/usr/bin/node"
    if [ -n "$(getcap "${_node}")" ]; then
        return
    fi
    sudo setcap "cap_net_bind_service=+ep" "${_node}"
}

__nginx() {
    local _base="/etc/nginx/conf.d"
    sudo mkdir -p "${_base}"

    cat <<STOP | sudo tee "${_base}/site.conf" >/dev/null
server {
    listen 80;
    server_name 127.0.0.1;

    location / {
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_pass http://127.0.0.1:8080;
    }
}

server {
    listen 443 ssl;
    server_name 127.0.0.1;

    ssl_certificate /home/main/.cert/shengdichen.xyz/cert.pem;
    ssl_certificate_key /home/main/.cert/shengdichen.xyz/privkey.pem;

    ssl_session_cache shared:SSL:1m;
    ssl_session_timeout 5m;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_pass https://127.0.0.1:8443;
    }
}
STOP

    sudo systemctl restart nginx
}

__run() {
    (
        cd "./src" && node "./main.js"
    )
}

__setup
__nginx
__run
