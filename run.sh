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

__run() {
    (
        cd "./src" && node "./main.js"
    )
}

__setup
__run
