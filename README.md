# WORK IN PROGRESS
## React Programmable Table based on fixed-data-table
### Features
* Sortable columns
* Table/column widths in percentages or pixels
* Filtering
* Pagination.  Can also extend base paginator to create your own
* Customise columns for width, content and use 'custom renderers' when you need to

## Install from NPM
install reactsupertable --save

## Basic usage 
The table expects a JSON dataset.  For example, a dataset that looks like this..


```
[{
	"id": 0,
	"avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/imammuht/128.jpg",
	"city": "Alyshaborough",
	"email": "Elbert_Feest4@hotmail.com",
	"firstName": "Vaughn",
	"lastName": "D'Amore",
	"street": "Schultz Course",
	"zipCode": "39894",
	"date": "2016-08-24T09:06:37.283Z",
	"bs": "real-time disintermediate e-services",
	"catchPhrase": "Ameliorated national project",
	"companyName": "Glover - Fritsch",
	"words": "voluptatem excepturi vel",
	"sentence": "Soluta qui molestiae aliquid aut inventore voluptas voluptates."
}, {
	"id": 1,
	"avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/iamjdeleon/128.jpg",
	"city": "Lakinton",
	"email": "Davion.West@hotmail.com",
	"firstName": "Leland",
	"lastName": "Ortiz",
	"street": "Joy Ports",
	"zipCode": "13648",
	"date": "2017-04-28T16:55:26.405Z",
	"bs": "out-of-the-box innovate architectures",
	"catchPhrase": "Synergistic actuating success",
	"companyName": "Johnson - Grant",
	"words": "aut et aperiam",
	"sentence": "Dolore qui facere voluptas sed ipsum quis sapiente aut quae."
}, {
	"id": 2,
	"avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/jarsen/128.jpg",
	"city": "Windlerside",
	"email": "Hassie.Ruecker54@gmail.com",
	"firstName": "Kole",
	"lastName": "Gislason",
	"street": "Vida Drive",
	"zipCode": "75116-0721",
	"date": "2017-05-09T22:26:06.088Z",
	"bs": "integrated generate action-items",
	"catchPhrase": "Re-contextualized multi-state customer loyalty",
	"companyName": "Ondricka Inc",
	"words": "ut blanditiis amet",
	"sentence": "Culpa quis et sint."
}]

```

Let's assume we only want to show id, firstName, lastName, and, city in the table.  In our column metadata, we would have:

```
function getColumnMetaData() {
    return [
        { 'header': 'ID', 'width': '10%', attribute: 'id' },
        { 'header': 'First name', 'width': '20%', attribute: 'firstName' },
        { 'header': 'Last name', 'width': '20%', attribute: 'lastName' },
        { 'header': 'City', 'width': '20%', attribute: 'city'}

    ]
}

```

And our table Component (with paging) would look like this:


```
<SuperTable 
            ref={instance => { window.superTable = instance; }}
            columnMeta={ getColumnMetaData() }
            data={data}
            filterPlaceholder='Filter...'
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

```
### Important

Although only the attributes that are defined within the column metadata object are shown, the object that is passed back on a cell click or row click event is the entire row.  This makes it easy to get data that is not visible 'on screen'. A good use of this is say, an 'id' field that the user doesn't need to know about...but is needed for subsequent operations etc.

## Properties

Property | Meaning |
-------|---------|
columnMeta | An array of Objects that define each column.  Attributes include header, attribute, width, renderer |
data | Your data.  Generally, an array of 'rows'.  Only the attributes tat are contained in the columnMeta object are displayed. |
filterPlaceholder | The string that will be used as the placeholder text in the search input field. |
itemsPerPageText | The text that will be used when oagination is active for 'items per page' |
onCellClickCallback | A function that will be invoked when a **cell** is clicked |
onRowClickCallback | A function that will be invoked when a **row** is clicked |
rowsPerPage | How many rows will be displayed per page (affects pagination if active) |
showItemsPerPage | True or False. Show items per page? |
showItemsPerPageText | The items per page text.  Ex: rows per page. (See showText) |
showPagination | True, False. Show the pagination component?  If false, then the entire dataset is shown. |
showText | Text to use for 'show'.  i.e. Show nnn rows per page.  (See showItemsPerPageText) |
showTotalRowCount | True, False. Show how many items are in the dataset? (Applies to a filter as well.) |
tableHeight | Height in pixels of the table |
tableWidth | Pixels or Percent.  i.e. 1000px or 76% |
totalRowCountText | The text to use to show the number of items in the dataset. |
pagination | The paginator component.  Only needed if you have written your own paginator component (extending the base Pagniator) |



