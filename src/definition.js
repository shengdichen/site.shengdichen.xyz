const process = require("process");
const path = require("node:path");

class DEFINITION {
  static HOME = process.env.HOME;
  static PATH_SRC = __dirname;
  static PATH_BIN = path.join(this.PATH_SRC, "../bin");

  static PATH_CERT = `${this.HOME}/.cert/`;

  static _XYZ = path.join(this.HOME, "/xyz");
  static PATH_Dox = path.join(this._XYZ, "/Dox");
  static PATH_MDA = path.join(this._XYZ, "/MDA");
  static PATH_TV = path.join(this.PATH_MDA, "/Vid/TV");
  static PATH_FM = path.join(this.PATH_MDA, "/Vid/FM");
}

module.exports = DEFINITION;
