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
            selectState: 'go'
        };
        this.startDateLabel = '2018/02/09'; // label 上的文字
        this.endDateLabel = '2018/06/08'; // label 上的文字
    }

    // ===== 生命週期 ref = https://ithelp.ithome.com.tw/articles/10185194 =====
    componentWillMount () {
        // Component將要被mount在畫面上時，會執行這個方法，會發生在第一次render()之前，
        // 也因為在會在render()之前，所以在這邊設定任何state也就不會觸發re-render
        console.log('componentWillMount');
        this.bindThis();
        DataLoader.setMoment();
        let calendarList = DataLoader.produceCalendar(this.props.startDate, this.props.endDate);
        this.setState({ calendarData: calendarList });
        // DataLoader.getDaysInMonth(this.props.startDate);

        // DataLoader.getDaysInMonthPushGap(this.props.startDate);
        // // js 月份從 0 開始算 0-11 12== 下一年一月
        // DataLoader.getDateDiffArr(this.props.startDate, this.props.endDate);

    }
    componentWillUpdate (nextProps, nextState) {
        // 接收到新的props和state時，re-render之前
        // 會去接收 setState過來的 props or State 存在參數裡，也就是若是需要使用剛剛setState來的資料就需要用參數接過來
        // 只有使用this.state.xx 會只抓到當下未更新的state
        console.log('componentWillUpdate');
    }
    bindThis () {
        this.props.functionNames.map((item) => this[item] = this[item].bind(this));
    }

    // click 日期時，決定是去程狀態或回程狀態行為
    dateClick (tableIndex, tdIndex, e) {
        let cloneCalendarList = JSON.parse(JSON.stringify(this.state.calendarData));
        // click 下去那包物件
        let nowTargetDateDayObj = cloneCalendarList[tableIndex].dateDayList[tdIndex];
        if (this.state.selectState === 'go') {

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
            let startDate = this.findStartOrEndDate('isStart',cloneCalendarList);


            // 只要比去程日期早的就disable
            cloneCalendarList.map((items) => {
                items.dateDayList.map(item => {
                    let selfDate = moment(item.date);
                    if (selfDate.isBefore(startDate)) {
                        item.isDisable = true;
                    }
                });
            });

            this.setState({
                selectState: 'back',
                calendarData: cloneCalendarList
            });
        }

        if (this.state.selectState === 'back') {
            // // 如果回程時去程日期比去程早就
            // 設定結束位置
            nowTargetDateDayObj.isEnd = true;
            this.endDateLabel = nowTargetDateDayObj.date;
            let endDate = moment(nowTargetDateDayObj.date).format('YYYY/MM/DD');
            // let startDate;
            // cloneCalendarList.find(items => {
            //     items.dateDayList.find(item => {
            //         if (item.isStart === true) {
            //             startDate = moment(item.date).format('YYYY/MM/DD');
            //         }
            //     });
            // });
            let startDate = this.findStartOrEndDate('isStart', cloneCalendarList);

            // 如果click 下去的日期比開始日還早就return 就將所有狀態重置，並將isStart設定成當前狀態
            if (!moment(endDate).isBefore(startDate)) {
                cloneCalendarList.map((items) => {
                    items.dateDayList.map(item => {
                        let selfDate = moment(item.date);
                        // 只要在去程日期回程 中間的日期且是合理日期的都選取起來
                        if (selfDate.isBetween(startDate, endDate) && !item.isDisable) {
                            item.isBetween = true;
                        }
                        item.isDisable = false;
                    });
                });
                this.setState({
                    selectState: 'go',
                    calendarData: cloneCalendarList
                });
            }
            // else {
                // 第一次 去程行為
            // }
        }
    }

    // 起始或結束的日期
    findStartOrEndDate(dayState, newDateDayObj = JSON.parse(JSON.stringify(this.state.calendarData))) {
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
                if ( (selfDate.isBetween(startDate, endDate) && !item.isDisable) || selfDate.isSame(endDate) ) {
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

    setSelectLabelState (selectState, e) {
        // if (selectState) {
        //     console.log(selectState);
        //     this.setState({ selectState: selectState });
        // }
    }

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

/*  style={DataLoader.getDaysInMonthPushGap(item.date, item.day)}
*/
// Props default value write here
CalendarMobile.defaultProps = {
    functionNames: [
        'bindThis',
        'dateClick',
        'getCalendarMobileBodyTdDayClass',
        'setSelectLabelState',
        'getSelectStateClass',
        'getTotalNight'
    ],
    startDate: '2018/02/05',
    endDate: '2018/06/28'
};

// // Typechecking with proptypes, is a place to define prop api
CalendarMobile.propTypes = {
    //     color: React.PropTypes.string
};