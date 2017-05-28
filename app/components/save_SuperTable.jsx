/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
//fixedDataTableLayout_main public_fixedDataTable_main
//box-shadow: 1px 2px 30px #888888;
"use strict";

var FakeObjectDataListStore = require('../../node_modules/fixed-data-table/examples/helpers/FakeObjectDataListStore');
var FixedDataTable = require('fixed-data-table');
var React = require('react');
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

const TextCell = ({ rowIndex, data, columnKey, ...props }) => (
  <Cell {...props}>
    {data.getObjectAt(rowIndex)[columnKey]}

  </Cell>
);

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


class SuperTable extends React.Component {

  constructor(props) {
    super(props);
    console.log('The data length is: ' + props.data.length);

    this._dataList = new SuperTableStore(props.data);
    this._columnMeta = props.columnMeta || null;
  //  alert( this._columnMeta );


    this._defaultSortIndexes = [];
    var size = this._dataList.getSize();
    for (var index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }

    this.state = {
      dataAttrNames: [],
      sortedDataList: this._dataList,
      colSortDirs: {}
    };

    this._onSortChange = this._onSortChange.bind(this);

  }

  componentDidMount() {

    this._getDataAttributes(this.props.data[0]);

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
    this.setState({ dataAttrNames: dataAttrNames });
    
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

 
  render() {
    if (  this.state.dataAttrNames.length === 0 ) {
      return <span />
    }
   
    var { sortedDataList, colSortDirs } = this.state;

    this._columnMeta.map((col, index) => {
      console.log( col.header + ':' + col.attribute );
    });

    return (
      <Table
        rowHeight={50}
        rowsCount={sortedDataList.getSize()}
        headerHeight={50}
        width={1000}
        height={500}
        {...this.props}>

        {this.state.dataAttrNames.map((columnName, index) => {
          console.log( '>>>>>>>>>>>>> ' + columnName );
          return <Column
          key={index}
            columnKey={columnName}
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs[columnName]}>
                {columnName}
              </SortHeaderCell>
            }
            cell={<TextCell data={sortedDataList} />}
            width={200}
          />
        })}

      </Table>
    );
  }
}

module.exports = SuperTable;


