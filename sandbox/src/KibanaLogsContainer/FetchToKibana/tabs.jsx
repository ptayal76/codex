import React, { useState } from "react";
import { Tabs } from 'antd';
import FetchRealTime from './FetchRealTime/fetchRealTime.jsx';
import FetchArchived from './FetchArchived/fetchArchived.jsx';
const KibanaTabs = () =>{
    const items = [
        {
            key: '1',
            label: 'Get Past Logs',
            children: <FetchArchived/>,
        },
        {
            key: '2',
            label: 'Get Real Time Logs',
            children: <FetchRealTime/>,
        },
    ];
    return(
        <div className="flex flex-col">
            <Tabs defaultActiveKey="1" items={items}/>
        </div>
    )
}
export default KibanaTabs;