/**
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK/SONY INTERACTIVE ENTERTAINMENT BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * (c) SIE, 2017
 * 
 */

"use strict";
import _ from 'lodash';
import FixedDataTable from 'fixed-data-table';
import React from 'react';
import ReactDOM from 'react-dom';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import SuperTableStore from './SuperTableStore';

//require('./fixed-data-table.css');

const { Table, Column, Cell } = FixedDataTable;

var SortTypes = {
  ASC: 'ASC',
  DESC: 'DESC',
};

function reverseSortDirection(sortDir) {
  return sortDir === SortTypes.DESC ? SortTypes.ASC : SortTypes.DESC;
}

class SortHeaderCell extends React.Component {
  constructor(props) {
    super(props);

    this._onSortChange = this._onSortChange.bind(this);
  }

  render() {
    var { sortDir, children, ...props } = this.props;
    var upArrow = '<i class="fa fa-arrow-up" aria-hidden="true"></i>';
    var downArrow = '<i class="fa fa-arrow-down" aria-hidden="true"></i>';
    return (
      <Cell {...props}>
        <a onClick={this._onSortChange}>
          {children} {sortDir ? (sortDir === SortTypes.DESC ?
            <span dangerouslySetInnerHTML={{ __html: upArrow }} />
            :
            <span dangerouslySetInnerHTML={{ __html: downArrow }} />
          )

            : ''}
        </a>
      </Cell>
    );
  }

  _onSortChange(e) {
    e.preventDefault();

    if (this.props.onSortChange) {
      this.props.onSortChange(
        this.props.columnKey,
        this.props.sortDir ?
          reverseSortDirection(this.props.sortDir) :
          SortTypes.DESC
      );
    }
  }
}


/**
 * Default component to render data
 */
class CustomCell extends React.Component {
  constructor(props) {
    super(props);

  }

  clickEventHandler(e) {

    this.props.onClick(e, this.props.rowIndex, this._name, this._data);
  }

  render() {
    let props = this.props;
    this._name = this.props.name;
    this._cellData = this.props.data.getObjectAt(this.props.rowIndex)[this.props.columnKey];
    this._data = this.props.data.getObjectAt(this.props.rowIndex);

    return (
      <Cell {...props} onClick={this.clickEventHandler.bind(this)}>
        {this.props.renderer(this.props.rowIndex, this._data, this.props.columnKey)}
      </Cell>
    )
  }
}

/**
 * Default component to render data
 */
class TextCell extends React.Component {
  constructor(props) {
    super(props);
  }

  clickEventHandler(e) {
    this.props.onClick(e, this.props.rowIndex, this._name, this._data);
  }

  render() {

    let props = this.props;
    this._name = this.props.name;
    this._cellData = this.props.data.getObjectAt(this.props.rowIndex)[this.props.columnKey];
    this._data = this.props.data.getObjectAt(this.props.rowIndex);

    return (
      <Cell {...props} onClick={this.clickEventHandler.bind(this)}>
        {this._cellData}
      </Cell>
    )
  }
}

/**
 * Wrapper around our data
 */
class DataListWrapper {
  constructor(indexMap, data) {
    this._indexMap = indexMap;
    this._data = data;
  }

  getSize() {
    return this._indexMap.length;
  }

  getObjectAt(index) {
    return this._data.getObjectAt(
      this._indexMap[index],
    );
  }
}

/**
 * SuperTable... 
 * 
 * James Young 
 * 
 * 
 */
class SuperTable extends React.Component {

  constructor(props) {
    super(props);
    this._init();

    var size = this._dataList.getSize();
    for (var index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }

    // Get rows per page from local storage... if null, use props
    let rowsPerPage = localStorage.getItem("pmdb_rowsPerPage");

    if (rowsPerPage == null) {
      rowsPerPage = this.props.rowsPerPage === undefined ? 0 : this.props.rowsPerPage;
    }

    // But only use rowsPerPage IF showPagination is true
    let showPagination = this.props.showPagination === undefined ? false : this.props.showPagination;
    if (!showPagination) {
      rowsPerPage = 0;
    }

    this.state = {
      columnWidths: {},
      colSortDirs: {},
      dataAttrNames: [],
      filterBy: '',
      rowsPerPage: parseInt(rowsPerPage),
      shouldRender: false,
      showPagination: showPagination,
      sortedDataList: this._dataList,
      startPageRow: 0,
      tableWidth: 0
    };

    this._currentRow = 0;  // Used for paging...
    this._tableHeight = this.props.tableHeight,
    this._visibleRows = size;
    this._onSortChange = this._onSortChange.bind(this);
    this._onColumnResizeEndCallback = this._onColumnResizeEndCallback.bind(this);
  }

