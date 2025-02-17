import React, { Component, useEffect, useState , useCallback, useRef } from 'react';
import DataTable2 from './datatable2';

export class Url extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: this.props.default || null
        }
        this.handleChange = this.handleChange.bind(this);
        this.update = this.update.bind(this);
    }

    handleChange(e) {
        console.log(e.target);
        this.setState({ url: e.target.value });
    }

    update(what) {
        this.props.update(what);
    }

    render() {
        const phURL = 'https://jsonplaceholder.typicode.com/users';
        return (
            <div className='demo-ctrl'>
                <div className='url-group'>
                    <label>Enter Source URL: </label>
                    <input name='sourceURL' placeholder={phURL} id='sourceURL' value={this.state.url} onChange={this.handleChange} onKeyUp={e => e.keyCode === 13 ? this.update(this.state.url) : null} />
                    <button className='ctr-btn' onClick={() => this.update(this.state.url)}>Apply</button>
                    <button className='ctr-btn' onClick={() => this.setState({ url: this.state.url ? '' : phURL })}>{this.state.url ? 'Clear' : 'Default'}</button>
                </div>
                <div>
                    <button className='ctr-btn' onClick={() => this.update(this.props.sample)}>Or Use Internal Sample Data</button>
                    {(typeof this.props.refresh === 'function') ? <button onClick={this.props.refresh}>Refresh</button> : null}
                </div>
            </div >
        )
    }
}

const Filter = ({changeFilt, cols})=>{
    const needleVal = useRef()
    const colVal = useRef()
    const invert = useRef()
    return (<div className='demo-ctrl'>
        <label>Column: </label>
        <select ref={colVal}>
            {cols.map(col=><option value={col}>{col}</option>)}
        </select>
        <input  ref={needleVal}/>
        <button onClick={ ()=>changeFilt({col:colVal.current.value, needle: needleVal.current.value, invert: invert.current.checked}) }>Filter</button>
        <label> <input type="checkbox" ref={invert}/> Invert </label>

    </div>)
}

class MainComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: this.props.url,
            t: 15,
            source: this.props.url,
            force: false,
            filter: {
                col:'',
                needle:'',
                invert: false
            }
        }
        this.changeURL = this.changeURL.bind(this);
    }

    changeURL(newURL) {
        this.setState({ ...this.state, source: newURL  })
    }
    changeFilter(newFilter) {
        this.setState({ ...this.state, filter: newFilter  })
    }

    render() {
        return (
            <div className="main-shell">
                <Url
                    update={this.changeURL}
                    default={this.state.url}
                    sample={[{ a: 'text with <a href="http://apple.com" target="_blank">link</a>', c: 1 }, { b: 1, a: '0' }, { a: 2 }, { a: 4, c: 0 }, { a: 4, c: 0 }, { a: 4, c: 4 }, { b: 0 }, {}, {}, {}]}
                // refresh={() => this.setState(oldState => ({ ...oldState, force: !oldState.force }))}
                />

                <FetchDataWrapper
                    source={this.state.source}
                    // setFilt = {this.changeFilter.bind(this)}
                    // schema={['GLIID','inGList','GLICat','ItemName', 'Needed','QTY', 'image','notes', 'GLIOrd']}
                    options={{
                        renderSchemas:{
                            image: i=> i && <img src={i} alt='' height="50"/>,
                            website: i=><a href={i}>{i}</a>,
                            email: i=><a href={`mailto:${i}`}>{i}</a>,
                            address:  this.props.dataT.rendCols.address,
                            company: this.props.dataT.rendCols.company

                        },
                        sortSchemas: this.props.dataT.sortSchemas,
                        tableAttrs: this.props.dataT.tableAttrs,
                        rowAction: this.state.source.indexOf('sharelist')<0 ? ({data,rowIndex,e})=>{alert(e.currentTarget)} : this.props.dataT.rClick ,
                        skipEmpty: true,
                        filterSchemas:{
                            col: this.state.filter.col,
                            needle: this.state.filter.needle,
                            invert: this.state.filter.invert,
                            foo: (row,col,inv,makeFind,needle)=>{
                                const findMe= makeFind(col);
                                if (row[col]=== undefined) {return true}
                                const result = (findMe(row[col]).toString().indexOf(needle) > -1);
                                return  inv ? !result : result;
                            }
                        },
                    }}
                >
                </FetchDataWrapper>

                <DataTable2
                    data={[
                        {a:1, b:2, c:3, d:4, e:5},
                        {a:2, b:2, c:4, d:4, e:5},
                        {a:1, b:2, c:2, d:4, e:5},
                        {a:3, b:2, c:5, d:4, e:5},
                        {a:4, b:2, c:10, d:4, e:5},
                        {a:5, b:2, c:7, d:4, e:5},
                        {a:6, b:2, c:2, d:4, e:5}
                    ]}
                    schema={['a','d','c','e']}
                    rowAction={ ({data, rowIndex})=>alert(data[rowIndex].a)}
                    renderSchemas={ { c: (d,k,i,r)=><a href={r.a}>{d}</a> ,}}
                />
            </div>
        );
    }
}

export const FetchDataWrapper = ({source, schema, options, setFilt})=>{
    const [theData, setTheData] = useState([]);
    const [stat, setStat] = useState('start');
    const [theSchema, setTheSchema] = useState(Array.isArray(schema)? schema : []);

    const refreshData = useCallback ( (signal)=>{
        if (typeof source === 'string' || source instanceof String) {
            fetch(source, { signal })
                .then(resp => resp.status === 200 ? resp.json() : null)
                .then(resp => {
                    setStat(resp ? null: 'connection failure.');
                    setTheData(resp);
                    if (!Array.isArray(schema)){ setTheSchema(Object.keys(resp[0] || [])) }
                })
                .catch(reps => setTheData([]));
        }else{
            setTheData(Array.isArray(source) ? source : []);
            if (!Array.isArray(schema)){ setTheSchema(Object.keys(source[0] || [])) }
        }
    }, [schema, source]);

    useEffect(()=>{
        const  controller = new AbortController();
        refreshData( controller.signal);
        return ()=> controller.abort();
    }, [source, refreshData]);

    const cleanOptions = typeof setFilt === 'function' ? options : {...options, filterSchemas:null};
    return stat ||
        <>
            { typeof setFilt === 'function' ? <Filter cols={Object.keys(theData[0] || {})} changeFilt={setFilt}/> : null }
            <DataTable2 data={theData} schema={theSchema} {...cleanOptions}/>
        </>
}
export default MainComponent;