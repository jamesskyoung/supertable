import React from 'react';
import ReactDOM from 'react-dom';
import Test from './index.js';


alert( 'xxx' );
console.log( '*****************************' );
console.log( Test );
console.log( '*****************************' );


ReactDOM.render(
    <div>
        <h1>PMDB Datatable!</h1>
        <Test />
         
    </div>,
    document.getElementById('app')
);
