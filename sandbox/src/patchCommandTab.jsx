import React, { useState } from "react";
import { Tabs , Input, Form, Select } from 'antd';
import PatchesApply from './patchesApply.jsx';
import CommandsApply from './comandsApply.jsx';
const PatchCommandTab = () =>{
    const [ownerEmail, setOwnerEmail]= useState("hello");
    const [clusterName, setClusterName]= useState("hello");
    const [cenv, setCENV]= useState("hello");
    const items = [
        {
            key: '1',
            label: 'Apply Patch',
            children: <PatchesApply ownerEmail={ownerEmail} clusterName={clusterName} env={cenv}/>,
        },
        {
            key: '2',
            label: 'Apply Commands',
            children: <CommandsApply ownerEmail={ownerEmail} clusterName={clusterName} env={cenv}/>,
        },
    ];
    return(
        <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-4">
                <Input addonBefore={<strong>Cluster Name :</strong>} onChange={(event) => setClusterName(event.target.value)} />
                <Input addonBefore={<strong>Cluster Name :</strong>} onChange={(event) => setOwnerEmail(event.target.value)} />
                <Select
                    defaultValue="dev"
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
                        setCENV(value)}}
                />
            </div>
            <Tabs defaultActiveKey="1" items={items}/>
        </div>
    )
}
export default PatchCommandTab;