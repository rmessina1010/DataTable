import React, { Component } from 'react';

export function DTTD(props) {
    let risk = null;
    let content = null;
    let data = (props?.subs[props.data]) ? props.subs[props.data] : props.data;
    if (props.col === undefined) { return null; }
    switch (props.type) {
        case 'img':
            content = data ? <img src={data} alt={props.alt || ""} /> : null;
            break;
        case 'html':
            content = null;
            risk = data;
            break;
        default:
            content = data?.toString();
    }
    if (props.link) {
        content = risk ? <a href={props.link} dangerouslySetInnerHTML={{ __html: risk }} /> : <a href={props.link}>{content}</a>;
        risk = null;
    }
    return (risk ? <td key={'td-' + props.col + props.rowid} dangerouslySetInnerHTML={{ __html: risk }} /> : <td key={'td-' + props.col + props.rowid}>{content}</td>)
}

export function DTTH(props) {
    let col = props.col || props.title;
    return col ? (<th onClick={props.sort} key={'th-' + col} data-srt={col}>{props.title}</th>) : null;
}

export function DataTableHead({ cols, labelMap, sort }) {
    let ths = cols.map(col => <DTTH title={(labelMap && labelMap[col]) ? labelMap[col] : col} sort={sort} />)
    return (
        <thead>

            {ths.length > 0 ? (<tr>{ths} </tr>) : null}

        </thead>
    );
}

export function DataTableBody(props) {
    let trows = Array.isArray(props.data) ? props.data.map((rowData, rIndex) => {
        if (Object.keys(rowData).length < 1) { return null; }
        let isRowDefined = false;
        let rowKey = rowData[props.keycol] || rIndex;
        let theCells = props.cols.map(col => {
            if (typeof rowData[col] !== 'undefined') { isRowDefined = true; }
            let type = props.typeMap[col] || null;
            let link = props.linkMap[col] ? rowData[props.linkMap[col]] : null;
            let subs = props.subs[col] || {};
            return (<DTTD data={rowData[col]} col={col} rowid={rowKey} type={type} link={link} subs={subs} alt={null} />);
        });
        let clickFoo = (foo, row, index, props) => typeof foo === 'function' ? () => foo(row, index, { ...props, rClick: null }) : null;
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
            url: null
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
        if (this.state.url && this.props.source !== this.state.url) { this.refreshData(); }
    }

    refreshData() {
        if (typeof this.props.source === 'string' || this.props.source instanceof String) {
            fetch(this.props.source)
                .then(resp => resp.status === 200 ? resp.json() : null)
                .then(resp => {
                    let status = resp ? 'connected.' : 'connection failure.'
                    this.setState({ url: this.props.source, theData: resp, sortedData: resp, status, sortKey: null, sortDir: null, theCols: this.props.cols || Object.keys(resp[0]) })
                })
                .catch(reps => this.setState({ url: null, theData: null, sortedData: null, status: 'script failure' + reps, sortKey: null, sortDir: null, theCols: this.props.cols || [] }));
        } else if (Array.isArray(this.props.source)) {
            this.setState({ url: this.props.source, theData: this.props.source, sortedData: this.props.source, status: 'connected.', sortKey: null, sortDir: null, theCols: this.props.cols || Object.keys(this.props.source[0]) })
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
                />
            </table>

        ) : (<div>{this.state.status}</div>);
    }

}

export default DataTable;

