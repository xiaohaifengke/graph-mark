> Mark the face frame in image and get the corresponding coordinates.
> This lib is dependent on [fabric.js](http://fabricjs.com).

## Install

```shell
npm install fabric -S
npm install graph-mark -S
```

## Quick Start

```javascript
import { fabric } from 'fabric'
import { Mark } from 'graph-mark'

```

## Default options
```javascript
defaultOptions = {
    canvasTagId: null,
    maxResultsLength: 1000000
  }
```

- canvasTagId: Canvas tag id.
- maxResultsLength: The number of rectangular box that can exist at the same time. default: 1000000

## Examples of use
cdns
```html
<!doctype html>
<html lang="en">
<head>
    <title>cdn example of use</title>
    <script src="./fabric.js"></script>
    <script src="../lib/graph-mark.js"></script>
</head>
<body>
<img src="100x100x5.jpg" id="image1" style="display: none;">
<img src="avatar.jpg" id="image2" style="display: none;">
<canvas id="c" width="550" height="550"
        style="margin-left: 20px; position: absolute; left: 20px; top: 20px; touch-action: none; user-select: none;border: 1px solid #333;"
        class="lower-canvas"></canvas>
</body>
</html>
<script>
  var mark = new GraphMark.Mark({canvasTagId: 'c', maxResultsLength: 1});
  var imgElement = document.getElementById('image1');
  mark.init(imgElement);
</script>
```
You can test it on this [demo](https://github.com/xiaohaifengke/graph-mark/blob/dev/example/cdn-demo.html).

## Babel7

**Note:** This module is using the experimental [public class fields syntax](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties), if you have error like that:
 ```shell
 ERROR  Failed to compile with 1 errors                                                                                                                                                                                                                  11:22:58


     error  in ./node_modules/graph-mark/src/index.js

    Module parse failed: Unexpected token (15:17)
    You may need an appropriate loader to handle this file type.
    |   }
    |
    >   defaultOptions = {
    |     canvasTagId: null,
    |     maxResultsLength: 1000000

     @ ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/babel-loader/lib!./src/loaders/tunicorn-branch-loader.js??ref--15-0!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/views/monitor/
    monitor.vue?vue&type=script&lang=js& 88:16-37

    ...
    ...
 ```
you should add *@babel/plugin-proposal-class-properties* in babel.config.js :
```javascript
const presets = []
const plugins = [
  '@babel/plugin-proposal-class-properties',
  ...
]

module.exports = {presets, plugins}
```
