// 載入自訂 scss
import styles from '../css.scss';

// 載入 套件
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import classNames from 'classnames';
import moment from 'moment';
import 'moment/locale/zh-cn';
import DataLoader from './DataLoader';

// 載入自訂模組
import CalendarTitle from './CalendarTitle';
import CalendarLabel from './CalendarLabel';
import CalendarMobileBodyContainer from './CalendarMobileBodyContainer';
import CalendarMobileAction from '../Action/CalendarMobileAction';

class Module extends Component {
    static defaultProps = {
        functionNames: [
            'dateClick',
            'getCalendarMobileBodyTdDayClass',
            'setSelectLabelState',
            'getSelectStateClass',
            'findStartOrEndDate',
            'getTotalNight',
            'getResultDate',
            'lockDefaultStartBeforeAndEndAfterDate',
            'isRenderBetween',
            'lockStartDateBefore',
            'reseteCalendarState',
            'updateCalendarState'
        ],
        startDate: '1991/01/01',
        endDate: '1993/01/01',
        isSelect: false,
        whenClickDate () { // click 日期時的callback
            console.log('whenClickDate');
        },
    };

    static propTypes = {
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        isSelect: PropTypes.bool
    };

    constructor (props) {
        // super是呼叫上層父類別的建構式
        super(props);
        this.store = (new CalendarMobileAction()).store;
        this.state = this.store.getState();
        this.calendarTitle = [
            {
                titleName: '日',
                isHoliday: true
            },
            {
                titleName: '一',
                isHoliday: false
            },
            {
                titleName: '二',
                isHoliday: false
            },
            {
                titleName: '三',
                isHoliday: false
            },
            {
                titleName: '四',
                isHoliday: false
            },
            {
                titleName: '五',
                isHoliday: false
            },
            {
                titleName: '六',
                isHoliday: true
            }
        ];
    }

    // ===== 生命週期 ref = https://ithelp.ithome.com.tw/articles/10185194 =====
    componentWillMount () {
        // Component將要被mount在畫面上時，會執行這個方法，會發生在第一次render()之前，
        // 也因為在會在render()之前，所以在這邊設定任何state也就不會觸發re-render
        console.log('componentWillMount CalendarMobile');
        this.bindThis();
        DataLoader.setMoment();
        let calendarList = DataLoader.produceCalendar(this.props.startDate, this.props.endDate);
        // 將start Date 之前以及 endDate 之後的日期全 disable
        // 鎖住起始日前與結束日後前的日期
        calendarList = this.lockDefaultStartBeforeAndEndAfterDate(calendarList);

        this.store.dispatch({
            type: 'updateCalendarData',
            calendarData: calendarList
        });
        this.setState(this.store.getState());
        // DataLoader.getDaysInMonth(this.props.startDate);
        // DataLoader.getDaysInMonthPushGap(this.props.startDate);
        // // js 月份從 0 開始算 0-11 12== 下一年一月
    }
    componentWillUpdate (nextProps, nextState) {
        // 接收到新的props和state時，re-render之前
        // 會去接收 setState過來的 props or State 存在參數裡，也就是若是需要使用剛剛setState來的資料就需要用參數接過來
        // 只有使用this.state.xx 會只抓到當下未更新的state
        console.log('componentWillUpdate CalendarMobile');
        // 接收管理所有的callback function 不然寫在 setState 前面可能會抓到就得值
    }

