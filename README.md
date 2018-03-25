# webpack-dat

Serves a Webpack configuration plus static files over P2P [Dat](https://datproject.org/). [Beaker Browser](https://beakerbrowser.com/) supports live reloading out of the box!

## Example usage

```js
webpackDev(
  {
    webpack: {
      mode: "production",
      entry: "./src/script.js",
      output: { path: "/" },
    },
    staticFiles: "./public",
  },
  function(datUrl) {
    console.log("Dat URL: " + datUrl);
  },
);
```

For a full, working example, [look no further](./example).

![image](https://user-images.githubusercontent.com/1734555/37879164-56008eaa-3074-11e8-9664-afa67c75c7ce.png)
