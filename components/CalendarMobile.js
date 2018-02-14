import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment/locale/zh-cn';
import DataLoader from './DataLoader';


export default class CalendarMobile extends React.Component {

    static defaultProps = {
        functionNames: [
        ]
    };

    static propTypes = {
        startDate: React.PropTypes.string,
        endDate: React.PropTypes.string,
        isSelect: React.PropTypes.bool
    };

    constructor (props) {
        // super是呼叫上層父類別的建構式
        super(props);
        this.state = {
        };
    }

    // ===== 生命週期 ref = https://ithelp.ithome.com.tw/articles/10185194 =====
    componentWillMount () {
        // Component將要被mount在畫面上時，會執行這個方法，會發生在第一次render()之前，
        // 也因為在會在render()之前，所以在這邊設定任何state也就不會觸發re-render
        console.log('componentWillMount CalendarMobile');
    }
    componentWillUpdate (nextProps, nextState) {
        // 接收到新的props和state時，re-render之前
        // 會去接收 setState過來的 props or State 存在參數裡，也就是若是需要使用剛剛setState來的資料就需要用參數接過來
        // 只有使用this.state.xx 會只抓到當下未更新的state
        console.log('componentWillUpdate CalendarMobile');
    }

    // 綁訂所有方法 .bind(this)
    bindThis () {
        this.props.functionNames.map((item) => this[item] = this[item].bind(this));
    }
    render () {
        return (
            <div></div>
        );
    }
}