  /**
   * 
   */
  _init() {
  
    this._dataList = new SuperTableStore(this.props.data);
    this._columnMeta = this.props.columnMeta || null;
    this._defaultSortIndexes = [];
  }

  /******************************************************************************************
   * 
   * Keep React lifecycle methods at the top of this source file
   * 
   *****************************************************************************************/


  /**
   * componentDidMount = DOM ready.  We can use ReactDOM to find our elements via refs.
   * 
   * IF this table is in percentages.. then adjust based on owning div size (found via ref)
   * 
   */
  componentDidMount() {
   
    this._processTableProperties();
  }


  /**
   * Called before component is placed into the DOM.  use this like you would 
   * an init function etc.
   */
  componentWillMount() {
    console.log( 'copmon will mount..' );
    console.log( this.props.data );
    // get all attribute names from the data..
    let dataAttrNames = this._getDataAttributes(this.props.data[0]);

    // Now, if we have don't have columnMetata data, use our attribute names instead for headers
    this._setColumnMetaData(dataAttrNames);
    this._setWidths();

    this.setState(
      {
        dataAttrNames: dataAttrNames
      }
    );

  }

  shouldComponentUpdate() {
   
    return this._processTableProperties();
  }

  /**
  * Filter dataset based on filterBy 
  * 
  * We also adjust the table height here too...
  * 
  * @param {*} filterBy 
  * @return filtered list (array)
  */
  _doFilter(filterBy) {

    var size = this._dataList.getSize();
    var filteredData = [];
    for (var index = 0; index < size; index++) {

      var dataObj = this._dataList.getObjectAt(index);
      for (var columnIndex = 0; columnIndex < this._columnMeta.length; columnIndex++) {
        var col = this._columnMeta[columnIndex];
        let value = dataObj[col.attribute];
        if (_.isNumber(value)) {
          value = value.toString();
        }

        if (value.toLowerCase().indexOf(filterBy) !== -1) {
          filteredData.push(dataObj);
          break;
        }
      }
    }

    let newDataList = new SuperTableStore(filteredData)
    this._defaultSortIndexes = [];
    var size = newDataList.getSize();
    for (var index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }

    // Store
    this._visibleRows = size;
    this._currentRow = 0; // need ot reset current row to 0
    return newDataList;

  }


  /**
   * Set the attribute names in our state.
   */
  _getDataAttributes(row) {

    let dataAttrNames = [];
    for (var name in row) {
      dataAttrNames.push(name)
    }

    return dataAttrNames;

  }

  /**
   * Return a page of data..
   */
  _getPage(sortedDataList) {

    if (0 === this.state.rowsPerPage) {
      return sortedDataList;
    }

    let rowsToReturn = this.state.rowsPerPage;
    if (rowsToReturn > sortedDataList.getSize()) {
      rowsToReturn = sortedDataList.getSize();
    }

    let viewPage = [];
    let currentRow = this._currentRow;
    let endRow = currentRow + rowsToReturn;

    for (currentRow; currentRow < endRow; currentRow++) {
      if (currentRow === sortedDataList.getSize()) {
        break;
      }
      var dataObj = sortedDataList.getObjectAt(currentRow);
      viewPage.push(dataObj);
    }

    if (this.state.shouldRender) {
      // Only update if we can show the table...
      this._currentRow = currentRow;
    }

    this._rowsOnPage = viewPage.length;
    return new SuperTableStore(viewPage)

  }

  _processTableProperties() {
    let table = ReactDOM.findDOMNode(this.refs.superTable);
    if (table === null) {
      return false;;
    }

    if (_.isNumber(this.props.tableWidth)) {
      this.setState({ shouldRender: true, tableWidth: this.props.tableWidth });
      return true;
    }

    let tableWidth = parseInt(this.props.tableWidth.replace('%', ''));

    let rect = table.getBoundingClientRect();
    let tableWidthPixels = rect.width * (tableWidth / 100);
    if (tableWidthPixels == 0) {
      return false;
    }

    let tableInPercentage = false;

    this._columnMeta.map((colObj, index) => {

      if (!_.isNumber(colObj.percentage)) {
        tableInPercentage = true;
        let percent = parseInt(colObj.percentage.replace('%', ''));
        let newWidth = tableWidthPixels * (percent / 100);
        colObj.width = Math.floor(newWidth);
      }
    });

    let columnWidths = {};
    this._columnMeta.map((colObj, index) => {
      columnWidths[colObj.attribute] = colObj.width;

    });

    if (tableInPercentage) {
      this.setState({ shouldRender: true, tableWidth: tableWidthPixels, columnWidths: columnWidths });
    } else {
      this.setState({ shouldRender: true, columnWidths: columnWidths });
    }
    return true;
  }


