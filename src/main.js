const path = require("node:path");
const fs = require("node:fs");

const express = require("express");
const process = require("process");

const http = require("node:http");
const https = require("node:https");

const serve_index = require("serve-index");

class Const {
  static HOME = process.env.HOME;
  static PATH_SRC = __dirname;
  static PATH_BIN = path.join(Const.PATH_SRC, "../bin");

  static PATH_CERT = `${this.HOME}/.cert/`;

  static _XYZ = path.join(this.HOME, "/xyz");
  static PATH_Dox = path.join(this._XYZ, "/Dox");
  static PATH_MDA = path.join(this._XYZ, "/MDA");
  static PATH_TV = path.join(this.PATH_MDA, "/Vid/TV");
  static PATH_FM = path.join(this.PATH_MDA, "/Vid/FM");
}

class App {
  constructor() {
    this._app = express();

    this._port_http = 3030;
    this._port_https = 3031;

    this._path_private = path.join(Const.PATH_BIN, "private");
    this._path_public = path.join(Const.PATH_BIN, "public");

    const domain = `shengdichen.xyz`;
    this._path_cert = `${Const.PATH_CERT}/${domain}`;
  }

  launch() {
    this._configure();
    this._route();

    http.createServer(this._app).listen(this._port_http);

    const options = {
      key: fs.readFileSync(`${this._path_cert}/privkey.pem`),
      cert: fs.readFileSync(`${this._path_cert}/fullchain.pem`),
    };
    https.createServer(options, this._app).listen(this._port_https);
  }

  _configure() {
    this._app.use((req, __, next) => {
      console.log(
        `server> ${req.method}` +
          ` request [${req.ip} @ ${req.headers["user-agent"]}]` +
          `  // ${new Date().toLocaleString()}`,
      );
      next(); // hand-off to next callback
    });

    // so hyperlinks in index.html can be relative to public/*
    this._app.use(express.static(this._path_public));
    for (const p of ["ls", "ftp", "public"]) {
      this._app.use(
        `/${p}`,
        express.static(this._path_public),
        serve_index(this._path_public, { icons: true }),
      );
    }

    for (const p of ["priv", "private"]) {
      this._app.use(
        `/${p}`,
        express.static(this._path_private, { dotfiles: "allow" }),
      );
    }
  }

  _route() {
    this._app.get("/", function (__, res) {
      res.sendFile(path.join(Const.PATH_SRC, "/index.html"));
    });

    this._app.get("/cv", (__, res) => {
      res.download(path.join(this._path_public, "cv.pdf"));
    });

    this._app.get("/song", (__, res) => {
      res.sendFile(path.join(this._path_private, "f.flac"));
    });

    this._app.get("/maomao", (__, res) => {
      res.redirect(
        "https://duckduckgo.com/?t=ffab&q=%E8%B2%93&iax=images&ia=images",
      );
    });
  }
}

new App().launch();
