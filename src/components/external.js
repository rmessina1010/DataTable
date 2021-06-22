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

    update() {
        this.props.update(this.state.url);
    }

    render() {
        return (
            <div>
                <label>Source URL:</label>
                <input name='sourceURL' id="sourceURL" value={this.state.url} onChange={this.handleChange} onKeyUp={e => e.keyCode === 13 ? this.update() : null} />
            </div>
        )
    }
}

class MainComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: this.props.url,
            t: 15
        }
        this.changeURL = this.changeURL.bind(this);
    }

    changeURL(newURL) {
        this.setState({ url: newURL })
    }

    render() {
        return (
            <div>
                <Url update={this.changeURL} default={this.state.url} />
                <DataTable
                    source={[{ a: 1, c: 1 }, { b: 1, a: 0 }, { a: 2 }, { a: 4, c: 4 }, { b: 0 }, {}, {}, {}]}
                    {...this.props.dataT}
                />
            </div>
        );
    }
}

export default MainComponent;