  /**
   * Compute real table height.
   * 
   * height = visible rows * row_height + header_height
   * If this is less than props.tableHeight, then use that.
   * 
   * Why do we do this?  Pagination generally appears after the table -- along with 
   * other 'controls'.  SO useful to have them appear right afte rthe table.
   * 
   * Generally, this is effective when the data is filtered.
   * 
   */
  _getTableHeight() {

    // Compute table height...
    let th = (this.props.tableHeight === undefined ? this.props.tableHeight : 500);
    let rh = (this.props.rowHeight ? this.props.rowHeight : 50);
    let hh = (this.props.headerHeight ? this.props.headerHeight : 50);
    th = this._visibleRows * rh + hh;
    if (th < this.props.tableHeight) {
      return th;
    } else {
      return this.props.tableHeight;
    }
  }

  /**
   * CELL Click event.. if we have a cell click handler, call it 
   * @param {*} event 
   * @param {*} index 
   * @param {*} column 
   * @param {*} data 
   */
  _onCellClick(event, index, column, data) {
    // alert('hey..' + column + ' ' + this.props.onCellClickCallback( column, data ));
    if (undefined === this.props.onCellClickCallback) {
      return;
    }

    this.props.onCellClickCallback(index, column, data)
  }

  /**
   * Change numbe rof rows per page to be viewed.  Refresh the page which is why
   * we substract frm current row -- which is always pointing to the NEXT page
   * @param {*} e 
   */
  _onChangeRowsPerPage(rowsPerPage) {

    localStorage.setItem("pmdb_rowsPerPage", parseInt(rowsPerPage));

    // Just force redisplay.  Decrement start row by 2 * rowsperPage
    let rowsToReturn = this.state.rowsPerPage;
    let currentRow = this._currentRow;

    currentRow = currentRow - rowsToReturn - this._rowsOnPage;
    if (currentRow < 0) {
      currentRow = 0;
    }

    this._currentRow = currentRow;
    this.setState({ rowsPerPage: parseInt(rowsPerPage) });

  }

  /**
   * Called after resize is done
   * @param {*} newColumnWidth 
   * @param {*} columnKey 
   */
  _onColumnResizeEndCallback(newColumnWidth, columnKey) {
    // Just force redisplay.  Decrement start row by 2 * rowsperPage
    let rowsToReturn = this.state.rowsPerPage;
    let currentRow = this._currentRow;
    //currentRow = currentRow - (2 * rowsToReturn);
    currentRow = currentRow - rowsToReturn - this._rowsOnPage;
    if (currentRow < 0) {
      currentRow = 0;
    }

    this._currentRow = currentRow;

    // 
    this.setState(({ columnWidths }) => ({
      columnWidths: {
        ...columnWidths,
        [columnKey]: newColumnWidth,
      }
    }));

  }

  /**
    * Filter current dataset.  
    * @see _doFilter
    * 
    * @param {*} e 
    */
  _onFilterChange(e) {
    if (!e.target.value) {
      this.setState({
        sortedDataList: this._dataList,
      });
    }

    let filterBy = e.target.value.toLowerCase();
    let newDataList = this._doFilter(filterBy);
    this.setState({
      sortedDataList: newDataList,
      filterBy: filterBy
    });
  }

  /**
   * Row has been clicked.. call handler (if present)
   * @param {*} event 
   * @param {*} index 
   */
  _onRowClick(event, index) {
    if (undefined === this.props.onRowClickCallback) {
      return;
    }

    let row = this.state.sortedDataList.getObjectAt(index);
    this.props.onRowClickCallback(row);
  }


