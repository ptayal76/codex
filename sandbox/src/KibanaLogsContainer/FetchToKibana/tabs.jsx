import React, { useState } from "react";
import { Tabs } from 'antd';
import FetchRealTime from './FetchRealTime/fetchRealTime.jsx';
import FetchArchived from './FetchArchived/fetchArchived.jsx';
const KibanaTabs = () =>{
    const items = [
        {
            key: '1',
            label: 'Fetch Archived Logs',
            children: <FetchArchived/>,
        },
        {
            key: '2',
            label: 'Fetch Real Time Logs',
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