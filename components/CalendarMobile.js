import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment/locale/zh-cn';
import DataLoader from './DataLoader';


export default class CalendarMobile extends React.Component {
    constructor (props) {
        // super是呼叫上層父類別的建構式
        super(props);
        this.state = {
            calendarData: [],
            selectState: 'go',
            callBackFuncType: '' // 設定在重新render完執行的callback
        };
        this.startDateLabel = ''; // label 上的文字
        this.endDateLabel = ''; // label 上的文字
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
        // console.log(calendarList);

        // 鎖住起始日前與結束日後前的日期
        calendarList = this.lockDefaultStartBeforeAndEndAfterDate(calendarList);
        this.setState({ calendarData: calendarList });
        // DataLoader.getDaysInMonth(this.props.startDate);

        // DataLoader.getDaysInMonthPushGap(this.props.startDate);
        // // js 月份從 0 開始算 0-11 12== 下一年一月
        // DataLoader.getDateDiffArr(this.props.startDate, this.props.endDate);
        // this.getResultDate();
    }
    componentWillUpdate (nextProps, nextState) {
        // 接收到新的props和state時，re-render之前
        // 會去接收 setState過來的 props or State 存在參數裡，也就是若是需要使用剛剛setState來的資料就需要用參數接過來
        // 只有使用this.state.xx 會只抓到當下未更新的state
        console.log('componentWillUpdate CalendarMobile');
        // 取得日期結果給props
        this.getResultDate();
        // 接收管理所有的callback function 不然寫在 setState 前面可能會抓到就得值
        console.log('now selectState:', nextState.selectState);
    }


