import React, { Component } from 'react';

export function DTTD(props) {
    let risk = null;
    let content = null;
    if (props.subs && props.subs[props.data]) { props.data = props.subs[props.data]; }
    switch (props.type) {
        case 'img':
            content = props.data ? <img src={props.data} alt={props.alt || ""} /> : null;
            break;
        case 'html':
            content = null;
            risk = props.data;
            break;
        default:
            content = props.data.toString();
    }
    if (props.link) {
        content = risk ? <a href={props.link} dangerouslySetInnerHTML={risk} /> : <a href={props.link}>{content}</a>;
        risk = null;
    }
    return (risk ? <td key={'td-' + props.col + props.rowid} dangerouslySetInnerHTML={risk} /> : <td key={'td-' + props.col + props.rowid}>{content}</td>)
}

export function DTTH(props) {
    let col = props.col || props.title;
    return (<th onClick={props.sort} key={'th-' + col} data-srt={col}>{props.title}</th>);
}

export function DataTableHead({ cols, labelMap, sort }) {
    let ths = cols.map(col => <DTTH title={(labelMap && labelMap[col]) ? labelMap[col] : col} sort={sort} />)
    return (
        <thead>
            <tr>
                {ths}
            </tr>
        </thead>
    )
}

export function DataTableBody(props) {
    let trows = Array.isArray(props.data) ? props.data.map((rowData, rowKey) => {
        rowKey = rowData[props.keycol] || rowKey;
        let theCells = props.cols.map(col => {
            let type = props.typeMap[col] || null;
            let link = props.linkMap[col] ? rowData[props.linkMap[col]] : null;
            let subs = props.subs[col] || {};
            return (<DTTD data={rowData[col]} col={col} rowid={rowKey} type={type} link={link} subs={subs} />);
        });
        return <tr key={"row-" + rowKey}>{theCells}</tr>
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
        if (this.state.url && this.props.url !== this.state.url) { this.refreshData(); }
    }

    refreshData() {
        fetch(this.props.url)
            .then(resp => resp.status === 200 ? resp.json() : null)
            .then(resp => {
                let status = resp ? 'connected.' : 'connection failure.'
                this.setState({ url: this.props.url, theData: resp, sortedData: resp, status, sortKey: null, sortDir: null, theCols: this.props.cols || Object.keys(resp[0]) })
            })
            .catch(reps => this.setState({ url: null, theData: null, sortedData: null, status: 'script failure' + reps, sortKey: null, sortDir: null, theCols: this.props.cols || [] }));
    }

    render() {
        return this.state.sortedData ? (
            <table {...this.props.tableAttrs}>
                <DataTableHead cols={this.state.theCols} sort={this.clickToSort} labels={this.state.labelMap} />
                <DataTableBody cols={this.state.theCols} data={this.state.sortedData} typeMap={this.state.typeMap} linkMap={this.state.linkMap} subs={this.state.subMap} />
            </table>

        ) : (<div>{this.state.status}</div>);
    }

}

export default DataTable;
