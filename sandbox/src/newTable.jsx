import React from 'react';
import { Table } from 'antd';

const columns = [
  {
    title: 'Parameter',
    dataIndex: 'parameter',
    key: 'parameter',
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
  }
];

const NewTable = ({ myobject }) => {
  const newJSonFile= JSON.parse(myobject);
  const data = Object.keys(newJSonFile).map((key, index) => ({
    key: index, // unique key for each row
    parameter: key,
    value: newJSonFile[key]
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

export default NewTable;
