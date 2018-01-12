import React from 'react'
import webgl from '../webgl/collision'

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