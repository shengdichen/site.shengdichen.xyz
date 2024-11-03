const DEFINITION = require("./definition.js");

const express = require("express");
const http = require("node:http");
const https = require("node:https");

const path = require("node:path");
const fs = require("node:fs");

const serve_index = require("serve-index");

class Server {
  constructor(use_reverse_proxy = true, reverse_proxy_https_to_https = false) {
    this._app = express();

    this._domain = `shengdichen.xyz`;
    this._use_reverse_proxy = use_reverse_proxy;
    this._https_to_https = reverse_proxy_https_to_https;

    this._path_public = path.join(DEFINITION.PATH_BIN, "public");
    this._path_private = path.join(DEFINITION.PATH_BIN, "private");
  }

  launch() {
    this._app.use((req, __, next) => {
      console.log(
        `server> ${req.method}` +
          ` request [${req.ip} @ ${req.headers["user-agent"]}]` +
          `  // ${new Date().toLocaleString()}`,
      );
      next(); // hand-off to next middleware
    });

    this._static();
    this._route_base();
    this._route_dox();
    this._route_home();

    this._make_server();
  }

  _static() {
    // so hyperlinks in index.html can be relative to public/*
    this._app.use(express.static(this._path_public));
    for (const p of ["ls", "ftp", "public"]) {
      this._app.use(
        `/${p}`,
        express.static(this._path_public),
        serve_index(this._path_public, { icons: true, view: "details" }),
      );
    }

    for (const p of ["priv", "private"]) {
      this._app.use(
        `/${p}`,
        express.static(this._path_private, { dotfiles: "allow" }),
      );
    }
  }

  _route_base() {
    this._app.get("/", function (__, res) {
      res.sendFile(path.join(DEFINITION.PATH_SRC, "/index.html"));
    });

    this._app.get("/maomao", (__, res) => {
      res.redirect(
        "https://duckduckgo.com/?t=ffab&q=%E8%B2%93&iax=images&ia=images",
      );
    });
  }

  _route_dox() {
    const postfix = "-CHEN_Shengdi";
    this._app.get("/cv", (__, res) => {
      res.download(path.join(this._path_public, "cv.pdf"), `cv${postfix}.pdf`);
    });
    this._app.get("/cv.pdf", (__, res) => {
      res.sendFile(path.join(this._path_public, "cv.pdf"));
    });

    this._app.get("/msc", (__, res) => {
      res.download(
        path.join(this._path_public, "Dox/msc.pdf"),
        `msc${postfix}.pdf`,
      );
    });
    this._app.get("/msc.pdf", (__, res) => {
      res.sendFile(path.join(this._path_public, "Dox/msc.pdf"));
    });
  }

  _route_home() {
    for (const p of ["syngy", "home"]) {
      this._app.get(`/${p}`, (__, res) => {
        res.redirect("https://home.shengdichen.xyz:54967");
      });
    }
    this._app.get("/plex", (__, res) => {
      res.redirect("https://home.shengdichen.xyz:31573");
    });
  }

  _make_server() {
    http.createServer(this._app).listen(this._use_reverse_proxy ? 8080 : 80);

    if (this._use_reverse_proxy && !this._https_to_https) {
      return;
    }
    const path_cert = `${DEFINITION.PATH_CERT}/${this._domain}`;
    const options = {
      key: fs.readFileSync(`${path_cert}/privkey.pem`),
      cert: fs.readFileSync(`${path_cert}/fullchain.pem`),
    };
    https
      .createServer(options, this._app)
      .listen(this._use_reverse_proxy ? 8443 : 443);
  }
}

module.exports = Server;