## Column Meta Data
Each attribute that you choose to show from your dataset is defined as part of the Column Metadata object. Here's an example:

```
function getColumnMetaData() {
    return [
        { 'header': 'Special', 'width': '10%', renderer: insertCheckbox, order: 1 },
        { 'header': 'ID', 'width': '10%', attribute: 'id', order: 2 },
        { 'header': 'Email', 'width': '20%', attribute: 'email', order: 3 },
        { 'header': 'City', 'width': '20%', attribute: 'city', order: 4, resize: true },
        { 'header': 'Street', 'width': '20%', attribute: 'street', order: 5 },
        { 'header': 'Zip', 'width': '20%', attribute: 'zipCode', order: 6 }
    ]
}

```

Notes:
* The width can be in pixels or a percentage.  
* Resize allows the user to resize the column width -- but this is not persisted.  A later release will provide an option to persist.
* To 'insert' a column -- as shown in the first attribute -- do not supply an attribute.  But, you must provide a custom rendereder.

## Custom Renderers and Inserting New Attributes
Each attribute is simply displayed as text.  However, chances are that you want to show your data in a different format.  Consider timestamps. You probably would not show a raw timestamp to a user, but would format it .  This is what a customer renderer allows you to do. Here's how you would do that for a timestamp -- along with inserting a checkbox in the first column.  Condider this metadata:

```
function getColumnMetaData() {
    return [
        { 'header': 'Special', 'width': '10%', renderer: insertCheckbox },
        { 'header': 'Timestamp', 'width': '20%', attribute: 'timestamp', renderer: dateRenderer  }
    ]
}

```

### Renderer insertCheckbox
Is simply a function that will be called with the following parmameters:

* rowindex --> The index of the current row
* data --> An object that represents the current row.  To get the raw data for this attribute, use data[columnName] Not used when inserting a column.
* columnName --> The column name.  In this case, 'Special'

```
function insertCheckbox(rowIndex, data, columnName) {
    // Just return a checkbox type
    return <input type='checkbox' />

}

```

### Renderer dateRenderer

```
dateRenderer(rowIndex, data, columnKey) {
    return {new Date(data[columnKey]).getTime()}
}
```

## Event Handling
The table can call back on cell click events, and row click events.  The row click event receives a row object and the cell click event receives the raw data for this cell.  

This row object contains the entire row, not just the attributes that are displayed. To retrieve a single attribute from this row, simply use row.*attribute* for a row click. For example:

```
<SuperTable 
            . . . 
            onCellClickCallback={cellClick}
            onRowClickCallback={rowClick}
            . . .
/>            

// Show the attribute name and its value for this cell
function cellClick(rowIndex, column, cell) {
    alert('Cell clicked! attribute name : ' + column + ' Cell is: ' + cell );
}

// Show the id attribute for this row
function rowClick(row) {
    alert('Row clicked! Id is: ' + row.id)
}

```


## Refreshing Data
In order to tell SuperTable to refresh its data store, you must explicilty call the refresh method.  This is done in the following way.  First, define a 'ref' in the table  to get visibility to SuperTable's methods.

```
<SuperTable 
            . . .
            ref={instance => { window.superTable = instance; }}
            . . .
```
I've attached it to the global Window object here.. but is usually 'this' when using from a React Component etc. When you decide that you need to update the data store...


```
function refreshData( data ) {
 
    if (undefined !== window.superTable) {
        window.superTable.refresh(data);
    }
}

```

Here, refreshData is called with what is the updated dataset.  SuperTable's refresh method is invoked and the table repaints.


This does it for version 1.0

Thanks...Much more to come
   
