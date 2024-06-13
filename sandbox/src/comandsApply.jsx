import React, { useEffect, useRef, useState } from 'react';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
import Highlighter from 'react-highlight-words';

const CommandsApply = ({ownerEmail, clusterName, env}) => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [filterDropdownVisible, setFilterDropdownVisible] = useState({});
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const searchInput = useRef(null);
    const [initialData, setInitialData]= useState([]);
    const [isLoading,setIsLoading]= useState(false);
    const handleChange = (selectedKeys, confirm, dataIndex) => {
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
        const filteredData = initialData.filter(item =>
            item[dataIndex].toString().toLowerCase().includes(selectedKeys[0].toLowerCase())
        );
        setFilteredData(filteredData);
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('./cluster_scripts/commands.txt');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const text = await response.text();
                
                // Preprocess the text to make it valid JSON
                const dataArrayString = text.trim();
                const formattedString = dataArrayString.replace(/'/g, '"'); // Replace single quotes with double quotes
                
                // Remove the enclosing square brackets if they exist
                const cleanString = formattedString.slice(1, -1);
                
                // Split the string by comma to get individual elements
                const dataArray = cleanString.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
                
                // Map to objects with key and commands
                const fetchedArray = dataArray.map((value, index) => ({
                    key: index.toString(),
                    commands: value,
                }));
                
                setInitialData(fetchedArray);
                setFilteredData(fetchedArray);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, []);
    
    
    const applySelected= async () =>{
        let selectedValues='';
        selectedRowKeys.map((keys)=>{
            selectedValues+= initialData[keys].commands;
            selectedValues+= " && ";
        })
        selectedValues= selectedValues.slice(0, -3);
        console.log("Selected patches/commands", selectedValues);
        const selectedValuesObject= {
            owner_email: ownerEmail,
            cluster_name: clusterName,
            commands: [selectedValues],
            env: env,
        }
        console.log("selectedValuesObject : ", selectedValuesObject);
        setIsLoading(true);
        if(selectedValues!==''){
            try {
                const response = await fetch('http://localhost:4000/apply-commands', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body:JSON.stringify(selectedValuesObject)
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                } else {
                    const res = await response.text();
                    if (res) {
                        console.log("response from apply-commands: ", res);
                        //here is the response in string format
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                // Handle errors
            }
            finally {
                setIsLoading(false);
            }
        }
    }
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
        const filteredData = initialData.filter(item =>
            item[dataIndex].toString().toLowerCase().includes(selectedKeys[0].toLowerCase())
        );
        setFilteredData(filteredData);
        setFilterDropdownVisible({
            ...filterDropdownVisible,
            [dataIndex]: false,
        });
        console.log("Filtered Data: ",filteredData);
    };

    const handleReset = (clearFilters, dataIndex) => {
        setSearchText('');
        setFilteredData(initialData);
        setFilterDropdownVisible({
            ...filterDropdownVisible,
            [dataIndex]: false,
        });
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => {
                        const { value } = e.target;
                        setSelectedKeys(value ? [value] : []);
                        if (value !== undefined) {
                            handleChange([value], confirm, dataIndex);
                        }
                    }}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => setFilterDropdownVisible({
                            ...filterDropdownVisible,
                            [dataIndex]: false,
                        })}
                    >
                        <CloseOutlined />
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilterDropdownVisibleChange: (visible) => {
            setFilterDropdownVisible({
                ...filterDropdownVisible,
                [dataIndex]: visible,
            });
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        filterDropdownVisible: filterDropdownVisible[dataIndex],
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: 'Commands',
            dataIndex: 'commands',
            key: 'commands',
            ...getColumnSearchProps('commands'),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys) => {
            const sortedKeys = selectedRowKeys.sort((a, b) => b - a); // Sort the keys in ascending order
            console.log("Row Keys: ", sortedKeys);
            setSelectedRowKeys(sortedKeys);
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
        }),
    };

    const isButtonDisabled = selectedRowKeys.length === 0;
    const [loadings, setLoadings] = useState([]);
    const enterLoading = (index) => {
        setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = true;
        return newLoadings;
        });
        setTimeout(() => {
        setLoadings((prevLoadings) => {
            const newLoadings = [...prevLoadings];
            newLoadings[index] = false;
            return newLoadings;
        });
        }, 2000);
    };
    return (
        <div>
            {filteredData.length? (
                <div>
                    <div className='flex justify-end py-2'>
                        <Button type="primary" loading={loadings[0]} disabled={isButtonDisabled} onClick={() => 
                        {
                            enterLoading(0);
                            applySelected();
                        }}>
                            Apply Commands
                        </Button>
                    </div>
                    <Table
                        rowSelection={{
                            type: 'checkbox',
                            ...rowSelection,
                        }}
                        columns={columns}
                        dataSource={filteredData}
                    />
                </div>)
                :
                (<div>Loading</div>)
            }
        </div>
        
    );
};

export default CommandsApply;
