import styles from '../css.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import classNames from 'classnames';
import moment from 'moment';

import CalendarMobile from './CalendarMobile';



class Module extends Component {
    static defaultProps = {
        prop: 'string'
    };

    static propTypes = {
        prop: PropTypes.string.isRequired
    };

    constructor (props) {
        super(props);
        this.state = {
            statename: 'state'
        };
        this.myFuckChildren = '';
    }
    /**
     * React Lifecycle: [see detail](https://reactjs.org/docs/react-component.html)
     * - componentWillMount()
     * - componentDidMount()
     * - componentWillReceiveProps(nextProps)
     * - shouldComponentUpdate(nextProps, nextState)
     * - componentWillUpdate(nextProps, nextState)
     * - componentDidUpdate(prevProps, prevState)
     * - componentWillUnmount()
     */

    componentDidMount () {
        console.log('componentDidMount');
        // 取得子層資料
        // console.log('myResult', this.myFuckChildren.getResultDate() );
    }
    componentWillUpdate (nextProps, nextState) {
        // 接收到新的props和state時，re-render之前
        // 會去接收 setState過來的 props or State 存在參數裡，也就是若是需要使用剛剛setState來的資料就需要用參數接過來
        // 只有使用this.state.xx 會只抓到當下未更新的state
        console.log('componentWillUpdate');
    }

    /**
     * Render Notice：
     * 1. render 裡 setState 會造成回圈，setState -> render -> setState -> render ...
     * 2. 在render前的 setSatae 放在 componentWillMount，render 後的放在 componentDidMount
     * 3. 不要使用 array 的 index 為 keys，可針對該內容 hash 後為 key
     */
    /*
    檔名不可有特殊字元 - or _
    css 預設裡面要有東西不然css module 會錯
    */

    getResultDateDafault (res) {
        console.log('Dafault', res);
    }
    getResultDateIsSelect (res) {
        console.log('IsSelect', res);
    }

    whenClickDate = () => {
        console.log('Daddy is home!!');
    }

    render () {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="reactCalendar">
                        <h2>Style: isSelect</h2>
                        <CalendarMobile startDate={moment().format('YYYY/MM/DD')}
                            endDate="2019/06/08"
                            getResultDate={this.getResultDateIsSelect}
                            isSelect
                            whenClickDate={this.whenClickDate}
                            ref={(el) => this.myFuckChildren = el}
                        />
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="reactCalendar">
                        <h2>Style: dafault</h2>
                        <CalendarMobile startDate="2018/02/12"
                            endDate="2018/02/25"
                            getResultDate={this.getResultDateDafault}
                            ref={(el) => this.myFuckChildren = el}
                        />
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="reactCalendar">
                        <h2>Style: dafault</h2>
                        <CalendarMobile startDate="2018/03/12"
                            endDate="2018/06/08"
                            getResultDate={this.getResultDateDafault}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default CSSModules(Module, styles, {
    allowMultiple: true
});
