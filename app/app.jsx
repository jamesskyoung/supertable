import React from 'react';
import ReactDOM from 'react-dom';
import SuperTable from './components/SuperTable.jsx';

let data = [];
let dataSize = 200;
for (var i = 0; i < dataSize; i++) {
    var obj = {
        id: i,
        partnerName: 'name_' + i,
        partnerStatus: 'active',
        partnerCity: 'London',
        partnerLevel: '3rd Party',
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
        { 'header': 'City', 'width': '45%', attribute: 'partnerCity', order: 3, resize: true },
        { 'header': 'Level', 'width': '20%', attribute: 'partnerLevel', order: 4, maxWidth: 222 },
        { 'header': 'Created', 'width': '10%', attribute: 'created', order: 5 }

    ]

}

function rowClick( row ) {
    alert( 'Row clicked! Id is: ' + row.id )
}


function cellClick( column, data ) {
    alert( 'Cell clicked! attribute name : ' + column + ' Id is: ' + data['id'] );
}

ReactDOM.render(
    <div>
        <h1>Hello!</h1>
        <SuperTable 
            tableWidth={'100%'}
            data={data}
            columnMeta={ getColumnMetaData() }
            onCellClickCallback={cellClick}
            onRowClickCallback={rowClick}
            
        />
    </div>,
    document.getElementById('app')
);
