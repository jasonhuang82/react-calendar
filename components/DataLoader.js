import moment from 'moment';
import 'moment/locale/zh-cn';

export default class DataLoader {
    constructor () {
        DataLoader.setMoment();
    }
    static props = {
        startDate: '2018/02/05',
        endDate: '2020/06/28'
    };

    // 設定moment初始化
    static setMoment () {
        moment.locale('zh-cn');
        // debug mode
        // console.log('moment is run : ', moment.locale());
        // console.log(DataLoader.isHoliday('2018/02/10'));
        // DataLoader.getMonthFirstDay('2018/04/10');
        // console.log(moment('2014/01/01').isValid()); 驗證日期是否為正確
        // console.log(moment(預放入日期).day());
        // DataLoader.countDiffMonth('2018/04/10', '2018/10/10');
    }

    // 轉換成中文年月
    static getChineseDate (date) {
        let isValid = DataLoader.isValidDate(date);
        if (isValid) {
            return moment(date).format('YYYY年MM月');
        }
    }

    // 取得開始到結束日區間年月
    static getDateDiffArr (minMon = DataLoader.props.startDate, maxMon = DataLoader.props.endDate) {
        // let minMon = DataLoader.props.startDate;
        // let maxMon = DataLoader.props.endDate;
        let isValid = DataLoader.isValidDate(minMon) && DataLoader.isValidDate(maxMon);
        if (isValid) {
            minMon = moment(minMon).format('YYYY/MM/DD');
            maxMon = moment(maxMon).format('YYYY/MM/DD');
            // 計算相差 明天render start to end
            let totalDateArr = [];
            // 日期月份相差預設會少1要+1抵銷回來
            let diffMonths = DataLoader.countDiffMonth(minMon, maxMon);
            // 如果開始月份加上相差月份還小於結束月份就會將相差月份補齊與結束月份一樣
            if (moment(minMon).add(diffMonths, 'months').month() < moment(maxMon).month()) {
                diffMonths++;
            }
            // 用起始月份加上相差月份 === 要render結束的月份
            let endMon = parseInt(moment(minMon).month()) + parseInt(diffMonths);
            // 產出所有需要印出的日曆標頭，並同時決定要印幾個
            for (let startMon = parseInt(moment(minMon).month()); startMon <= endMon; startMon++) {    
                let monthStr = new Date(moment(minMon).year(), DataLoader.autoFillZero(startMon)).toISOString();
                let dateStr = moment(monthStr).format('YYYY/MM');
                totalDateArr.push(dateStr);
                // debug mode
                // console.log(moment(minMon).year() + '/' + DataLoader.autoFillZero(startMon) );
                // console.log(`${startMon + 1}月:`, moment(monthStr).format('YYYY/MM'));
            }
            // debug mode
            console.log('起始到結束月', parseInt(moment(minMon).month()) + parseInt(diffMonths));
            console.log('開啟日期', minMon);
            console.log('相差月份', diffMonths);
            console.log('開啟日期加相差日期',moment(minMon).add(diffMonths, 'months').format('YYYY/MM/DD'));
            console.log('結束日期',maxMon);
            console.log('起加上差比結束早?', moment(minMon).add(diffMonths, 'months').isBefore(moment(maxMon)));
            // console.log('總共年月數', totalDateArr);
            return totalDateArr;
        }
    }

    // 需要知道當下月份是從星期幾開始然後決定要推擠格 td
    static getDaysInMonthPushGap (date, dayCount) {
        let isValid = DataLoader.isValidDate(date);
        if (isValid && dayCount === 1) {
            let firstDay = DataLoader.getMonthFirstDay(date);
            let marginGap = ((100 / 7) * firstDay) + '%';
            // debug mode
            // console.log('margin-left 推了 : ' + marginGap);

            return {
                'marginLeft': marginGap
            };
        }
    }

