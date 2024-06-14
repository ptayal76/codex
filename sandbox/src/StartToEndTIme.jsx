import React, { useState } from "react";
import { DatePicker, Space } from "antd";
import moment from "moment";

const { RangePicker } = DatePicker;

const StartToEndTime = () => {
  // Set default date values
  const defaultStart = moment('2024-05-01T00:00:00');
  const defaultEnd = moment('2024-05-30T23:59:59');

  const [dates, setDates] = useState([defaultStart, defaultEnd]);

  const handleOk = (values) => {
    const formattedValues = values.map(value => value.format('YYYY-MM-DDTHH:mm:ss'));
    console.log("Start Time:", formattedValues[0]);
    console.log("End Time:", formattedValues[1]);
  };
  const handleChange = (values) => {
    setDates(values);
  };

  return (
    <Space direction="vertical" size={100}>
      <RangePicker
        showTime
        // defaultValue={[defaultStart, defaultEnd]}
        onOk={handleOk}
        onChange={handleChange}
        defaultValue={dates}
        id={{
          start: 'startInput',
          end: 'endInput',
        }}
      />
    </Space>
  );
};

export default StartToEndTime;
