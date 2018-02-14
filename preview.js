import '../core/core.scss';
// import js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import moment from 'moment';
// 載入es7 環境
import 'babel-polyfill';

import CalendarMobile from './index.js';

// Redux 範例
import ReduxTest from './components/ReduxTest';
import ReduxList from './components/ReduxList';
import ReduxSwitch from './components/ReduxSwitch';

// 用於總結所有
class Demo extends Component {
    static defaultProps = {
        prop: 'string'
    };

    static propTypes = {
        prop: PropTypes.string.isRequired
    };
    constructor(props) {
        super(props);
        this.state = {
            reduxSwitchState: ''
        };
        this.calendarIsSelect = '';
    }

    whenClickDate = () => {
        console.log('我是從Module來的喔');
    }

    render() {
        return (
            <div className="row">
                <div className="col-md-24">
                    <h2>ReduxSwitch 範例</h2>
                    <ReduxSwitch ref={(el) => { this.reduxSwitchState = el }} 
                        reduxSwitchState={(res) => { this.setState({ reduxSwitchState: res}) }}
                    />
                    <h3>{this.state.reduxSwitchState?'YES':'NO'}</h3>
                </div>
                <div className="col-md-24">
                    <h2>ReduxList範例</h2>
                    <ReduxList />
                </div>
                <div className="col-md-24">
                    <h2>Redux 文字範例</h2>
                    <ReduxTest />
                </div>
                <div className="col-md-12">
                    <div className="reactCalendar">
                        <h2>Style: isSelect</h2>
                        <CalendarMobile startDate={moment().format('YYYY/MM/DD')}
                            endDate="2018/06/08"
                            getResultDate={this.getResultDateIsSelect}
                            isSelect
                            whenClickDate={this.whenClickDate}
                            ref={(el) => this.calendarIsSelect = el}
                        />
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="reactCalendar">
                        <h2>Style: dafault</h2>
                        <CalendarMobile startDate={moment().format('YYYY/MM/DD')}
                            endDate="2018/06/25"
                            getResultDate={this.getResultDateDafault}
                        />
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="reactCalendar">
                        <h2>Style: dafault</h2>
                        <CalendarMobile startDate={moment().format('YYYY/MM/DD')}
                            endDate="2018/06/08"
                            getResultDate={this.getResultDateDafault}
                        />
                    </div>
                </div>
            </div>
        );
    }
}


ReactDOM.render(<Demo />, document.getElementById('root'));
