const Server = require("./server.js");

class App {
  constructor(use_reverse_proxy = true, reverse_proxy_https_to_https = false) {
    this._server = new Server(use_reverse_proxy, reverse_proxy_https_to_https);
  }

  launch() {
    this._server.launch();
  }
}

new App().launch();
