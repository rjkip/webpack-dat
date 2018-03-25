#!/usr/bin/env node

var path = require("path");
var webpackDev = require("..");

webpackDev(
  {
    webpack: {
      mode: "production",
      entry: path.join(__dirname, "src/script.js"),
      output: { path: "/" },
    },
    staticFiles: path.join(__dirname, "public"),
  },
  function(datUrl) {
    console.log("Dat URL: " + datUrl);
  },
);
