/**
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK/JAMES YOUNG BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * TODO:
 * Paging.. only show rows x-y.   
 * Lazy loading.  Might only have 'x' rows... need api to update data array and repaint etc.. but also include paging info
 *
 * Set cell renderer
 * 
 */
//fixedDataTableLayout_main public_fixedDataTable_main
//box-shadow: 1px 2px 30px #888888;
"use strict";

import FixedDataTable from 'fixed-data-table';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
require('../../node_modules/fixed-data-table/dist/fixed-data-table.css');
import SuperTableStore from '../../app/SuperTableStore';

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
    return (
      <Cell {...props}>
        <a onClick={this._onSortChange}>
          {children} {sortDir ? (sortDir === SortTypes.DESC ? '↓' : '↑') : ''}
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
    this._name = this.props.name;
    this._cellData = this.props.data.getObjectAt(this.props.rowIndex)[this.props.columnKey];
    this._data = this.props.data.getObjectAt(this.props.rowIndex);

  }

  clickEventHandler(e) {
    
    this.props.onClick(e, this.props.rowIndex, this._name, this._data);
  }

  render() {
    let props = this.props;
    return (
      <Cell {...props} onClick={this.clickEventHandler.bind(this)}>
        {this.props.renderer( this.props.rowIndex, this._data, this.props.columnKey )}
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
    this._name = this.props.name;
    this._cellData = this.props.data.getObjectAt(this.props.rowIndex)[this.props.columnKey];
    this._data = this.props.data.getObjectAt(this.props.rowIndex);
  }

  clickEventHandler(e) {
    this.props.onClick(e, this.props.rowIndex, this._name, this._data);
  }

  render() {
    let props = this.props;
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
 * Table... James Young
 * 
 * 
 */
class SuperTable extends React.Component {

  constructor(props) {
    super(props);
    console.log('The data length is: ' + props.data.length);

    this._dataList = new SuperTableStore(props.data);
    this._columnMeta = props.columnMeta || null;
    this._defaultSortIndexes = [];
 
    var size = this._dataList.getSize();
    for (var index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }

    this.state = {
      dataAttrNames: [],
      sortedDataList: this._dataList,
      colSortDirs: {},
      displayMode: 'none',
      tableWidth: 0,
      columnWidths: {}
    };

    this._onSortChange = this._onSortChange.bind(this);
    this._onColumnResizeEndCallback = this._onColumnResizeEndCallback.bind(this);
  }



  /**
   * componentDidMount = DOM ready.  We can use ReactDOM to find our elements via refs.
   * 
   * IF this table is in percentages.. then adjust based on owning div size (found via ref)
   * 
   */
  componentDidMount() {
    
    if (_.isNumber(this.props.tableWidth)) {
      console.log('Table width is numeric.. just return.');
      return;
    }

    let tableWidth = parseInt(this.props.tableWidth.replace('%', ''));
 
    let table = ReactDOM.findDOMNode(this.refs.superTable);
    let rect = table.getBoundingClientRect();
    let tableWidthPixels = rect.width * (tableWidth / 100);

    let tableInPercentage = false;

    this._columnMeta.map((colObj, index) => {
      console.log('cdm: is a number..? ' + colObj.width)

      if (!_.isNumber(colObj.percentage)) {
        tableInPercentage = true;
        let percent = parseInt(colObj.percentage.replace('%', ''));
        let newWidth = tableWidthPixels * (percent / 100);
        colObj.width = Math.round(newWidth);
      }
    });

    let columnWidths = {};
    this._columnMeta.map((colObj, index) => {
      columnWidths[colObj.attribute] = colObj.width;

      console.log('zzz ' + columnWidths[colObj.attribute]);
    });

    if (tableInPercentage) {
      this.setState({ displayMode: 'block', tableWidth: tableWidthPixels, columnWidths: columnWidths });
    } else {
      this.setState({ columnWidths: columnWidths });
    }
  }

  componentWillMount() {

    // get all attribute names from the data..
    let dataAttrNames = this._getDataAttributes(this.props.data[0]);

    // Now, if we have don't have columnMetata data, use our attribute names instead for headers
    this._setColumnMetaData(dataAttrNames);
    this._setWidths();

    this.setState(
      {
        dataAttrNames: dataAttrNames,
        tableWidth: this._tableWidth
      }
    );

  }

  /**
   * Set the attribute names in our state.
   */
  _getDataAttributes(row) {

    let dataAttrNames = [];
    for (var name in row) {
      console.log('Name: ' + name);
      dataAttrNames.push(name)
    }

    return dataAttrNames;

  }

  _setColumnMetaData(dataAttrNames) {

    if (this._columnMeta === null) {

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
      console.log('sw: is a number..? ' + colObj.width)
      let columnWidths = {};
      if (!_.isNumber(colObj.width)) {
        colObj.percentage = colObj.width;
        console.log('sw: not a number..' + colObj.width + ' percentage? ' + colObj.percentage);

        colObj.width = 100;
      }
      columnWidths[colObj.attribute] = colObj.width;
      console.log('xxxx ' + columnWidths[colObj.attribute]);
      tableWidth += colObj.width;
      console.log(colObj.header + '___' + colObj.width);
      //tableWidth += colObj.width;
    });

    this._tableWidth = tableWidth;

    this.setState({ columnWidths: columnWidths });

  }

  _setWidthFromTable() {
    alert(this.props.tableWidth);

  }

  _onColumnResizeEndCallback(newColumnWidth, columnKey) {

    this.setState(({ columnWidths }) => ({
      columnWidths: {
        ...columnWidths,
        [columnKey]: newColumnWidth,
      }
    }));

  }

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

    this.setState({
      sortedDataList: new DataListWrapper(sortIndexes, this._dataList),
      colSortDirs: {
        [columnKey]: sortDir,
      },
    });
  }

  _onFilter(filterText) {

    let tempList = [];
    /* Iterate thru all columns matching text to value */
    this._dataList.map((row, index) => {
      console.log('Row is: ' + row.id + ' ' + index);
    });
  }

  _onRowClick(event, index) {
    console.log('here is the event:', event,
      'the index:', index);
    let row = this.state.sortedDataList.getObjectAt(index);
    this.props.onRowClickCallback(row);
  }

  _onCellClick(event, index, column, data ) {
   // alert('hey..' + column + ' ' + this.props.onCellClickCallback( column, data ));
    this.props.onCellClickCallback( index, column, data )

  }

  render() {
    if (this.state.dataAttrNames.length === 0 || this.state.tableWidth === 0) {
      return <span />
    }

    var { sortedDataList, colSortDirs } = this.state;

    this._columnMeta.map((col, index) => {
      console.log('in render: ' + col.header + ' ' + col.attribute + ' ' + col.width);
    });
    console.log(' Table width: ' + this.state.tableWidth)
    console.log('column widths: ' + this.state.columnWidths);

    // calculate widths
    // table width an dindividual cell widths (if not provided.)
    return (
      <div ref='superTable' >
        <Table style={{ display: this.state.displayMode }}
          rowHeight={this.props.rowHeight ? this.props.rowHeight : 50}
          rowsCount={sortedDataList.getSize()}
          headerHeight={this.props.headerHeight ? this.props.headerHeight : 50}
          width={this.state.tableWidth}
          height={this.props.height ? this.props.height : 500}
          isColumnResizing={false}
          onColumnResizeEndCallback={this._onColumnResizeEndCallback}
          onRowClick={this._onRowClick.bind(this)}
          {...this.props}>

          {this._columnMeta.map((col, index) => {
            let renderer = <TextCell onClick={this._onCellClick.bind(this)} data={sortedDataList} name={col.attribute} />
            if ( undefined !== col.renderer ) {
              renderer = <CustomCell renderer={col.renderer} onClick={this._onCellClick.bind(this)} data={sortedDataList} name={col.attribute} />
            }

            return <Column
              key={index}
              columnKey={col.attribute}
              header={
                <SortHeaderCell
                  onSortChange={this._onSortChange}
                  sortDir={colSortDirs[col.attribute]}>
                  {col.header}
                </SortHeaderCell>
              }

              isResizable={col.resize ? col.resize : true}
              cell={renderer}
              width={this.state.columnWidths[col.attribute]}

            //minWidth={col.minWidth ? col.minWidth : 0}
            //maxWidth={col.maxWidth ? col.maxWidth : 222}

            />
          })}

        </Table>

        <button onClick={this._onFilter.bind(this)}>Filter</button>
      </div>
    );
  }
}

module.exports = SuperTable;

// cell={<TextCell onClick={this._onCellClick.bind(this)} data={sortedDataList} name={col.attribute} />}


