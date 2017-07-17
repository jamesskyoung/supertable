import React from 'react';
import ReactDOM from 'react-dom';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import SuperTablePaginator from '../lib/SuperTablePaginator.jsx';

class PaginatorExample extends SuperTablePaginator {
  constructor(props) {
    super(props);
    this._stInstance = this.props.superTableInstance;
  }

render() {
    console.log('paginator example...')
    console.log(this)
    console.log(this._stInstance.props);
    //this._stInstance._stInstance.exCB.call(this._stInstance._stInstance, 'hello');
    let rowsPerPage = [10, 20, 50, 100];
    return (
      <div>
        <div style={{ clear: 'both', float: 'left', width: this._stInstance.state.tableWidth }}>
          <div style={{ width: '33.3%', float: 'left' }}>{this._stInstance.props.showText}
            &nbsp;

            <DropdownButton id='rowsPerPage' title={this._stInstance.state.rowsPerPage} className='btn btn-default'>
              {rowsPerPage.map((number, index) => (

                <MenuItem key={index} id={number} href='#'
                  onClick={(event) => {
                    this._stInstance._onChangeRowsPerPage(number)
                  }

                  }>
                  {number}
                </MenuItem>
              ))}
            </DropdownButton>

            &nbsp;
              {this._stInstance.props.itemsPerPageText}
          </div>

          <div style={{ width: '33.3%', float: 'left', textAlign: 'center', lineHeight: '32px' }}>
            Page {Math.ceil(this._stInstance._currentRow / this._stInstance.state.rowsPerPage) + 1}
            &nbsp;of&nbsp;
              {Math.ceil(this._stInstance.state.sortedDataList.getSize() / this._stInstance.state.rowsPerPage)}
          </div>

          <div style={{ width: '33.3%', float: 'left', textAlign: 'right', lineHeight: '32px' }}>
            <i title='First page' style={{ cursor: 'pointer' }} className='fa fa-chevron-left'
              onClick={((event) => {
                this.pageFirst();
              })}>
            </i>
            <i title='First page' style={{ cursor: 'pointer' }} className='fa fa-chevron-left'
              onClick={((event) => {
                this.pageFirst();
              })}>
            </i>
            &nbsp;&nbsp;
              <i title='Previous page' style={{ cursor: 'pointer', padding: '4px' }} className='fa fa-chevron-left' onClick={((event) => {
              this.pageBackward();
            })}>
            </i>
            &nbsp;
              <i title='Next page' style={{ cursor: 'pointer' }} className='fa fa-chevron-right'
              onClick={((event) => {
                this.pageForward();
              })}>
            </i>
            &nbsp;&nbsp;
              <i title='Last page' style={{ cursor: 'pointer' }} className='fa fa-chevron-right'
              onClick={((event) => {
                this.pageLast();
              })}>
            </i>
            <i title='Last page' style={{ cursor: 'pointer' }} className='fa fa-chevron-right'
              onClick={((event) => {
                this.pageLast();
              })}>
            </i>

          </div>
        </div>
      </div>
    )
  }
}

export default PaginatorExample;