    // 綁訂所有方法 .bind(this)
    bindThis () {
        this.props.functionNames.map((item) => this[item] = this[item].bind(this));
    }
    // click 日期時，決定是去程狀態或回程狀態行為
    dateClick (tableIndex, tdIndex, e) {
        // 整理資料再一次setState
        let cloneCalendarList = JSON.parse(JSON.stringify(this.state.calendarData));
        // click 下去那包物件
        let nowTargetDateDayObj = cloneCalendarList[tableIndex].dateDayList[tdIndex];
        // 是否重render
        let isNeedReRender = true;
        // 複製目前calendarState state 並經過整理後，在最下方統一setState
        let calendarState = {
            'selectState': this.state.calendarState.selectState || null, // 目前選擇狀態
            'startDate': this.state.calendarState.startDate || null,
            'backDate': this.state.calendarState.backDate || null
        };
        // 去程狀態
        if (this.state.calendarState.selectState === 'go') {

            // 在去程狀態，若click的是disable狀態不可以有反應
            if (nowTargetDateDayObj.isDisable === false) {

                // 紀錄上一次endDate 的位置
                let endDate = this.findStartOrEndDate('isEnd', cloneCalendarList);
                // 重置所有state狀態
                cloneCalendarList = this.reseteCalendarState(cloneCalendarList);
                // 設定起始位置
                nowTargetDateDayObj.isStart = true;
                // 找出起始日期
                let startDate = this.findStartOrEndDate('isStart', cloneCalendarList);
                // 設定若是這次click的起始日期比上次的結束日期早的話就繼續接between，並且重新render一次重start到end的狀態，由於一開始就先重置了
                // 但上次end狀態也被清掉必須要補回來不然end會變沒有狀態，一開始有將上次end狀態紀錄，並去利用他重新加上end狀態
                let isNeedAllReset = moment(startDate).isBefore(endDate);
                if (isNeedAllReset && this.props.isSelect) {
                    console.log('本次click 起始日期比上次結束日早，重新紀錄!!');
                    // 重Render 上次的結果
                    cloneCalendarList = this.isRenderBetween(cloneCalendarList, startDate, endDate);
                }
                // 只要比去程日期早的就disable
                cloneCalendarList = this.lockStartDateBefore(cloneCalendarList, startDate);
                // 設定預設要鎖定的日期
                cloneCalendarList = this.lockDefaultStartBeforeAndEndAfterDate(cloneCalendarList);
                // 設定State目前選擇狀態為 back
                calendarState.selectState = 'back';
                // 設定State去程日期
                calendarState.startDate = nowTargetDateDayObj.date;
            }
            else {
                isNeedReRender = false;
                console.log('點擊到無效日期!!!');
            }
        }
        // 回程狀態
        if (this.state.calendarState.selectState === 'back') {
            // 設定目前選擇狀態為 go
            calendarState.selectState = 'go';
            // 設定結束位置
            nowTargetDateDayObj.isEnd = true;
            let endDate = moment(nowTargetDateDayObj.date).format('YYYY/MM/DD');
            let startDate = this.findStartOrEndDate('isStart', cloneCalendarList);
            // 如果click 下去的日期比開始日還早就return 就將所有狀態重置，並將isStart設定成當前狀態
            if (moment(endDate).isAfter(startDate)) {
                // 結束日大於開始日的情況(正常情況)
                // render between
                cloneCalendarList = this.isRenderBetween(cloneCalendarList, startDate, endDate);
                // 鎖定日期
                cloneCalendarList = this.lockDefaultStartBeforeAndEndAfterDate(cloneCalendarList);
                // 設定State回程日期
                calendarState.backDate = nowTargetDateDayObj.date;
            }
            else {
                // 結束日小於開始日的情況
                // 沒有StartDate的時候，就紀錄isEnd 狀態並重新render，如果有的話代表開始日大於結束日視同無效日處理
                if (!startDate || startDate === undefined || startDate === null) {
                    cloneCalendarList = this.lockDefaultStartBeforeAndEndAfterDate(cloneCalendarList);
                }
                else {
                    isNeedReRender = false;
                    console.log('點擊到無效日期!!!');
                }

            }
        }
        // null 比較!! === undefined
        if (isNeedReRender && !!calendarState.selectState && cloneCalendarList) {
            this.props.whenClickDate();
            this.updateCalendarState(cloneCalendarList, calendarState);
        }
    }

