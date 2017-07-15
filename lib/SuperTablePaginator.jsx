import React from 'react';
import ReactDOM from 'react-dom';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

class SuperTablePaginator extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        console.log( 'stp')
        console.log( this )
        console.log( this.props );
        this.props.superTableInstance.exCB.call( this.props.superTableInstance, 'hello' );
        return (
            <div>
                <h1>Paginator</h1>
                {this.props.rowsPerPage}
                Number of rows: {this.props.rowsperPage}
            </div>
        )
    }
}

export default SuperTablePaginator;