    // 產生月曆
    static produceCalendar (minMon = DataLoader.props.startDate, maxMon = DataLoader.props.endDate) {
        let isValid = DataLoader.isValidDate(minMon) && DataLoader.isValidDate(maxMon);
        if (isValid) {
            let totalDateArr = [];
            let allDateYearMonth = DataLoader.getDateDiffArr(minMon, maxMon); // 產出月曆標頭並決定要印幾個月曆
            allDateYearMonth.map((items, index) => {
                // 取得結束 = > 開始 相差月數
                let nowMonthObj = { // 純當月的表頭&&所有日期物件
                    dateTitle: items,
                    dateDayList: []
                };
                let nowMonthArr = []; // 純單月份所有的日期
                let renderDays = `${items}/01`; // 為了用moment驗證日期需先轉換成 YYYY/MM/DD格式
                let isValid = DataLoader.isValidDate(renderDays);
                if (isValid) {
                    // 取年與月讓迴圈生呈每日日期
                    let yearAndMonthStr = moment(renderDays).format('YYYY/MM');
                    // 取得當月有幾天
                    renderDays = DataLoader.getDaysInMonth(renderDays);
                    // 生成整包當月天數物件
                    for (let dayCount = 1; dayCount <= renderDays; dayCount++) {
                        let dayCountClone = DataLoader.autoFillZero(dayCount.toString()); // 將loop 計算出日期數
                        let dateClone = yearAndMonthStr + '/' + dayCountClone; // 組成 YYYY/MM/DD格式
                        // 取得今日日期並格式化不然isSame會格式錯誤永遠都false
                        let formatTodayObj = moment(moment(minMon).format('YYYY/MM/DD'));
                        // 如果loop出的日期符合今日就是 isToday
                        let isToday = formatTodayObj.isSame(dateClone);
                        nowMonthArr.push(
                            {
                                day: dayCount,
                                date: dateClone,
                                isStart: false,
                                isEnd: false,
                                isDisable: false,
                                isHoliday: DataLoader.isHoliday(dateClone),
                                isToday: isToday,
                                isBetween: false
                            }
                        );
                    }
                    nowMonthObj.dateDayList = nowMonthArr;
                    totalDateArr.push(nowMonthObj);
                }
            });
            return totalDateArr;
        }
    }

    // 自動補零
    static autoFillZero (dayCount) {
        let dayCountClone = dayCount.toString();
        while (dayCountClone.length < 2) {
            dayCountClone = '0' + dayCountClone;
        }
        return dayCountClone;
    }

    // 相差月份計算 == 總共要跑幾個 月曆 第一層
    static countDiffMonth (minMon = DataLoader.props.startDate, maxMon = DataLoader.props.endDate) {
        let isValid = DataLoader.isValidDate(minMon) && DataLoader.isValidDate(maxMon);
        if (isValid) {
            let minDate = moment(minMon);
            let maxDate = moment(maxMon);
            let diffMonth = maxDate.diff(minDate, 'month');
            // debug mode
            // console.log(`${minDate.format('YYYY/MM/DD')} 到 ${maxDate.format('YYYY/MM/DD')} 相差 ${diffMonth} 月`);
            return diffMonth;
        }
    }

    // 計算這個月有幾天 用於迴圈跑月立時每個月"天"的次數 第二層
    static getDaysInMonth (date) {
        let isValid = DataLoader.isValidDate(date);
        if (isValid) {
            let momentObj = moment(date);
            let dayInMonthCount = momentObj.daysInMonth();
            // debug Mode
            // console.log(`${momentObj.format('YYYY/MM/DD')} 當月天數 = ${dayInMonthCount}`);
            return dayInMonthCount;
        }
    }

    // 驗證日期方法
    static isValidDate (date) {
        let day = moment(date);
        if (day.isValid()) {
            return true;
        }
        else {
            console.log('輸入無效日期');
            return false;

        }
    }
    // 取得當月第一天
    static getMonthFirstDay (date) {
        let isValid = DataLoader.isValidDate(date);

        if (isValid) {
            let day = moment(date);
            let dayStr = day.startOf('month').format('YYYY-MM-DD');
            dayStr = moment(dayStr);
            // debug mode
            // console.log(`${day.format('YYYY/MM/DD')} 當月第一天為星期 ${dayStr.day()}`);
            return dayStr.day();
        }
    }

    // 確定日期是否為假日
    static isHoliday (date) {
        let isValid = DataLoader.isValidDate(date);
        if (isValid) {
            let day = moment(date);
            day = day.day();
            if (day === 0 || day === 6) {
                return true;
            }
            else {
                return false;
            }
        }
    }

}