    // 重置所有state狀態
    reseteCalendarState (cloneCalendarList) {
        return cloneCalendarList.map(items => {
            items.dateDayList.map(item => {
                item.isStart = false;
                item.isEnd = false;
                item.isBetween = false;
                return item;
            });
            return items;
        });

    }

    // click 完月曆統一變更State cloneCalendarList = 月曆陣列資料 , calendarStateObj= 月曆state  calendarState資料
    updateCalendarState (cloneCalendarList, calendarStateObj) {
        if (calendarStateObj && cloneCalendarList) {
            let calendarState = {
                'selectState': calendarStateObj.selectState || this.state.calendarState.selectState || null,
                'startDate': calendarStateObj.startDate || this.state.calendarState.startDate || null,
                'backDate': calendarStateObj.backDate || this.state.calendarState.backDate || null
            };

            this.store.dispatch({
                type: 'updateCalendarState',
                calendarState: calendarState,
                calendarData: cloneCalendarList
            });
            this.setState(this.store.getState());
        }
    }

    // 鎖住去程之前的日期，只要比去程日期早的就disable
    lockStartDateBefore (cloneCalendarList, startDate) {
        return cloneCalendarList.map((items) => {
            items.dateDayList.map(item => {
                let selfDate = moment(item.date);
                if (selfDate.isBefore(startDate)) {
                    item.isDisable = true;
                }
                return item;
            });
            return items;
        });
    }

    // 鎖住起始日前與結束日後前的日期
    lockDefaultStartBeforeAndEndAfterDate (calendarList) {
        return calendarList.map((items, index) => {
            items.dateDayList.map(item => {
                let isBeforeThanStart = moment(item.date).isBefore(this.props.startDate);
                let isAfterThanEnd = moment(item.date).isAfter(this.props.endDate);
                if (isBeforeThanStart || isAfterThanEnd) {
                    item.isDisable = true;
                }
                return item;
            });
            return items;
        });
    }

    // 去程日期回程 中間的日期且是合理不是 disable 的日期的都選取起來
    isRenderBetween (cloneCalendarList, startDate, endDate) {
        return cloneCalendarList.map((items) => {
            items.dateDayList.map(item => {
                // 預設先重置所有between && isEnd 狀態，在下方判斷若是本日期是跟endDate一樣且不是disable的格子就設定isEnd(終點)狀態
                item.isEnd = false;
                item.isBetween = false;

                let selfDate = moment(item.date);
                // 只要在去程日期回程 中間的日期且是合理日期的都選取起來
                if (selfDate.isBetween(startDate, endDate) && !item.isDisable) {
                    item.isBetween = true;
                }
                // 在是click最後一天上標記isEnd狀態
                if (selfDate.isSame(endDate) && !item.isDisable) {
                    item.isEnd = true;
                }
                // 先將所有disable解除後面配合 lockDefaultStartBeforeAndEndAfterDate 鎖定預設 disable日期
                item.isDisable = false;
                return item;
            });
            return items;
        });
    }

    // 起始或結束的日期
    findStartOrEndDate (dayState, newDateDayObj = JSON.parse(JSON.stringify(this.state.calendarData))) {
        let returnDate = '';
        newDateDayObj.find(items => {
            items.dateDayList.find(item => {
                if (item[dayState] === true) {
                    returnDate = moment(item.date).format('YYYY/MM/DD');
                }
            });
        });

        return returnDate;
    }

    // 取得幾晚
    getTotalNight () {
        let newDateDayObj = JSON.parse(JSON.stringify(this.state.calendarData));
        let totalNightCount = 0;

        let endDate = this.findStartOrEndDate('isEnd');
        let startDate = this.findStartOrEndDate('isStart');

        newDateDayObj.map((items) => {
            items.dateDayList.map(item => {
                let selfDate = moment(item.date);
                // 如果再開始跟結束中間的日期就選起來，但最後一天也算一晚所以也要選取
                if ((selfDate.isBetween(startDate, endDate) && !item.isDisable) || selfDate.isSame(endDate)) {
                    totalNightCount++;
                }
            });
        });
        // console.log('between', moment('2018/02/10').isBetween('2018/02/08','2018/02/10'));

        return totalNightCount;
    }

