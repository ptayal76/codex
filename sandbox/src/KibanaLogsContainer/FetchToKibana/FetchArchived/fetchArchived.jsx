import {React, useEffect, useState} from "react";
import { Input } from 'antd';
import { Radio , DatePicker, Row, InputNumber, TimePicker, message, Select} from 'antd';
import { useCluster } from '../../../ClusterContext.jsx';
import dayjs from "dayjs";
const userEmail="tanmay.pani@thoughtspot.com";
const FetchArchived = ()=> {
    const [cenv, setCenv ] = useState("staging");
    const {kibanaFormInputs}= useCluster();
    const { Cluster_Id}= kibanaFormInputs;
    const [days, setDays] = useState(0);
    const [time, setTime] = useState(dayjs('00:00', 'HH:mm'));
    const [anyMessage, setAnyMessage]= useState({
        message: null,
        status: null,
    })
    function convertMinutesToISO8601(minutes) {
        const days = Math.floor(minutes / 1440);
        minutes %= 1440;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = Math.floor(minutes % 60);
        const seconds = Math.floor((minutes % 1) * 60);  // Calculate remaining seconds
    
        let duration = 'P';
        if (days > 0) {
            duration += `${days}D`;
        }
        if (hours > 0 || remainingMinutes > 0 || seconds > 0) {
            duration += 'T';
            if (hours > 0) {
                duration += `${hours}H`;
            }
            if (remainingMinutes > 0) {
                duration += `${remainingMinutes}M`;
            }
            if (seconds > 0) {
                duration += `${seconds}S`;
            }
        }
        return duration;
    }
    const convertDateTimetoMinutes =(dateString) => {
        const [selectDate,selectTime]= dateString.split(' ');
        const selectTimeStamp= selectDate+ 'T' +selectTime;
        return selectTimeStamp;
    }
    const [archivedFormInputs, setArchivedFormInputs]= useState({
        startDate: convertDateTimetoMinutes(dayjs().format('YYYY-MM-DD HH:mm')),
        logDuration: convertMinutesToISO8601(0),
        clusterId: Cluster_Id,
        userEmail: userEmail,
        files: [],
        services: [],
        env: cenv,
    });
    useEffect(()=>{
        setArchivedFormInputs({
            ...archivedFormInputs,
            clusterId: Cluster_Id,
        });
    },[Cluster_Id])
    const handleSubmit= async (event) =>{
        event.preventDefault();
        console.log("clicked on Fetch Archived");
        console.log("archived log form: ",archivedFormInputs);
        try {
            const response = await fetch('http://localhost:4000/fetch-archived-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(archivedFormInputs),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            } else {
                const res = await response.json();
                if (res) {
                    console.log("frontend data",res);
                    setAnyMessage(res);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle errors
        }
    }
    const handleInputChange= (event)=>{
        console.log("input changed");
        setArchivedFormInputs({
            ...archivedFormInputs,
            [event.target.name]: event.target.value
        });
    }
    const [value, setValue] = useState(1);
    const onChange = (e) => {
        console.log('radio checked', e.target.value);
        setValue(e.target.value);
    };
    const handleDaysChange = (value) => {
        const totalHours = value * 24 + time.hour();
        if (totalHours > 48) {
          message.error('The total duration cannot exceed 48 hours.');
          setDays(2);
          const totalminutes= 48*60;
          
          setArchivedFormInputs({
            ...archivedFormInputs,
            logDuration: convertMinutesToISO8601(totalminutes)
          })
        } else {
          setDays(value);
          const totalminutes= totalHours*60;
          
          setArchivedFormInputs({
            ...archivedFormInputs,
            logDuration: convertMinutesToISO8601(totalminutes)
          })
        }
    };
    const handleTimeChange = (time) => {
        if (!time) {
            setTime(dayjs('00:00', 'HH:mm'));
            return;
        }
        const totalHours = days * 24 + time.hour();
        if (totalHours > 48) {
            message.error('The total duration cannot exceed 48 hours.');
            setTime(dayjs('00:00', 'HH:mm'));
            const totalminutes= days*24*60;
            
            setArchivedFormInputs({
                ...archivedFormInputs,
                logDuration: convertMinutesToISO8601(totalminutes)
            })
        } else {
            setTime(time);
            const totalminutes= totalHours*60;
            
            setArchivedFormInputs({
                ...archivedFormInputs,
                logDuration: convertMinutesToISO8601(totalminutes)
            })
        }
    };
    return (
        <div>
            <div className="flex flex-col gap-10">
                <ul className="flex flex-col gap-4">
                    <li className="flex flex-row items-center gap-6">
                        <div className="flex flex-row items-center">
                        <span className="px-3 py-1 bg-gray-50 border border-gray-300 rounded-md font-semibold">
                            Select Start Date and Time:
                        </span>
                        <DatePicker
                            showTime
                            defaultValue={dayjs()}
                            onChange={(value, dateString) => {
                                console.log('Selected Time: ', value);
                                console.log('Formatted Selected Time: ', dateString);
                                setArchivedFormInputs({
                                    ...archivedFormInputs,
                                    startDate: convertDateTimetoMinutes(dateString)
                                })
                            }}
                            className="w-64 rounded-md"
                            placeholder="Select date and Time"
                            format="YYYY-MM-DD HH:mm"
                        />
                        </div>
                        <div className="flex flex-row items-center">
                            <Row gutter={16} align="middle">
                                <span className="px-3 py-1 bg-gray-50 border border-gray-300 rounded-md font-semibold">
                                    Select Log Duration:
                                </span>
                                <InputNumber
                                    min={0}
                                    max={2}
                                    value={days}
                                    onChange={handleDaysChange}
                                    placeholder="Days"
                                    className="w-24"
                                />
                                <TimePicker
                                    value={time}
                                    onChange={handleTimeChange}
                                    format="HH:mm"
                                    defaultOpenValue={dayjs('00:00', 'HH:mm')}
                                    placeholder="HH:mm"
                                    className="w-36"
                                />
                            </Row>
                        </div>
                        <Select
                            defaultValue={cenv}
                            style={{
                                width: 120,
                            }}
                            options={[
                                {
                                    value: 'dev',
                                    label: 'dev',
                                },
                                {
                                    value: 'staging',
                                    label: 'staging',
                                },
                                {
                                    value: 'prod',
                                    label: 'prod',
                                }
                            ]}
                            onChange={(value)=> {
                                setCenv(value)
                                setArchivedFormInputs({
                                    ...archivedFormInputs,
                                    env: cenv
                                })
                            }}
                            size="default"
                        />
                    </li>
                    <li className="flex flex-row gap-4">
                        <strong>Enable All Logs: </strong>
                        <Radio.Group onChange={onChange} value={value}>
                            <Radio value={1}>YES</Radio>
                            <Radio value={2}>NO</Radio>
                        </Radio.Group> 
                    </li>

                </ul>
                {value===2?( <div className="flex flex-col gap-2 w-1/2">
                                <Input placeholder="Comma separated orion service names" addonBefore={<strong>Orion Service Names :</strong>} onChange={handleInputChange} name="services"/>
                                <div className="flex flex-grow justify-center">And/Or</div>
                                <Input placeholder="Comma separated file names" addonBefore={<strong>File Names :</strong>} onChange={handleInputChange} name="files"/>
                                <div className="flex flex-grow justify-center">Ex: /usr/local/scaligent/logs/tscli_cluster_status,/export/logs/oreo/oreo_main.INFO</div>
                             </div>
                           )
                    : null
                }
                <button className="submit-button w-1/4" onClick={handleSubmit}>Get Archived Logs</button>
                {
                    anyMessage.message? (
                        <div>
                            {/* Render the properties of the anyMessage object here */}
                            <p>{anyMessage.message}</p>
                            <p>{anyMessage.status}</p>
                            {/* Add other properties as needed */}
                        </div>
                    ): null
                }
            </div>

            
        </div>
    )
}
export default FetchArchived;

