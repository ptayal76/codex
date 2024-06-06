import React, { useRef, useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, message } from 'antd';
import Highlighter from 'react-highlight-words';
import { CloseOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import ViewJSON from './ViewJSON/viewJSON.jsx';
import ViewTable from './ViewTable/viewtable.jsx';
const MyTable = ({tableRowData,  innerJSON}) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [filteredData, setFilteredData] = useState(tableRowData); // State to hold filtered tableRowData

  useEffect(() => {
    // Filter tableRowData based on searchText
    const filtered = tableRowData.filter(item => {
      return Object.values(item).some(val =>
        val.toString().toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchText, tableRowData]); // Re-run effect when searchText or tableRowData changes

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const expandedRowRender= (record) =>{
    //record has keys :)
    const jsonarray= innerJSON[record.key];
    const items = [
      {
        key: '1',
        label: `View file as Table`,
        children:<ViewTable jsonFile={jsonarray}/> // Render your component here
      },
      {
        key: '2',
        label: `View file as JSON`,
        children:<ViewJSON jsonFile={jsonarray}/>, // Render your component here
      },
    ];

    return (
      <Tabs defaultActiveKey="1" items={items} />
  )};
  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            const { value } = e.target;
            setSearchText(value); // Update searchText as you type
            setSelectedKeys(value ? [value] : []);
          }}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            <CloseOutlined />
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]} // Pass searchText to searchWords prop
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: 'Cluster Id',
      dataIndex: 'clusterId',
      key: 'clusterId',
      width: '15%',
      ...getColumnSearchProps('clusterId'),
    },
    {
      title: 'Time Stamp',
      dataIndex: 'timeStamp',
      key: 'timeStamp',
      width: '15%',
      ...getColumnSearchProps('timeStamp'),
      sorter: (a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime(),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      width: '30%',
      ...getColumnSearchProps('path'),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ...getColumnSearchProps('message'),
    },
  ];

  return <Table columns={columns} expandable={{
    expandedRowRender,
    defaultExpandedRowKeys: ['0'],
  }}dataSource={filteredData} />;
};



export default MyTable;
