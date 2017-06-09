

"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
class Test extends React.Component {

  constructor(props) {
    super(props);
  }

 

  /**
   * REACT Render method.
   */
  render() {

    alert( 'render..' );
    return (
      <div  >

        <h1>Hello</h1>

      </div>
    );
  }
}

export default Test;
