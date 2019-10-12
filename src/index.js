export class Mark {
  constructor (options) {
    if (typeof options === 'string') {
      options = { canvasTagId: options }
    }
    let opts = { ...this.defaultOptions, ...options }
    if (!opts.canvasTagId) {
      throw new Error('canvasTagId should be a string.')
    }
    this.options = opts
    this.canvas = new fabric.Canvas(opts.canvasTagId)
    this.canvas.selection = false
  }

  defaultOptions = {
    canvasTagId: null,
    maxResultsLength: 1000000
  }
  options = null

  state = {
    scale: 1,
    x: 0,
    y: 0,
    minZoom: 0.02,
    maxZoom: 15
  }
  zoomFactor = 0
  image = null

  get imageWidth () {
    return this.image && this.image.get('width')
  }

  get imageHeight () {
    return this.image && this.image.get('height')
  }

  currentDrawing = null // 当前正在绘制的图形
  mouseCoordinate = {
    lastPoint: null
  }
  // 当前的绘图状态
  cursorState = {
    rect: false
  }
  results = []

  init (imgElement) {
    this.clear()
    this.image = new fabric.Image(imgElement)
    this.image.set({
      hasRotatingPoint: false,
      hasControls: false,
      selectable: false,
      lockMovementX: true,
      lockMovementY: true
    })
    this.initVptScale()

    this.canvas.add(this.image)

    this.canvas.on('mouse:down', this.mousedownEventListener.bind(this))
    this.canvas.on('mouse:move', this.mousemoveEventListener.bind(this))
    this.canvas.on('mouse:up', this.mouseupEventListener.bind(this))
    this.canvas.on('mouse:wheel', this.mousewheelEventListener.bind(this))
  }

  mousedownEventListener (options) {
    if (this.image) {
      let mc = this.getMouseCoordinate(options)
      // 当起始点在图形范围内的时候为有效开始点
      if (mc.vptX >= 0 && mc.vptY >= 0 && mc.vptX <= this.imageWidth && mc.vptY <= this.imageHeight) {
        if (this.cursorState.rect && !this.currentDrawing) {
          this.currentDrawing = new fabric.Rect({
            left: mc.vptX,
            top: mc.vptY,
            width: 0,
            height: 0,
            scaleX: 1,
            scaleY: 1,
            stroke: '#ff425f',
            strokeWidth: 3,
            fill: 'transparent',
            selectable: false,
            // opacity: 0.5,
            hasRotatingPoint: false,
            hasControls: false
          })
          this.currentDrawing.startPointCoordinate = { vptX: mc.vptX, vptY: mc.vptY }
          this.canvas.add(this.currentDrawing)
        } else if (!this.cursorState.rect) {
          // this.mouseCoordinate.startPoint = mc // 初始点坐标
          this.mouseCoordinate.lastPoint = mc // 前一个点的坐标
        }
      }
    }
  }

  mousemoveEventListener (options) {
    if (this.image) {
      let mc = this.getMouseCoordinate(options)
      if (this.cursorState.rect && this.currentDrawing) {
        const originX = this.currentDrawing.startPointCoordinate.vptX
        const originY = this.currentDrawing.startPointCoordinate.vptY
        let left = Math.min(originX, mc.vptX)
        let top = Math.min(originY, mc.vptY)
        let width = Math.abs(mc.vptX - originX)
        let height = Math.abs(mc.vptY - originY)
        // 限制绘制的图形在图片范围内
        if (left < 0) {
          width += left
          left = 0
        }
        if (top < 0) {
          height += top
          top = 0
        }
        if (left + width > this.imageWidth) {
          width = this.imageWidth - left
        }
        if (top + height > this.imageHeight) {
          height = this.imageHeight - top
        }
        this.currentDrawing.set({ left, top, width, height })
        this.canvas.renderAll() // FIXME: need optimize
      } else if (!this.cursorState.rect && this.mouseCoordinate.lastPoint) {
        this.move(mc, this.mouseCoordinate.lastPoint)
      }
    }
  }

  mouseupEventListener (options) {
    if (this.image) {
      if (this.cursorState.rect && this.currentDrawing) {
        const width = this.currentDrawing.get('width')
        const height = this.currentDrawing.get('height')
        if (width < 10 || height < 10) {
          this.canvas.remove(this.currentDrawing)
        } else {
          this.updateContainer(this.currentDrawing)
        }
        this.currentDrawing = null
      }
      // this.mouseCoordinate.startPoint = null // 初始点坐标
      this.mouseCoordinate.lastPoint = null // 前一个点的坐标
    }
  }

  mousewheelEventListener (options) {
    if (this.image) {
      let wheelDelta = 0
      if (options.e.wheelDelta) { // IE/Opera/Chrome
        wheelDelta = -(options.e.wheelDelta / 120) * 1000
      } else if (options.e.detail) { // Firefox
        wheelDelta = (options.e.detail / 3) * 1000
      }
      this.zoomFactor += wheelDelta
      this.vptScale(options)
    }
  }

  /**
   * 初始化时vpt缩放到合适的大小
   * @method initVptScale
   * @return void
   * */
  initVptScale () {
    const imageWidth = this.imageWidth
    const imageHeight = this.imageHeight
    const drawingWidth = this.canvas.get('width')
    const drawingHeight = this.canvas.get('height')
    let x = 0
    let y = 0
    let sc = 1
    if (imageWidth > drawingWidth || imageHeight > drawingHeight) {
      const scw = drawingWidth / imageWidth
      const sch = drawingHeight / imageHeight
      sc = scw < sch ? scw : sch
      if (scw < sch) {
        y = (drawingHeight - imageHeight * sc) / 2
      } else {
        x = (drawingWidth - imageWidth * sc) / 2
      }
    } else {
      x = (drawingWidth - imageWidth) / 2
      y = (drawingHeight - imageHeight) / 2
    }

    this.setState({
      scale: sc,
      x: x,
      y: y
    })

    this.render()
  }

  /**
   * 图片组缩放
   * @method vptScale
   * @param {object | window.event} MouseCoordinate 鼠标坐标信息
   * @return void
   * */
  vptScale (MouseCoordinate) {
    if (isNaN(this.zoomFactor)) {
      return
    }
    if (MouseCoordinate.e.preventDefault) { // 判断 MouseCoordinate 是否是浏览器事件对象
      MouseCoordinate = this.getMouseCoordinate(MouseCoordinate) // 根据事件对象计算出wiewport对应坐标
    }

    // Speed limit
    let zoomFactor = this.zoomFactor / -5000
    zoomFactor = Math.min(0.5, Math.max(-0.5, zoomFactor))
    let scale = this.state.scale + (this.state.scale * zoomFactor)
    this.zoomFactor = 0

    if (scale < this.state.minZoom) {
      scale = this.state.minZoom
    } else if (scale > this.state.maxZoom) {
      scale = this.state.maxZoom
    }
    if (scale === this.state.scale) {
      return
    }

    // Zoom and pan transform-origin equivalent
    let scaleD = scale / this.state.scale
    let currentX = this.state.x
    let currentY = this.state.y
    let oX = MouseCoordinate.zoomX
    let oY = MouseCoordinate.zoomY
    let x = scaleD * (currentX - oX) + oX
    let y = scaleD * (currentY - oY) + oY

    this.setState({
      scale,
      x,
      y
    })

    this.render()
  }

  render () {
    const vpt = [this.state.scale, 0, 0, this.state.scale, this.state.x, this.state.y]
    this.canvas.setViewportTransform(vpt)
  }

  /**
   * 设置状态
   * @param {object} state 状态信息
   * */
  setState (state) {
    this.state = { ...this.state, ...state }
  }

  move (currentPoint, lastPoint) {
    let moveX = currentPoint.zoomX - lastPoint.zoomX
    let moveY = currentPoint.zoomY - lastPoint.zoomY
    let x = this.state.x + moveX
    let y = this.state.y + moveY

    this.setState({
      x: x,
      y: y
    })
    this.render()
    this.mouseCoordinate.lastPoint = currentPoint
  }

  /** TODO: 相对图片的坐标需要考虑边框宽度的影响，暂不考虑
   * 返回鼠标在 viewport 中的坐标和相对于图片的坐标
   * @param {event} e 浏览器事件
   * @return {object} zoomX,zoomY: 相对 viewport 的x,y轴的坐标. graphX,graphY: 相对于图片的x,y轴的坐标.
   * */
  getMouseCoordinate (options) {
    let zoomX = options.pointer.x
    let zoomY = options.pointer.y

    let sc = this.state.scale
    let x = this.state.x
    let y = this.state.y

    let vptX = (zoomX - x) / sc
    let vptY = (zoomY - y) / sc

    return { zoomX: zoomX, zoomY: zoomY, vptX: vptX, vptY: vptY }
  }

  updateContainer (fabricObject) {
    if (this.results.length >= this.options.maxResultsLength) {
      this.results.shift(0, 1)
      this.canvas.remove(this.canvas.item(1))
    }
    this.results.push({
      x: fabricObject.get('left'),
      y: fabricObject.get('top'),
      width: fabricObject.get('width'),
      height: fabricObject.get('height')
    })
  }

  clearRect () {
    const length = this.canvas.size()
    for (let i = 0; i < length; i++) {
      const item = this.canvas.item(i)
      if (item.startPointCoordinate) {
        this.canvas.remove(item)
      }
    }
    this.results = []
  }

  clear () {
    this.canvas.clear()
    this.image = null
    this.state = {
      scale: 1,
      x: 0,
      y: 0,
      minZoom: 0.02,
      maxZoom: 15
    }
    this.zoomFactor = 0
    this.cursorState = {
      rect: false
    }
    this.results = []
    this.render()
  }
}