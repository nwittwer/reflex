/* eslint-disable */
'use strict';

import * as pan from "./pan"
import {
  on,
  off
} from './utils'
import * as panzoomEvents from './events'

export default class Panzoom {
  constructor(element, parent, options = {}) {
    this.parent = parent
    this.element = element
    this.transformData = {
      x: 0,
      y: 0,
      scale: 1
    }
    this.state = {
      isEnabled: false,
      isPanning: false,
      isZooming: false,
      isTouching: false
    }
    this.zoomIncrement = options.zoomIncrement || 0.2

    // Default Options
    this.options = options
    this.options.minZoom = options.minZoom || 0.125
    this.options.maxZoom = options.maxZoom || 10

    // This will keep track of events
    this._eventListener = {
      change: [],
      zoomStart: [],
      zoomStop: [],
      zoomIn: [],
      zoomOut: [],
      panStart: [],
      panStop: []
    }

    // Trigger initial functions
    this._init()
  }

  // Set initial
  _init = () => {
    // TODO temporary using null to avoid in tests
    const parent_styles = {
      height: '100%',
      overflow: 'hidden'
    }

    // Apply initial styles to parent
    Object.entries(parent_styles).forEach(
      ([key, value]) => {
        return this.parent.style[key] = value
      }
    )

    const child_styles = {
      transformOrigin: 'center center', // Enforce the default
      willChange: 'transform',
      display: 'inline-block',
      // transition: 'transform 150ms',
    }

    // Apply initial styles to child
    Object.entries(child_styles).forEach(
      ([key, value]) => {
        return this.element.style[key] = value
      }
    )

    // Enable
    this.enable()
  }

  /**
   * Enable / Disable this plugin
   * @param {*} type
   */
  _bindStartEvents = (type) => {
    const fn = type === 'on' ? on : off

    // On/Off event listeners
    fn(this.parent, 'wheel', panzoomEvents.onWheel)
    fn(this.parent, 'dblclick', panzoomEvents.onDblClick)
    fn(document, 'keydown', panzoomEvents.onKeyDown)
    fn(this.parent, 'mousedown', panzoomEvents.onMouseDown)
  }

  /**
   * Emits an event
   * @param {String} event
   */
  _emit = (event, evt) => {
    let ok = true

    for (const listener of this._eventListener[event]) {
      ok = listener.call(this, {
        inst: this,
        oe: evt
      }) && ok
    }

    return ok
  }

  /**
   * Changes the transform/translate values
   * Saves to panzoom.transformData
   */
  setTransform = async (newTransformValues) => {
    if (!newTransformValues) throw new Error('No transform values passed in.')

    console.error('Updating transforms', newTransformValues);

    const ctx = this;
    const currentTransformValues = this.getTransform()

    // Update the state
    for (let key in newTransformValues) {
      const value = newTransformValues[key]
      if (isNaN(value)) throw new Error(`Value passed in for ${key} is not a number.`)
      ctx.transformData[key] = value
    }

    // Update the CSS
    let newMatrix = {
      x: newTransformValues.x || currentTransformValues.x,
      y: newTransformValues.y || currentTransformValues.y,
      scale: newTransformValues.scale || currentTransformValues.scale
    }

    // Commit the CSS styles
    this.element.style.transform = `translate(${newMatrix.x}px, ${newMatrix.y}px) scale(${newMatrix.scale}, ${newMatrix.scale})`

    // Update Events.js context
    panzoomEvents._updateContext(this)

    // Emit an event
    // TODO: emit an event
    // this._emit('change', evt)
  }

  /**
   * Returns the current values as an object
   * { x, y, scale }
   */
  getTransform = () => {
    return JSON.parse(JSON.stringify(this.transformData))
  }

  /**
   * Center the child element relative to it's parent
   */
  center = async () => {
    console.log('center');

    const parentEl = this.parent.getBoundingClientRect()
    const childEl = this.element.getBoundingClientRect()
    const parentHeight = parentEl.height
    const parentWidth = parentEl.width
    const childHeight = childEl.height
    const childWidth = childEl.width

    // 1. Get difference between parent and child
    // 2. Calculate what 50% (center) would be, given the size of the element and its current scale
    // 3. Done
    const scale = this.getTransform().scale
    return await this.setTransform({
      x: (parentWidth - (childWidth * scale)) / 2,
      y: (parentHeight - (childHeight * scale)) / 2 // This works well
    })
  }

  scaleToFit = async () => {
    console.log('scale');

    // TODO This can scale beyond the maxZoom point
    const parentEl = this.parent.getBoundingClientRect()
    const childEl = this.element.getBoundingClientRect()

    // Set the height, widths
    const childHeight = childEl.height
    const childWidth = childEl.width
    const parentWidth = parentEl.width
    const parentHeight = parentEl.height

    const scale = this.getTransform().scale

    // If the child is outside of the parent, scale it down
    const childExceedsParent = (childWidth >= parentWidth || childHeight >= parentHeight);
    if (childExceedsParent) {
      console.log('exceeds parent');

      return await this.setTransform({
        scale: Math.min((parentWidth / childWidth), (parentHeight / childHeight))
      })
    } else {
      console.log('scale not needed');
      return
      // TODO Add logic to scale up to a reasonable size
      // await this.setTransform({
      // scale: Math.max((parentWidth / childWidth), (parentHeight / childHeight))
      // })
    }
  }

