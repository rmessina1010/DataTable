import React, { Component, useEffect, useState , useCallback, useRef } from 'react';
import DataTable2 from './datatable2';

export class Url extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: this.props.default || '',
            objkey: ''
        }
        this.handleChange = this.handleChange.bind(this);
        this.update = this.update.bind(this);
    }

    handleChange(e) {
        // console.log(e.target);
        const key = e.target.id === 'sourceURL' ? 'url' : 'objkey';
        this.setState({...this.state, [key]: e.target.value });
    }

    update(what,newKey) {
        this.props.update(what, newKey);
    }

    render() {
        const phURL = 'https://jsonplaceholder.typicode.com/users';
        return (
            <div className='demo-ctrl'>
                <div className='url-group'>
                    <label htmlFor='sourceURL'>Enter Source URL: </label>
                    <input name='sourceURL' placeholder={phURL} id='sourceURL' value={this.state.url} onChange={this.handleChange} onKeyUp={e => e.keyCode === 13 ? this.update(this.state.url) : null} />
                    <label htmlFor='objkey'>/</label>
                    <input name='objkey' id='objkey' value={this.state.objkey} onChange={this.handleChange} onKeyUp={e => e.keyCode === 13 ? this.update(this.state.url, this.state.objkey) : null} />
                    <button className='ctr-btn' onClick={() => this.update(this.state.url, this.state.objkey)}>Apply</button>
                    <button className='ctr-btn' onClick={() => this.setState({ url: this.state.url ? '' : phURL , objkey: '' })}>{this.state.url ? 'Clear' : 'Default'}</button>
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
        <label htmlFor ="columns">Column: </label>
        <select id ="columns" ref={colVal}>
            {cols.map(col=><option key ={col} value={col}>{col}</option>)}
        </select>
        <label>
            <input  ref={needleVal}/>
            <button onClick={ ()=>changeFilt({col:colVal.current.value, needle: needleVal.current.value, invert: invert.current.checked}) }>Filter</button>
        </label>
        <label> <input type="checkbox" ref={invert}/> Invert </label>
    </div>)
}

class MainComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: this.props.url,
            objkey: this.props.objkey,
            t: 15,
            source: this.props.url,
            force: false,
            filter: {
                col:'',
                needle:'',
                invert: false
            },
            quicKdata :[
                        {a:1, b:2, c:3, d:4, e:5},
                        {a:2, b:2, c:4, d:4, e:5},
                        {a:1, b:2, c:2, d:4, e:5},
                        {a:3, b:2, c:5, d:4, e:5},
                        {a:4, b:2, c:10, d:4, e:5},
                        {a:5, b:2, c:7, d:4, e:5},
                        {a:6, b:2, c:2, d:4, e:5}
                    ]
        }
        this.changeURL = this.changeURL.bind(this);
        this.expSetter = this.expSetter.bind(this);
     }

    changeURL(newURL, newKey) {
        this.setState({ ...this.state, source: newURL, objkey: newKey });
    }

    changeFilter(newFilter) {
        this.setState({ ...this.state, filter: newFilter  });
    }

    expSetter(newState){
        this.setState({ ...this.state, ...newState });
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
                    objkey={this.state.objkey}
                    setFilt = {this.changeFilter.bind(this)}
                    // schema={['GLIID','inGList','GLICat','ItemName', 'Needed','QTY', 'image','notes', 'GLIOrd']}
                    options={{
                        renderSchemas:{
                            image: i=> i && <img src={i} alt=''/>,
                            website: i=><a href={i}>{i}</a>,
                            email: i=><a href={`mailto:${i}`}>{i}</a>,
                            address:  this.props.dataT.rendCols.address,
                            company: this.props.dataT.rendCols.company
                        },
                        extSort: true,
                        sortSchemas: this.props.dataT.sortSchemas,
                        clickSchemas:{
                            phone: ({content})=>alert(JSON.stringify(content))
                        },
                        tableAttrs: this.props.dataT.tableAttrs,
                        rowAction: this.state.source.indexOf('sharelist')<0 ? ({data,rowIndex,e})=>{alert(e.currentTarget)} : this.props.dataT.rClick ,
                        skipEmpty: true,
                        filterSchemas:{
                            col: this.state.filter.col,
                            needle: this.state.filter.needle,
                            invert: this.state.filter.invert,
                            foo: (row,col,inv,makeFind,needle)=>{
                                const findMe= makeFind(col);
                                if (row[col]=== undefined) {return false}
                                const result = (findMe(row[col]).toString().indexOf(needle) > -1);
                                return  inv ? !result : result;
                            },
                        },
                        privRend: 'This field requires a custom render schema!!'
                    }}
                >
                </FetchDataWrapper>

                <DataTable2
                    data={ this.state.quicKdata  }
                    schema={['a','d','c','e','remove']}
                    rowAction={ ({data, rowIndex})=>alert(data[rowIndex].a)}
                    renderSchemas={ {
                        c: (d,k,i,data)=><a href={`#${data[i].c}`}>{d}</a> ,
                        remove:(d,k,i,data,s,es)=>{ return <button
                            onClick={(e)=>{
                                e.stopPropagation();
                                es({ quicKdata: data.filter((v,ki)=> ki!==i)});
                            }}
                            >{k} {i}</button> }
                    }}
                    skipClick={['remove']}
                    extSetter= {this.expSetter}
                    extSort= {d=>{return {quicKdata:d}}}
                    clickSchemas ={{
                            c: ({content})=>alert(JSON.stringify(content)),
                            // remove:({rowIndex,setter})=> {alert(setter);}
                     } }

                />
                <button className="ctr-btn nlm" onClick ={()=> this.setState((prev)=>{return {...prev, quicKdata: prev.quicKdata.length > 0 ? [...prev.quicKdata , prev.quicKdata[Math.floor(Math.random() * (prev.quicKdata.length))]] : [] }}) }>Add Row</button>
                <button className="ctr-btn" onClick ={()=>alert(JSON.stringify(this.state.quicKdata))}>show</button>
            </div>
        );
    }
}

export const FetchDataWrapper = ({source, schema, options, setFilt, objkey})=>{
    const [theData, setTheData] = useState([]);
    const [stat, setStat] = useState('start');
    const [theSchema, setTheSchema] = useState(Array.isArray(schema)? schema : []);

    const refreshData = useCallback ( (signal)=>{
        if (typeof source === 'string' || source instanceof String) {
            fetch(source, { signal })
                .then(resp => resp.status === 200 ? resp.json() : null)
                .then(resp => {
                    setStat(s=>resp ? null: 'connection failure.');
                    const datas =  Array.isArray(resp) ? resp : (objkey ? resp[objkey] : null)  ;
                    setStat(s=>Array.isArray(datas) ? null: 'bad API format.');
                    setTheData(datas);
                    if (!Array.isArray(schema)){ setTheSchema(Object.keys(datas[0] || [])) }
                })
                .catch(reps => setTheData([]));
        }else{
            setTheData(Array.isArray(source) ? source : []);
            if (!Array.isArray(schema)){ setTheSchema(Object.keys(source[0] || [])) }
        }
    }, [schema, source, objkey]);

    useEffect(()=>{
        const  controller = new AbortController();
        refreshData( controller.signal);
        return ()=> controller.abort();
    }, [refreshData]);

    const cleanOptions = {...options,
        filterSchemas: typeof setFilt !== 'function' ? null : options.filterSchemas,
        extSetter: options.extSort ? setTheData : options.extSetter
    };
    return stat ||
        <>
            { typeof setFilt === 'function' ? <Filter cols={Object.keys(theData[0] || {})} changeFilt={setFilt}/> : null }
            <DataTable2 data={theData} schema={theSchema} {...cleanOptions}/>
        </>
}
export default MainComponent;