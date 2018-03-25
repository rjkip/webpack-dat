var Dat = require("dat-node");
var ram = require("random-access-memory");
var path = require("path");
var webpack = require("webpack");

/**
 * @interface Options
 *
 * @prop {Object} webpack The webpack configuration.
 * @prop {Object} [webpackWatch] The options to pass to webpack's watch function.
 * @prop {string} [staticFiles] Leave falsy when you don't want to serve static files like index.html.
 *
 * @see https://webpack.js.org/configuration/watch/#watchoptions
 */

/**
 * @callback DatUrlCallback
 * @param {string} The full dat:// URL that will provide access to the static files and compiled files.
 */

/**
 * @param {Options} options
 * @param {DatUrlCallback} callback
 */
module.exports = function webpackDevDat(options, callback) {
  Dat(options.staticFiles || ram, { temp: true }, function(err, dat) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    if (callback) {
      callback("dat://" + dat.key.toString("hex"));
    }

    if (options.staticFiles) {
      dat.importFiles({ watch: true });
    }

    dat.joinNetwork();

    var compiler = webpack(options.webpack);

    var dfs = dat.archive;
    compiler.outputFileSystem = {
      mkdirp: createMkdirp(dfs),
      mkdir: dfs.mkdir.bind(dfs),
      rmdir: dfs.rmdir.bind(dfs),
      unlink: dfs.unlink.bind(dfs),
      writeFile: dfs.writeFile.bind(dfs),
      join: path.join.bind(path),
    };

    compiler.watch(options.webpackWatch, function(err, stats) {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        return;
      }

      const info = stats.toJson();
      if (stats.hasWarnings()) {
        console.log("");
        info.warnings.forEach(warning => console.warn(warning));
      }
      if (stats.hasErrors()) {
        console.log("");
        info.errors.forEach(error => console.warn(error));
      }
    });
  });
};

// https://github.com/substack/node-mkdirp/blob/f2003bbcffa80f8c9744579fabab1212fc84545a/index.js
function createMkdirp(fs) {
  var _0777 = parseInt("0777", 8);

  return function mkdirp(p, opts, f, made) {
    if (typeof opts === "function") {
      f = opts;
      opts = {};
    } else if (!opts || typeof opts !== "object") {
      opts = { mode: opts };
    }

    var mode = opts.mode;
    var xfs = opts.fs || fs;

    if (mode === undefined) {
      mode = _0777 & ~process.umask();
    }
    if (!made) made = null;

    var cb = f || function() {};
    p = path.resolve(p);

    xfs.mkdir(p, mode, function(er) {
      if (!er) {
        made = made || p;
        return cb(null, made);
      }
      switch (er.code) {
        case "ENOENT":
          mkdirp(path.dirname(p), opts, function(er, made) {
            if (er) cb(er, made);
            else mkdirp(p, opts, cb, made);
          });
          break;

        // In the case of any other error, just see if there's a dir
        // there already.  If so, then hooray!  If not, then something
        // is borked.
        default:
          xfs.stat(p, function(er2, stat) {
            // if the stat fails, then that's super weird.
            // let the original error be the failure reason.
            if (er2 || !stat.isDirectory()) cb(er, made);
            else cb(null, made);
          });
          break;
      }
    });
  };
}
