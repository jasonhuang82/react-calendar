import styles from '../css.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import classNames from 'classnames';
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
    render () {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div styleName="reactCalendar">
                        <h2>Style: isSelect</h2>
                        <CalendarMobile startDate="2018/02/09"
                            endDate="2018/06/08"
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
