// const React = require('react')
import React from 'react'
import webgl from '../webgl/control'

class Hello extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    webgl(this.refs.canvas)
  }

  render() {
    return (<div ref="canvas"></div>)
  }
}

export default Hello