  /**
   * Sort data set by column
   * @todo: 
   * @param {*} columnKey 
   * @param {*} sortDir 
   */
  _onSortChange(columnKey, sortDir) {
    var sortIndexes = this._defaultSortIndexes.slice();
    sortIndexes.sort((indexA, indexB) => {
      var valueA = this._dataList.getObjectAt(indexA)[columnKey];
      var valueB = this._dataList.getObjectAt(indexB)[columnKey];
      var sortVal = 0;

      if (valueA > valueB) {
        sortVal = 1;
      }
      if (valueA < valueB) {
        sortVal = -1;
      }
      if (sortVal !== 0 && sortDir === SortTypes.ASC) {
        sortVal = sortVal * -1;
      }

      return sortVal;
    });

    let filterList = this._dataList;
    if (this.state.filterBy.length > 0) {
      // We have a filter.. use it.
      filterList = this._doFilter(this.state.filterBy);
    } else {
      this._currentRow = 0; // need to reset current row to 0
    }
    this.setState({
      sortedDataList: new DataListWrapper(sortIndexes, filterList /*this._dataList */),
      colSortDirs: {
        [columnKey]: sortDir
      },
    });
  }

  _pageBackward() {

    // Just force redisplay.  Decrement start row by 2 * rowsperPage
    let rowsToReturn = this.state.rowsPerPage;
    let currentRow = this._currentRow;
    //currentRow = currentRow - (2 * rowsToReturn);
    currentRow = currentRow - rowsToReturn - this._rowsOnPage;
    if (currentRow < 0) {
      currentRow = 0;
    }
    this._currentRow = currentRow;
    this.setState({ redisplay: true });

  }

  _pageFirst() {

    this._currentRow = 0;
    this.setState({ redisplay: true });
  }

  _pageForward() {

    if (this._currentRow === this.state.sortedDataList.getSize()) {
      return;
    }
    // Just force redisplay.  Start row will simply be incremented...
    this.setState({ redisplay: true });
  }

  _pageLast() {
    this._currentRow = (this.state.sortedDataList.getSize() - this.state.rowsPerPage)
    if (this._currentRow < 0) {
      this._currentRow = 0;
    }

    // Just force redisplay.  Start row will simply be incremented...
    this.setState({ redisplay: true });
  }

  /**
    * 
    * @param {*} dataAttrNames 
    */
  _setColumnMetaData(dataAttrNames) {

    if (undefined === this._columnMeta || null === this._columnMeta) {

      this._columnMeta = [];
      dataAttrNames.map((col, index) => {
        let colObj = {};
        colObj.header = col;
        colObj.width = 200;
        colObj.attribute = col;
        this._columnMeta.push(colObj);
      });
    }
  }

  /**
   * If table is set to a percentage, set it to 1000px.  componentDidMount will adjust
   * it accordingly.
   * 
   * Also, if table is a percentage, then the individual columns have to be a percentage as well.  If they are not,
   * then just appoportion the column width equally.
   */
  _setWidths() {
    let columnWidths = {};
    let tableWidth = 0; //1000;
    this._columnMeta.map((colObj, index) => {

      let columnWidths = {};
      if (!_.isNumber(colObj.width)) {
        colObj.percentage = colObj.width;
        colObj.width = 100;
      }
      columnWidths[colObj.attribute] = colObj.width;
      tableWidth += colObj.width;
    });

    this._tableWidth = tableWidth;
    this.setState({ columnWidths: columnWidths });

  }

  _getTableWidth() {


  }

