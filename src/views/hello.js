// const React = require('react')
import React from 'react'

class Hello extends React.Component {
  constructor(props) {
    super(props)
  }
  clickHandle() {
    console.log('from web client')
  }

  render() {
    return <h1 onClick={this.clickHandle}>Hello, world!</h1>
  }
}

export default Hello