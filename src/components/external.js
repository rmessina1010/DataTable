import React, { Component } from 'react';
import DataTable from './datatable';

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

        return (
            <div className="demo-ctrl">
                <div>
                    <label>Enter Source URL: </label>
                    <input name='sourceURL' id="sourceURL" value={this.state.url} onChange={this.handleChange} onKeyUp={e => e.keyCode === 13 ? this.update(this.state.url) : null} />
                </div>
                <div>
                    <button onClick={() => this.update(this.props.sample)}>Or Use Sample Data</button>
                    {(typeof this.props.refresh === 'function') ? <button onClick={this.props.refresh}>Refresh</button> : null}
                </div>
            </div >
        )
    }
}

class MainComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: this.props.url,
            t: 15,
            source: this.props.url,
            force: false
        }
        this.changeURL = this.changeURL.bind(this);
    }

    changeURL(newURL) {
        this.setState({ source: newURL })
    }

    render() {
        return (
            <div >
                <Url
                    update={this.changeURL}
                    default={this.state.url}
                    sample={[{ a: 1, c: 1 }, { b: 1, a: 0 }, { a: 2 }, { a: 4, c: 0 }, { a: 4, c: 0 }, { a: 4, c: 4 }, { b: 0 }, {}, {}, {}]}
                // refresh={() => this.setState(oldState => ({ ...oldState, force: !oldState.force }))}
                />
                <DataTable
                    source={this.state.source}
                    {...this.props.dataT}
                //   preProcess={a => { alert('preprocessor ran successfully'); return a; }}
                // force={this.state.force}
                />
            </div>
        );
    }
}

export default MainComponent;