  /**
   * REACT Render method.
   */
  render() {


    if (this.state.dataAttrNames.length === 0) {
      console.error('cannot render. attrnames length: ' + this.state.dataAttrNames.length + ' Width: ' + this.state.tableWidth);
      return <span />
    }

    var { sortedDataList, colSortDirs } = this.state;
    let filterState = { display: 'block', clear: 'both', float: 'left', width: '50%' };
    let paginationShow = { display: 'block' };

    if (this.props.showFilter !== undefined && !this.props.showFilter) {
      filterState = { display: 'none' }
    }

    if (this.props.showPagination !== undefined && !this.props.showPagination) {
      paginationShow = { display: 'none' }

    }

    paginationShow.marginTop = '24px';
    var viewList = this._getPage(sortedDataList);
    let rowsPerPage = [10, 20, 50, 100];

    return (
      <div style={{ width: '100%' }} ref='superTable' >

        <div style={{ width: this.state.tableWidth }}>

          <div style={filterState}>
            <div className="icon-addon addon-lg">

              <input style={{ width: '80%' }} id="ps_Search" type="text" placeholder={this.props.filterPlaceholder}
                onChange={this._onFilterChange.bind(this)} className="form-control" />

              <label htmlFor="ps_Search" className="glyphicon glyphicon-search" rel="tooltip" title="Search"></label>

            </div>
            <br />
          </div>
          <div style={{ float: 'right', fontWeight: 'bold', lineHeight: '50px' }}>
            {sortedDataList.getSize()} {this.props.totalRowCountText}
          </div>
        </div>

        <div style={{ clear: 'both' }}>
          <Table
            rowHeight={this.props.rowHeight ? this.props.rowHeight : 50}
            rowsCount={viewList.getSize()}
            headerHeight={this.props.headerHeight ? this.props.headerHeight : 50}
            width={this.state.tableWidth}
            //height={this.props.tableHeight ? this.props.tableHeight : 500}
            height={this._getTableHeight() + 2}
            isColumnResizing={false}
            onColumnResizeEndCallback={this._onColumnResizeEndCallback}
            onRowClick={this._onRowClick.bind(this)}
            {...this.props}>

            {this._columnMeta.map((col, index) => {
              let renderer = <TextCell onClick={this._onCellClick.bind(this)} data={viewList} name={col.attribute} />
              if (undefined !== col.renderer) {
                renderer = <CustomCell renderer={col.renderer} onClick={this._onCellClick.bind(this)} data={viewList} name={col.attribute} />
              }

              return <Column
                key={index}
                columnKey={col.attribute}
                header={
                  <SortHeaderCell
                    onSortChange={this._onSortChange}  // Causes warning.. ignore it
                    sortDir={colSortDirs[col.attribute]}>
                    {col.header}
                  </SortHeaderCell>
                }

                isResizable={col.resize ? col.resize : false}  // Default to false
                cell={renderer}
                width={this.state.columnWidths[col.attribute] === undefined ? 10 : this.state.columnWidths[col.attribute]}

              //minWidth={col.minWidth ? col.minWidth : 0}
              //maxWidth={col.maxWidth ? col.maxWidth : 222}

              />
            })}
          </Table>

          <div style={paginationShow}>
            <div style={{ clear: 'both', float: 'left', width: this.state.tableWidth }}>
              <div style={{ width: '33.3%', float: 'left' }}>{this.props.showText}
                &nbsp;

                <DropdownButton id='rowsPerPage' title={this.state.rowsPerPage} className='btn btn-default'>
                  {rowsPerPage.map((number, index) => (

                    <MenuItem key={index} id={number} href='#'
                      onClick={(event) => {
                        this._onChangeRowsPerPage(number)
                      }

                      }>
                      {number}
                    </MenuItem>
                  ))}
                </DropdownButton>

                &nbsp;
              {this.props.itemsPerPageText}
              </div>

              <div style={{ width: '33.3%', float: 'left', textAlign: 'center', lineHeight: '32px' }}>
                Page {Math.ceil(this._currentRow / this.state.rowsPerPage)}
                &nbsp;of&nbsp;
              {Math.ceil(this.state.sortedDataList.getSize() / this.state.rowsPerPage)}
              </div>

              <div style={{ width: '33.3%', float: 'left', textAlign: 'right', lineHeight: '32px' }}>
                <i title='First page' style={{ cursor: 'pointer' }} className='fa fa-chevron-left'
                  onClick={((event) => {
                    this._pageFirst();
                  })}>
                </i>
                <i title='First page' style={{ cursor: 'pointer' }} className='fa fa-chevron-left'
                  onClick={((event) => {
                    this._pageFirst();
                  })}>
                </i>
                &nbsp;&nbsp;
              <i title='Previous page' style={{ cursor: 'pointer', padding: '4px' }} className='fa fa-chevron-left' onClick={((event) => {
                  this._pageBackward();
                })}>
                </i>
                &nbsp;
              <i title='Next page' style={{ cursor: 'pointer' }} className='fa fa-chevron-right'
                  onClick={((event) => {
                    this._pageForward();
                  })}>
                </i>
                &nbsp;&nbsp;
              <i title='Last page' style={{ cursor: 'pointer' }} className='fa fa-chevron-right'
                  onClick={((event) => {
                    this._pageLast();
                  })}>
                </i>
                <i title='Last page' style={{ cursor: 'pointer' }} className='fa fa-chevron-right'
                  onClick={((event) => {
                    this._pageLast();
                  })}>
                </i>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

exports.default = SuperTable;