import React from 'react';
import ReactDOM from 'react-dom';
import SuperTable from '../lib/SuperTable.jsx';
//import SuperTablePaginator from '../lib/SuperTablePaginator.jsx';
import PaginatorExample from './PaginatorExample.jsx';
import Button from 'react-bootstrap/lib/Button';

let faker = require('faker');

let data = [];
let dataSize = 308;
let xswitch = true;


// Create data using faker
for (var i = 0; i < dataSize; i++) {
    data.push( createFakeRowObjectData( i ) );
}

console.log( JSON.stringify( data ) );

function createFakeRowObjectData(/*number*/ index) /*object*/ {
    return {
      id: index,
      avatar: faker.image.avatar(),
      city: faker.address.city(),
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      street: faker.address.streetName(),
      zipCode: faker.address.zipCode(),
      date: faker.date.past(),
      bs: faker.company.bs(),
      catchPhrase: faker.company.catchPhrase(),
      companyName: faker.company.companyName(),
      words: faker.lorem.words(),
      sentence: faker.lorem.sentence(),
    };
  }

function refreshData() {
    
    dataSize=87;
    data = [];
    for (var i = 0; i < dataSize; i++) {
        data.push( createFakeRowObjectData( i ) );
    }
    if (undefined !== window.superTable) {
        window.superTable.refresh(data);
      }
}

function getColumnMetaData() {

    return [
        { 'header': 'Special', 'width': '10%', renderer: insertCheckbox, order: 1 },
        { 'header': 'ID', 'width': '10%', attribute: 'id', order: 1 },
        { 'header': 'Email', 'width': '20%', attribute: 'email', order: 4, maxWidth: 222 },
        { 'header': 'City', 'width': '20%', attribute: 'city', order: 3, resize: true, xrenderer: customRender },
        { 'header': 'Street', 'width': '20%', attribute: 'street', order: 4, maxWidth: 222 },
        { 'header': 'Zip', 'width': '20%', attribute: 'zipCode', order: 5 }
    ]

}


function getColumnMetaData2() {

    return [
        { 'header': 'ID', 'width': '10%', attribute: 'id' },
        { 'header': 'First name', 'width': '30%', attribute: 'firstName' },
        { 'header': 'Last name', 'width': '30%', attribute: 'lastName' },
        { 'header': 'City', 'width': '30%', attribute: 'city'}

    ]

}

function rowClick(row) {
    alert('Row clicked! Id is: ' + row.id)
}


function cellClick(rowIndex, column, cell ) {
    alert('Cell clicked! attribute name : ' + column + ' Id is: ' + cell );
}

function customRender(rowIndex, data, columnKey) {

    return 'custom...' + data[columnKey] + '...end'


}

function insertCheckbox(rowIndex, data, columnName) {
    console.log( 'RI..' + rowIndex + ' ' + columnName );
    return <input type='checkbox' />

}

/**
 * Render a date object
 * @param {*} rowIndex 
 * @param {*} data 
 * @param {*} columnKey 
 */
function dateRender( rowIndex, data, columnKey ) {
  function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }

  function formatDate( date ){
      return date.getUTCFullYear() +
        '/' + pad(date.getUTCMonth() + 1) +
        '/' + pad(date.getUTCDate());
        
    };
    return formatDate( data[columnKey] );
 
}

function customRender( rowIndex, data, columnKey ) {
  
    return 'custom...' + data[columnKey] + '...end'
 
}

function getPaginator() {
    return <PaginatorExample />
}

ReactDOM.render(
    <div>
        <h1>Test table</h1>

        <SuperTable 
            ref={instance => { window.superTable = instance; }}
            columnMeta={ getColumnMetaData2() }
            data={data}
            itemsPerPageText= 'rows per page'
            showFilter={false}
            showText='Show: '
            rowsPerPage={10}
            showItemsPerPage={false}
            showPagination={true}
            showTotalRowCount={true}
            tableHeight={500}
            tableWidth={'100%'}
            totalRowCountText='items found'
            xpaginator={PaginatorExample}
        />
 
        <Button onClick={refreshData}>New Data!</Button>
    </div>,
    document.getElementById('app')
);
