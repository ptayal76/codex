import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import NewTable from './newTable.jsx';
import { useState ,useEffect } from 'react';

const SubmitButton = ({ form, children, type }) => {
  const [submittable, setSubmittable] = React.useState(false);

  const values = Form.useWatch([], form);
  
  React.useEffect(() => {
    form
      .validateFields({
        validateOnly: true,
      })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);
  return (
    <Button type="primary" htmlType="submit" disabled={!submittable}>
      {children}
    </Button>
  );
};
const CheckConfigurations = () => {
const [form] = Form.useForm();
const [jsonFile, setJsonFile]= useState(null);
const handleSubmit = async (values) => {
    const formData = {
        cluster_url: values.cluster_url,
        domain: values.domain,
    };
    try {
        const response = await fetch('http://localhost:4000/check-csp-cors-validation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        } else {
            const res = await response.json();
            console.log("response--json: ", res);
            setJsonFile(res);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
  useEffect(() => {
        if (jsonFile) {
            console.log("res is taken by useEffect: ", jsonFile);
        }
    }, [jsonFile]);

  return (
  <div className='flex flex-col'>
      <Form
          form={form}
          name="validateOnly"
          layout="vertical"
          autoComplete="off"
          onFinish={handleSubmit}
          initialValues={{
              cluster_url: "https://172.32.46.211:8443",
              domain: "https://asda.csb.app",
          }}
      >
          <Form.Item
              name="cluster_url"
              label="Cluster Host URL"
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              name="domain"
              label="Embed Enviroment Domain"
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item>
              <Space>
                  <SubmitButton form={form} type={"csp"}>Validate CSP & CORS</SubmitButton>
                  <Button htmlType="reset">Reset</Button>
              </Space>
          </Form.Item>
      </Form>
      {console.log("showJson",jsonFile)}
    {jsonFile!==null?<NewTable myobject={jsonFile}/>:""}
  </div>
    
  );
};
export default CheckConfigurations;