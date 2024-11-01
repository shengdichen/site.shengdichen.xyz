const path = require("node:path");
const fs = require("node:fs");

const express = require("express");
const process = require("process");

const http = require("node:http");
const https = require("node:https");

class Const {
  static HOME = process.env.HOME;
  static PATH_ROOT = __dirname;

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

    this._path_attachment = path.join(Const.PATH_ROOT, "attachment");
    this._path_public = path.join(Const.PATH_ROOT, "public");

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

    const [path_server, path_local] = ["/download", "./attachment"];
    this._app.use(
      path_server,
      express.static(path_local, { dotfiles: "allow" }),
    );

    this._app.use(express.static(this._path_public));
    this._app.use(express.static(Const.PATH_ROOT));
  }

  _route() {
    this._app.get("/", (__, res) => {
      res.json({ message: "S'up, dude" });
    });

    this._app.get("/cv", (__, res) => {
      res.download("./attachment/cv.pdf");
    });

    this._app.get("/song", (__, res) => {
      res.sendFile(path.join(this._path_attachment, "f.flac"));
    });

    this._app.get("/maomao", (__, res) => {
      res.redirect(
        "https://duckduckgo.com/?t=ffab&q=%E8%B2%93&iax=images&ia=images",
      );
    });
  }
}

new App().launch();
