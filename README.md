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
import { mark } from 'graph-mark'

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
You can test it on this [demo]().

