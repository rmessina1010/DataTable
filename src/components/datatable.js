import React, { Component } from 'react';

export function DTTD(props) {
    let risk = null;
    let content = null;
    if (props.col === undefined) { return null; }
    switch (props.type) {
        case 'img':
            content = props.data ? <img src={props.data} alt={props.alt || ""} /> : null;
            break;
        case 'html':
            content = null;
            risk = props.data;
            break;
        case 'raw':
            content = props.data;
            break;
        default:
            content = props.data.toString();
    }
    if (props.link) {
        let theLink = props.link;
        let anchorAttrs = {};
        //attemps to figure out what kind of link it is (anchor, url, or email)
        if (theLink.indexOf('http') !== 0 && theLink.indexOf('#') !== 0 && theLink.indexOf('mailto:') !== 0) {
            theLink = (theLink.indexOf('@') > 0 ? 'mailto:' : 'http://') + theLink;
        }
        if (theLink.indexOf('http') === 0) { anchorAttrs.target = "_blank"; }
        //
        content = risk ? <a href={theLink} dangerouslySetInnerHTML={{ __html: risk }} {...anchorAttrs} /> : <a href={theLink} {...anchorAttrs} >{content}</a >;
        risk = null;
    }
    return (risk ? <td dangerouslySetInnerHTML={{ __html: risk }} /> : <td>{content}</td>)
}

export function DTTH(props) {
    let col = props.col || props.title;
    return col ? (<th onClick={props.sort} key={'th-' + col} data-srt={col}>{props.title}</th>) : null;
}

export function DataTableHead({ cols, labelMap, sort }) {
    let ths = cols.map(col => { let key = (labelMap && labelMap[col]) ? labelMap[col] : col; return <DTTH title={key} sort={sort} key={key} /> })
    return (
        <thead>{ths.length > 0 ? (<tr>{ths} </tr>) : null}</thead>
    );
}

export function DataTableBody(props) {
    let trows = Array.isArray(props.data) ? props.data.map((rowData, rIndex) => {
        if (Object.keys(rowData).length < 1) { return null; }
        let isRowDefined = false;
        let rowKey = rowData[props.keycol] || rIndex;
        let theCells = props.cols.map(col => {
            let subs = props.subs[col] || null;
            let data = (typeof props.rendCols?.[col] !== 'function') ? (subs ? subs?.[rowData[col]] : rowData[col]) : props.rendCols[col](rowData, col, subs);
            if (typeof data !== 'undefined') { isRowDefined = true; }/// row is defined if at least ONE col is present
            let type = props.typeMap[col] || null;
            let link = props.linkMap[col] ? rowData[props.linkMap[col]] : null;
            return (<DTTD key={'td-' + col + rowKey} data={data} col={col} type={type} link={link} alt={null} />);
        });
        let clickFoo = (foo, row, index, props) => typeof foo === 'function' ?
            (e) => {
                if (!e.target.href) { foo(row, index, { ...props, rClick: null, reProcess: null }) }
            }
            : null;
        return (!props.undefRows && !isRowDefined) ? null :
            (<tr key={"row-" + rowKey} onClick={clickFoo(props.rClick, rowData, rIndex, props)}>{theCells}</tr>)
    })
        : [];

    return <tbody>{trows}</tbody>
}

class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theData: null,
            sortedData: null,
            theCols: this.props.cols || [],
            linkMap: this.props.links || {},
            labelMap: this.props.label || {},
            typeMap: this.props.types || {},
            sortMap: this.props.sortMap || {},
            subMap: this.props.subMap || {},
            status: 'connecting...',
            sortKey: null,
            sortDir: null,
            url: null,
            force: this.props.force
        }
        this.clickToSort = this.clickToSort.bind(this);
        this.ordCol = null;


    }

    clickToSort(e) {
        if (this.ordCol && e.target !== this.ordCol) {
            this.ordCol.classList.remove(this.props.ascClass, this.props.descClass);
        }
        this.ordCol = e.target;
        let asc = e.target.classList.toggle(this.props.ascClass, !e.target.classList.toggle(this.props.descClass)) ? 1 : -1;
        this.sortTable(e.target.dataset.srt, asc);
    }


    sortTable(key, asc) {
        let newData = [...this.state.theData]; //redraws from the original  data for cosistency
        let desc = -1 * asc;
        if (this.state.sortMap[key]) { newData.sort((a, b) => (Number(a[key]) > Number(b[key])) ? asc : desc); }
        else { newData.sort((a, b) => (a[key] > b[key]) ? asc : desc); }

        this.setState({ sortedData: newData, sortKey: key, sortDir: asc })
    }

    componentDidMount() { this.refreshData(); }
    componentDidUpdate() {
        if (this.props.source !== this.state.url || this.state.force !== this.props.force) { this.refreshData(); }
    }

    refreshData() {
        let opts = {
            cols: this.props.cols,
            linkMap: this.props.links,
            labelMap: this.props.label,
            typeMap: this.props.types,
            sortMap: this.props.sortMap,
            subMap: this.props.subMap,
        }

        if (typeof this.props.source === 'string' || this.props.source instanceof String) {
            fetch(this.props.source)
                .then(resp => resp.status === 200 ? resp.json() : null)
                .then(resp => {
                    let status = resp ? 'connected.' : 'connection failure.';
                    opts.status = status;
                    if (typeof this.props.preProcess === 'function') { resp = this.props.preProcess(resp, opts, this.props.source) }
                    let theCols = this.props.cols || (Array.isArray(resp) ? Object.keys(resp[0] || {}) : []);
                    this.setState({ url: this.props.source, theData: resp, sortedData: resp, status, sortKey: null, sortDir: null, theCols, force: this.props.force })
                })
                .catch(reps => this.setState({ url: null, theData: null, sortedData: null, status: 'script failure!!!' + reps, sortKey: null, sortDir: null, force: this.props.force, theCols: this.props.cols || [] }));
        } else if (Array.isArray(this.props.source)) {
            let data = this.props.source;
            opts.status = 'connected.';
            if (typeof this.props.preProcess === 'function') { data = this.props.preProcess(data, opts, false) }
            let theCols = this.props.cols || Object.keys(this.props.source[0] || {});
            this.setState({ url: data, theData: data, sortedData: data, status: 'connected.', sortKey: null, sortDir: null, theCols, force: this.props.force })
        }
    }

    render() {
        return this.state.sortedData ? (
            <table {...this.props.tableAttrs}>
                <DataTableHead
                    cols={this.state.theCols}
                    sort={this.clickToSort}
                    labels={this.state.labelMap}
                />
                <DataTableBody
                    cols={this.state.theCols}
                    data={this.state.sortedData}
                    typeMap={this.state.typeMap}
                    linkMap={this.state.linkMap}
                    subs={this.state.subMap}
                    rClick={this.props.rClick}
                    undefRows={this.props.undefRows}
                    rendCols={this.props.rendCols}
                />
            </table>

        ) : (<div className='data-table-fail'>{this.state.status}</div>);
    }

}

export default DataTable;