    // 給定單格儲存格Class
    getCalendarMobileBodyTdDayClass (dateItem) {
        let classNameStr = 'calendarMobileBodyTdDay';
        if (dateItem.isHoliday || dateItem.isToday) {
            classNameStr += ' holiday';
        }

        if (dateItem.isStart) {
            classNameStr += ' isStart';
        }
        if (dateItem.isEnd) {
            classNameStr += ' isEnd';
        }
        if (dateItem.isBetween) {
            classNameStr += ' isBetween';
        }

        if (dateItem.isDisable) {
            classNameStr += ' isDisable';
        }


        return classNameStr;
    }

    // 變更上方Label Class 狀態
    getSelectStateClass (selectState) {
        let classStr = 'dateLabelContent';
        if (this.state.calendarState.selectState === selectState) {
            classStr += ' active';
        }
        if (this.state.calendarState.selectState === selectState) {
            classStr += ' active';
        }

        return classStr;
    }
    // 設定 isSelect 模式
    setSelectLabelState (selectState, e) {
        // 是選擇 mode 在開啟
        if (this.props.isSelect) {
            if (selectState) {
                let cloneCalendarList = JSON.parse(JSON.stringify(this.state.calendarData));
                let startDate = this.findStartOrEndDate('isStart', cloneCalendarList);
                if (selectState === 'back') {
                    // click 回程要 lock 目前月曆上 StartDate 前的日期
                    cloneCalendarList = this.lockStartDateBefore(cloneCalendarList, startDate);
                }
                if (selectState === 'go') {
                    // click 去程要 除了 預設startDate 前&& endDate 後的日期都lock
                    cloneCalendarList.map((items, index) => {
                        items.dateDayList.map(item => {
                            let isBeforeThanStart = moment(item.date).isBefore(this.props.startDate);
                            let isAfterThanEnd = moment(item.date).isAfter(this.props.endDate);
                            if (isBeforeThanStart || isAfterThanEnd) {
                                item.isDisable = true;
                            }
                            else {
                                item.isDisable = false;
                            }
                        });
                    });
                }
                // 修改 calendarState.selectState資料
                this.store.dispatch({
                    type: 'setSelectLabelState',
                    calendarState: {
                        'selectState': selectState
                    },
                    calendarData: cloneCalendarList
                });

                this.setState(this.store.getState());
            }
        }
        else {
            console.log('非 isSelect mode');

        }
    }

    // 從外部取得日期
    getResultDate () {
        return {
            startDate: this.state.calendarState.startDate,
            endDate: this.state.calendarState.endDate
        };
    }
 
    render () {
        return (
            <div className="calendarMobile">
                <div className="calendarMobileHeader">
                    <div className="dayInfos">
                        <CalendarLabel 
                            dateTitle="去程日期"
                            dateText={this.state.calendarState.startDate}
                            nowActiveClassFunc={this.getSelectStateClass('go')}
                            onLabelClickFunc={this.setSelectLabelState.bind(this, 'go')}
                        />
                        <div className="dayInfosDash">~</div>
                        <CalendarLabel
                            dateTitle="回程日期"
                            dateText={this.state.calendarState.backDate}
                            nowActiveClassFunc={this.getSelectStateClass('back')}
                            onLabelClickFunc={this.setSelectLabelState.bind(this, 'back')}
                        />
                        <div className="dayInfoNightCountLabel">共 {this.getTotalNight()} 晚</div>
                    </div>
                    <CalendarTitle calendarTitle={this.calendarTitle} />
                </div>
                <CalendarMobileBodyContainer
                    calendarData={this.state.calendarData}
                    setTdDayClass={this.getCalendarMobileBodyTdDayClass}
                    dateClickFunc={this.dateClick}
                />    
            </div>
        );
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
}

export default CSSModules(Module, styles, {
    allowMultiple: true
});
