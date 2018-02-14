import React from 'react';
import PropTypes from 'prop-types';
import DataLoader from './DataLoader';

// 只render畫面可使用函數式組件，但若有需要函數操作建議使用 class 組件
const CalendarMobileBodyContainer = ({ calendarData, setTdDayClass, dateClickFunc }: CalendarMobileBodyContainerProps) => {
    // defaultChecked情況與上面說的defaultValue類似，這也是React中的人造元素才有的屬性
    // 相當於 html 中的value
    // 若設定表單輸入元件 不能直接設定value 屬性除非配合 onChange事件不然react會視為只能讀不能寫的元件
    return (
        <div className="calendarMobileBody">
            {
                calendarData.map((dayitems, index) => {
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
                                                <li className={setTdDayClass(item)}
                                                    key={Math.random()}
                                                    style={DataLoader.getDaysInMonthPushGap(item.date, item.day)}
                                                    onClick={() => { dateClickFunc(index, i)}}
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
    );
};
export default CalendarMobileBodyContainer;

