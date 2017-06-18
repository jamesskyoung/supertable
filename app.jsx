import React from 'react';
import ReactDOM from 'react-dom';
import SuperTable from './lib/SuperTable.jsx';

let faker = require('faker');

let data = [];
let dataSize = 10;
let xswitch = true;


// Create data using faker
for (var i = 0; i < dataSize; i++) {
    data.push( createFakeRowObjectData( i ) );
}

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

function getColumnMetaData() {

    return [
        { 'header': 'ID', 'width': '10%', attribute: 'id', order: 1 },
        { 'header': 'Email', 'width': '20%', attribute: 'email', order: 4, maxWidth: 222 },
        { 'header': 'City', 'width': '30%', attribute: 'city', order: 3, resize: true, xrenderer: customRender },
        { 'header': 'Street', 'width': '20%', attribute: 'street', order: 4, maxWidth: 222 },
        { 'header': 'Zip', 'width': '10%', attribute: 'zipCode', order: 5 },
        { 'header': 'Date', 'width': '10%', attribute: 'date', order: 4, renderer: dateRender },
    ]

}

function rowClick( row ) {
    alert( 'Row clicked! Id is: ' + row.id )
}


function cellClick( rowIndex, column, data ) {
    alert( 'Cell clicked! attribute name : ' + column + ' Id is: ' + data['id'] );
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


ReactDOM.render(
    <div>
        <h1>PMDB Datatable!</h1>
        <SuperTable 
            columnMeta={ getColumnMetaData() }
            data={data}
            filterPlaceholder='Filter this data..yyy.'
            itemsPerPageText='items per page'
            onCellClickCallback={cellClick}
            onRowClickCallback={rowClick}
            rowsPerPage={10}
            showItemsPerPage={true}
            showPagination={true}
            showText={'Show'}
            showTotalRowCount={true}
            tableHeight={500}
            tableWidth={'100%'}
            totalRowCountText='items found'
        />
    </div>,
    document.getElementById('app')
);
