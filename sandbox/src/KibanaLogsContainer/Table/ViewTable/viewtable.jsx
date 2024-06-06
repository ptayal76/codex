import React from 'react';
import { Table } from 'antd';

const columns = [
  {
    title: 'Parameter',
    dataIndex: 'key',
    key: 'key',
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
  }
];

const ViewTable = ({ jsonFile }) => {
    const data = Object.entries(jsonFile._source).map(([key, value]) => ({
        key,
        value,
    }));
  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false} 
      bordered
    />
  );
};

export default ViewTable;