    bindThis () {
        this.props.functionNames.map((item) => this[item] = this[item].bind(this));
    }
    // click 日期時，決定是去程狀態或回程狀態行為
    dateClick (tableIndex, tdIndex, e) {
        // 整理資料再一次setState
        let cloneCalendarList = JSON.parse(JSON.stringify(this.state.calendarData));
        // click 下去那包物件
        let nowTargetDateDayObj = cloneCalendarList[tableIndex].dateDayList[tdIndex];
        let isNeedReRender = true; // 是否重render
        let selectStateClone = null; // 目前選擇狀態
        if (this.state.selectState === 'go') {

            // 在去程狀態，若click的是disable狀態不可以有反應
            if (nowTargetDateDayObj.isDisable === false) {
                // 紀錄上一次endDate 的位置
                let endDate = this.findStartOrEndDate('isEnd', cloneCalendarList);

                // 重置所有state狀態
                cloneCalendarList.map(items => {
                    items.dateDayList.map(item => {

                        item.isStart = false;
                        item.isEnd = false;
                        item.isBetween = false;
                    });
                });


                // 設定起始位置
                nowTargetDateDayObj.isStart = true;
                this.startDateLabel = nowTargetDateDayObj.date;
                // let endDate = moment(nowTargetDateDayObj.date).format('YYYY/MM/DD');
                // 找出起始日期
                let startDate = this.findStartOrEndDate('isStart', cloneCalendarList);

                // 設定若是這次click的起始日期比上次的結束日期早的話就繼續接between，並且重新render一次重start到end的狀態，由於一開始就先重置了
                // 但上次end狀態也被清掉必須要補回來不然end會變沒有狀態，一開始有將上次end狀態紀錄，並去利用他重新加上end狀態
                let isNeedAllReset = moment(startDate).isBefore(endDate);
                if (isNeedAllReset && this.props.isSelect) {
                    console.log('本次click 起始日期比上次結束日早，重新紀錄!!');
                    cloneCalendarList = this.isRenderBetween(cloneCalendarList, startDate, endDate);
                }

                // 只要比去程日期早的就disable
                cloneCalendarList = this.lockStartDateBefore(cloneCalendarList, startDate);
                cloneCalendarList = this.lockDefaultStartBeforeAndEndAfterDate(cloneCalendarList);

                selectStateClone = 'back';
            }
            else {
                isNeedReRender = false;
                console.log('點擊到無效日期!!!');
            }
        }

        if (this.state.selectState === 'back') {
            // // 如果回程時去程日期比去程早就
            // 設定結束位置
            nowTargetDateDayObj.isEnd = true;
            this.endDateLabel = nowTargetDateDayObj.date;
            let endDate = moment(nowTargetDateDayObj.date).format('YYYY/MM/DD');
            let startDate = this.findStartOrEndDate('isStart', cloneCalendarList);
            selectStateClone = 'go';
            // 如果click 下去的日期比開始日還早就return 就將所有狀態重置，並將isStart設定成當前狀態
            if (moment(endDate).isAfter(startDate)) {
                // 結束日大於開始日的情況(正常情況)
                // render between
                cloneCalendarList = this.isRenderBetween(cloneCalendarList, startDate, endDate);
                // 鎖定日期
                cloneCalendarList = this.lockDefaultStartBeforeAndEndAfterDate(cloneCalendarList);

                // selectStateClone = 'go';
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
        if (isNeedReRender && !!selectStateClone && cloneCalendarList) {
            this.props.whenClickDate();
            this.setState({
                selectState: selectStateClone,
                calendarData: cloneCalendarList
            });
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
        // let newDateDayObj = JSON.parse(JSON.stringify(this.state.calendarData));
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
        if (this.state.selectState === selectState) {
            classStr += ' active';
        }
        if (this.state.selectState === selectState) {
            classStr += ' active';
        }

        return classStr;
    }

    // 設定 isSelect 模式
    setSelectLabelState (selectState, e) {
        // 是選擇 mode 在開啟
        if (this.props.isSelect) {
            if (selectState) {
                console.log('selectState', selectState);
                let cloneCalendarList = JSON.parse(JSON.stringify(this.state.calendarData));
                let startDate = this.findStartOrEndDate('isStart', cloneCalendarList);
                if (selectState === 'back') {
                    cloneCalendarList = this.lockStartDateBefore(cloneCalendarList, startDate);
                }
                if (selectState === 'go') {
                    // cloneCalendarList = this.lockDefaultStartBeforeAndEndAfterDate(cloneCalendarList);
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
                this.setState({
                    selectState: selectState,
                    calendarData: cloneCalendarList
                });
            }
        }
        else {
            console.log('非 isSelect mode');

        }
    }


    // 從外部取得日期
    getResultDate () {
        return {
            startDate: this.startDateLabel,
            endDate: this.endDateLabel
        };
    }
    render () {
        return (
            <div className="calendarMobile">
                <div className="calendarMobileHeader">
                    <div className="dayInfos">
                        <div className="dateLabel">
                            <div className="dateLabelTitle">去程日期</div>
                            <div className={this.getSelectStateClass('go')}
                                onClick={this.setSelectLabelState.bind(this, 'go')}
                            >
                                {this.startDateLabel}
                            </div>
                        </div>
                        <div className="dayInfosDash">~</div>
                        <div className="dateLabel">
                            <div className="dateLabelTitle">回程日期</div>
                            <div className={this.getSelectStateClass('back')}
                                onClick={this.setSelectLabelState.bind(this, 'back')}
                            >
                                {this.endDateLabel}
                            </div>
                        </div>
                        <div className="dayInfoNightCountLabel">共 {this.getTotalNight()} 晚</div>
                    </div>
                    <ul className="weeksInfos">
                        <li className="holiday">日</li>
                        <li>一</li>
                        <li>二</li>
                        <li>三</li>
                        <li>四</li>
                        <li>五</li>
                        <li className="holiday">六</li>
                    </ul>
                </div>
                <div className="calendarMobileBody">
                    {
                        this.state.calendarData.map((dayitems, index) => {
                            return (
                                <div className="calendarMobileBodyContainer"
                                    key={Math.random()}
                                >
                                    <h4 className="calendarMobileBodyTitle">{DataLoader.getChineseDate(dayitems.dateTitle)}</h4>
                                    <div className="calendarMobileBodyContent">
                                        <ul className="calendarMobileBodyTable">
                                            {
                                                dayitems.dateDayList.map((item, i) => {
                                                    return (
                                                        <li className={this.getCalendarMobileBodyTdDayClass(item)}
                                                            key={Math.random()}
                                                            style={DataLoader.getDaysInMonthPushGap(item.date, item.day)}
                                                            onClick={this.dateClick.bind(this, index, i)}
                                                        >
                                                            <span>{item.day}</span>
                                                        </li>
                                                    );
                                                })
                                            }
                                        </ul>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}


/*
const ModuleDefaults =  {
    startDate: "YYYY/MM/DD",		// 開始可選日期
    endDate: "YYYY/MM/DD",			// 結束的可選日期
    oneClick : false,             // 啟動單點模式
    chooseOnLabel: false,       // 啟動點擊切換模式
    weekdayName: ['日','一','二','三','四','五','六'], //對應星期中文字
    cssClass: {						// 一些可自訂的css
        main: 'cy_gpmb',			// 模組最外容器的 class
        weekdayName: 'weekdayName', // 星期class
        label: 'label',				// 已選日期的顯示標籤
        labelActive: 'active',		// 目前正在選擇的顯示標籤
        yearMonth: 'yearMonth',		// 年月容器的class
        date: 'date',				// 一般日期的class
        holiday: 'holiday',			// 假日外加class
        today: 'today',				// 今日外加class
        disabled: 'disabled',		// 不可選外加class
        selected: 'selected',		// 已選外加class
        between: 'between',			// 已選區間外加class
        start: 'start',				// 已選開始日期外加class
        end: 'end' 					// 已選結束日期外加class
    },
    maxAvaliableDays: '',            //最多可選幾天 type:string or number
    whenClickDate: function ($date) {
        // console.log('whenClickDate', $date);
    }
};
*/
// Props default value write here
CalendarMobile.defaultProps = {
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
    ],
    startDate: '1991/01/01',
    endDate: '1993/01/01',
    isSelect: false,
    getResultDate () {
        console.log('getResultDate');
    },
    whenClickDate () { // click 日期時的callback
        console.log('whenClickDate');
    },
};

// // Typechecking with proptypes, is a place to define prop api
CalendarMobile.propTypes = {
    //     color: React.PropTypes.string
};