  /**
   * Scales the panzoom instance to fit a given DOM element
   * @TODO: This feature doesn't properly adjust to the given element
   */
  scaleToFitEl = (domElement) => {
    console.log(domElement)

    // Bounding box
    const el = domElement.getBoundingClientRect()
    const container = this.element.getBoundingClientRect()
    const parentEl = this.parent.getBoundingClientRect()

    // Set the height, widths
    const elHeight = el.height
    const elWidth = el.width
    const parentWidth = parentEl.width
    const parentHeight = parentEl.height

    // Prepare a new matrix from the current one
    // let newMatrix = this.transformMatrix
    let newMatrix = this.getTransform()

    // Get the current scale
    const currentScale = newMatrix.scale

    // If the child is outside of the parent, scale it down
    const childExceedsParent = !!((elWidth > parentWidth || elHeight > parentHeight));

    // Set the scale
    const scale = (value) => {
      newMatrix.scale = value
      return newMatrix.scale
    };

    // If bigger than the parent container
    if (childExceedsParent) {
      // Scale down the child if it exceeds the parent
      const zoomAspectRatioX = parentWidth / elWidth
      const zoomAspectRatioY = parentHeight / elHeight

      if (zoomAspectRatioX < 1 && zoomAspectRatioY < 1) {
        scale(Math.min(parentWidth / (elWidth / currentScale), parentHeight / (elHeight / currentScale)))
      } else if (zoomAspectRatioX < 1) {
        scale(parentWidth / (elWidth / currentScale))
      } else if (zoomAspectRatioY < 1) {
        scale(parentHeight / (elHeight / currentScale))
      }
    } else {
      // Within the parent container
      // We need to adjust the x, y
      // The x should be the center of the container div -

      newMatrix.x = parentWidth / elWidth
      newMatrix.y = parentHeight / elHeight

      // scale(Math.min(parentWidth / (elWidth / currentScale), parentHeight / (elHeight / currentScale)));

      console.log(this.transformMatrix, newMatrix)
    }

    // NEW API
    this.setTransform({
      x: newMatrix.x,
      y: newMatrix.y,
      scale: newMatrix.scale
    })
  }

  /**
   * Scales the contents to fit,
   * then centers the canvas on the screen
   */
  fitToScreen = async () => {
    // this.scaleToFit()

    // setTimeout(async () => this.scaleToFit)
    await this.center()
    await this.scaleToFit()
  }

  /**
   * Adds an eventlistener
   * @param event
   * @param cb
   */
  on = (event, cb) => {
    if (!this._eventListener[event]) throw new Error(`Event not setup ${event} ${cb}`)

    this._eventListener[event].push(cb)
    return this
  }

  /**
   * Removes an event listener
   * @param event
   * @param cb
   */
  off = (event, cb) => {
    const callBacks = this._eventListener[event]

    if (callBacks) {
      const index = callBacks.indexOf(cb)

      if (~index) {
        callBacks.splice(index, 1)
      }
    }

    return this
  }

  /**
   * Resume panzoom event listeners
   */
  enable = () => {
    // Update event context
    panzoomEvents._updateContext(this)

    // Event Emitter
    // Setup an event emitter
    this._bindStartEvents('on')

    // Set isEnabled state
    this.state.isEnabled = true
  }

  /**
   * Pause panzoom event listeners
   */
  disable = () => {
    // Unbind event listeners
    // panzoomEvents._unbind(this);

    // Stop event emitting
    // TODO: Add tests for this
    this._bindStartEvents('off')

    // Set isEnabled state
    this.state.isEnabled = false
  }


  _zoom = (args) => {
    const matrix = this.getTransform() // Current transform matrix [0,0,0,0,0,0]
    const currentScale = matrix.scale // Current zoom
    let nextScale // Next zoom

    switch (args) {
      case 'in':
        nextScale = currentScale / this.zoomIncrement
        break
      case 'out':
        nextScale = currentScale * this.zoomIncrement
        break
    }

    this.setTransform({
      scale: nextScale
    })
  }

  /**
   * Zoom In
   */
  zoomIn = () => {
    const event = new CustomEvent('zoomIn');
    this._emit('zoomIn', event)
    this._zoom('in')
  }

  /**
   * Zoom Out
   */
  zoomOut = () => {
    const event = new CustomEvent('zoomOut');
    this._emit('zoomOut', event)
    this._zoom('out')
  }


  /**
   * Set the canvas to x, y
   * @param {*} x px value
   * @param {*} y px value
   */
  panToElement = (el) => {
    pan.panToElement(this, el)
  }
}
