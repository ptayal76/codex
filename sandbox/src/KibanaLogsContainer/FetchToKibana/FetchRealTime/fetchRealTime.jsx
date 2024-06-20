import {React, useState} from "react";
import { Input, message } from 'antd';
import { Radio , Select} from 'antd';
import { useCluster } from "../../../ClusterContext.jsx";
const FetchRealTime = ()=> {
    const [cenv, setCenv]= useState("staging");
    const userEmail= "tanmay.pani@thoughtspot.com";
    const [anyMessage, setAnyMessage]= useState({
        message: null,
        status: null
    });
    const [permanentFileService, setPermanentFileService]= useState({
        files: null,
        services: null
    })
    const {kibanaFormInputs}= useCluster();
    const { Cluster_Id}= kibanaFormInputs;
    const [realTimeFormInputs, setRealTimeFormInputs]= useState({
        logDuration: 0,
        clusterId: Cluster_Id,
        userEmail: userEmail,
        files: [],
        services: [],
        env: cenv,
    })
    const handleSubmit= async (event)=>{
        event.preventDefault();
        console.log("clicked on Fetch Archived");
        console.log("archived log form: ",realTimeFormInputs);
        try {
            const response = await fetch('http://localhost:4000/fetch-real-time-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(realTimeFormInputs),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            } else {
                const res = await response.json();
                if (res) {
                    console.log("frontend data for real time logs",res);
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
        setRealTimeFormInputs({
            ...realTimeFormInputs,
            [event.target.name]: event.target.value
        });
        if(event.target.name!== "logDuration"){
            setPermanentFileService({
                ...permanentFileService,
                [event.target.name]: event.target.value,
            })
        }
    }
    const [value, setValue] = useState(1);
    const onChange = (e) => {
        console.log('radio checked', e.target.value);
        setValue(e.target.value);
        if(e.target.value===1){
            setRealTimeFormInputs({
                ...realTimeFormInputs,
                files: [],
                services: [],
            })
        }
        else{
            setRealTimeFormInputs({
                ...realTimeFormInputs,
                files: [permanentFileService.files],
                services: [permanentFileService.services],
            })
        }
    };

    return (
        <div className=" flex flex-col gap-6">
            <div className="flex flex-col gap-10 w-1/2">
            <div className="flex flex-row gap-4">
                <Input placeholder="Active Minutes*" addonBefore={<strong>Enable/Disable Realtime Logs :</strong>} onChange={handleInputChange} name="logDuration"/>
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
                        setRealTimeFormInputs({
                            ...realTimeFormInputs,
                            env: value
                        })
                    }}
                    size="default"
                />
            </div>
                <div className="flex flex-row gap-4">
                    <strong>Enable All Logs: </strong>
                    <Radio.Group onChange={onChange} value={value}>
                        <Radio value={1}>YES</Radio>
                        <Radio value={2}>NO</Radio>
                    </Radio.Group> 
                </div>
                {value===2?( <div className="flex flex-col gap-2">
                                <Input placeholder="Comma separated orion service names" addonBefore={<strong>Orion Service Names :</strong>} onChange={handleInputChange} name="services" value={permanentFileService.files}/>
                                <div className="flex flex-grow justify-center">And/Or</div>
                                <Input placeholder="Comma separated file names" addonBefore={<strong>File Names :</strong>} onChange={handleInputChange} name="files" value={permanentFileService.services}/>
                                <div className="flex flex-grow justify-center">Ex: /usr/local/scaligent/logs/tscli_cluster_status,/export/logs/oreo/oreo_main.INFO</div>
                             </div>
                           )
                    : null
                }
                <button onClick={handleSubmit} className="submit-button w-1/2">Enable Real Time Logs</button>
            </div>
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
    )
}
export default FetchRealTime;