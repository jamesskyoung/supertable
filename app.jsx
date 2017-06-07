import React from 'react';
import ReactDOM from 'react-dom';
import SuperTable from './lib/SuperTable.jsx';


alert( 'xxx' );
console.log( '*****************************' );
console.log( SuperTable );
console.log( '*****************************' );
let data = [];
let dataSize = 105;
let xswitch = true;

for (var i = 0; i < dataSize; i++) {
    let pl = '3rd party';
    if ( xswitch) {
        pl = '1st Party';
        xswitch = false;
    } else {
        xswitch = true;
    }
    var obj = {
        id: i + Math.random(),
        partnerName: 'name_' + i,
        partnerStatus: 'active',
        partnerCity: 'London_' + Math.random(),
        partnerLevel: pl,
        created: new Date().getTime()
    }
    data.push(obj);
}

function getColumnMetaData() {
/*
    return [
        { 'header': 'ID', 'width': 300, attribute: 'id', order: 1 },
        { 'header': 'Partner Status', 'width': 200, attribute: 'partnerStatus', order: 2 },
        { 'header': 'City', 'width': 200, attribute: 'partnerCity', order: 3 },
        { 'header': 'Level', 'width': 200, attribute: 'partnerLevel', order: 4 },
        { 'header': 'Created', 'width': 200, attribute: 'created', order: 5 }

    ]
*/
    return [
        { 'header': 'ID', 'width': '5%', attribute: 'id', order: 1 },
        { 'header': 'Partner Status', 'width': '20%', attribute: 'partnerStatus', order: 2 },
        { 'header': 'City', 'width': '45%', attribute: 'partnerCity', order: 3, resize: true, xrenderer: customRender },
        { 'header': 'Level', 'width': '20%', attribute: 'partnerLevel', order: 4, maxWidth: 222 },
        { 'header': 'Created', 'width': '10%', attribute: 'created', order: 5 }

    ]

}

function rowClick( row ) {
    alert( 'Row clicked! Id is: ' + row.id )
}


function cellClick( rowIndex, column, data ) {
    alert( 'Cell clicked! attribute name : ' + column + ' Id is: ' + data['id'] );
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
            tableWidth={'75%'}
            totalRowCountText='items found'
        />
    </div>,
    document.getElementById('app')
);
