import React, { useState } from 'react';
import './CreateKBCluster.css'; // Import the CSS file
import {CNAME,generateRandomString} from './constants'
const bearerToken = 'eyJraWQiOiIweUZSWHY1d2lpelVCVTR4RVdkOW5ONnBuRFZKRGFrd195MFJhWlI4R29VIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHUxNGh6N2ZraXpZVUNmRTB4OCIsImVtYWlsIjoicGl5dXNoLnRheWFsQHRob3VnaHRzcG90LmNvbSIsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly90aG91Z2h0c3BvdC5va3RhLmNvbSIsImF1ZCI6IjBvYXIzZHFvODQ3WU1uWUxaMHg3IiwiaWF0IjoxNzE3NTc0NzkyLCJleHAiOjE3MTc1NzgzOTIsImp0aSI6IklELkhBaDVWWDFteUhrY2JBNkFQR05XVVRudVh4djMxRDNMS2RVTWphWDB0LW8iLCJhbXIiOlsicHdkIl0sImlkcCI6IjBvYWVjOWttYWI4TVVONU1mMHk2Iiwibm9uY2UiOiJyb1lnWVRHd0Nzbml6OWtidHJ4Y1FnZ1U4clpiVlBWb3hnVHZ0aUZXMnN0VnJkRXJCOVl3SUhOQXNBN0JuZXgwIiwiYXV0aF90aW1lIjoxNzE3NDA5ODU4LCJhdF9oYXNoIjoiQ3FxalR4SXNqR0FxT09ZNjZibGE2ZyJ9.WY9WFQEOIYz6j7xLwvRx27V40-uXXgQUplHvaVcc6MWgR3e9rB1Q4PtRlMr-yB7jwyZAduLTjfdFNRDiGC5tBOSSQiUPm-YogwwhFt4MMMqZHTqR5uQBI6PUSVN74ynzY3K1bee9AT9nN0UrvifGBloiWbHPv1WtXLvP6oN2RwlB_zpP-Bw_RwUA06U0LERZuEZ9zbeEB5lfgrwOs4KCb8VUtlSGcgtU0kD9qdq6FzrngynrtUSJDTVl9glFV99kGwQmheZZMxv9HmCwyPODZafNO0QGlIsNX9Odry8CLpdzF4CzxTlM9g6yx9qh-1wVNYzFr-EjndnbeBN8BA7j8A'
const nonce = 'roYgYTGwCsniz9kbtrxcQggU8rZbVPVoxgTvtiFW2stVrdErB9YwIHNAsA7Bnex0'
const owner_email = 'piyush.tayal@thoughtspot.com'

const cluster_name = CNAME+'-'+ generateRandomString(5)
const CreateKBCluster = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [k8sData, setK8sData] = useState({
    owner: owner_email,
    resource_name :"nebula-tse-testing1",
    post_deploy_plugins :[],
    team: 'ts-everywhere',
    size: 1,
    lease: '1 hour',
    image_tag: 'latest',
    type:"tpch",
    backend:"ts-k8s-athena2"
  });
  const [awsData, setAwsData]= useState({
    cluster_name: cluster_name,
    owner_email: owner_email
  })

  const [gcpdata, setGcpData]= useState({
    cluster_name: cluster_name,
    owner_email: owner_email
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setK8sData({
      ...k8sData,
      [name]: value
    });
  };
  const handleAWSchange = (e) =>{
    const { name, value } = e.target;
    setAwsData({
      ...awsData,
      [name]: value
    });
  }
  const handleGCPchange = (e) =>{
    const { name, value } = e.target;
    setGcpData({
      ...gcpdata,
      [name]: value
    });
  }
  const handleAWSCluster = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:4000/run-AWS-cluster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(awsData),
    });

    if (response.ok) {
      const data = await response.json();
      parseCSV(data.csvContent);
    } else {
      console.log(response)
      console.error('Error running the script');
    }
  }

  const handleGCPCluster = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:4000/run-GCP-cluster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gcpdata),
    });

    if (response.ok) {
      const data = await response.json();
      parseCSV(data.csvContent);
    } else {
      console.log(response)
      console.error('Error running the script');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (k8sData.size > 4) {
      alert('Size must be a number up to 4');
      return;
    }
    setIsLoading(true); 
    try {
      const response = await fetch('https://nebula.corp.thoughtspot.com/api/v1/k8s', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept':'*/*',
          'accept-language':'en-GB,en-US;q=0.9,en;q=0.8',
          'authorization':`Bearer ${bearerToken}`,
          'nonce': nonce,
          'origin' : 'https://nebula.corp.thoughtspot.com',
          'priority': 'u=1, i',
          'referer' : 'https://nebula.corp.thoughtspot.com/kubernetes',
          'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        body: JSON.stringify(k8sData)
      });
      const data = await response.json();
      console.log(data);
      alert('Form submitted successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form');
    } finally {
        setIsLoading(false); // Reset loading state after receiving response
      }
  };

  return (
    <div className='forms'>
    <div className="form-container">
      <h2>Create K8s Cluster</h2>
      <form onSubmit={handleSubmit}>
      <div className="form-group">
          <label>name:</label>
          <input
            type="text"
            name="resource_name"
            value={k8sData.resource_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Team:</label>
          <input
            type="text"
            name="team"
            value={k8sData.team}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Size:</label>
          <input
            type="number"
            name="size"
            value={k8sData.size}
            onChange={handleChange}
            max="4"
            required
          />
        </div>
        <div className="form-group">
          <label>Lease:</label>
          <input
            type="text"
            name="lease"
            value={k8sData.lease}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Image TAG:</label>
          <input
            type="text"
            name="image"
            value={k8sData.image_tag}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
    <div className="form-container">
      <h2>Create AWS SaaS Cluster</h2>
      <form onSubmit={handleAWSCluster}>
       <div className="form-group">
          <label>Cluster Name:</label>
          <input
            type="text"
            name="cluster_name"
            value={awsData.cluster_name}
            onChange={handleAWSchange}
            required
          />
        </div>
      
        <div className="form-group">
          <label>Email:</label>
          <input
            type="text"
            name="owner_email"
            value={awsData.owner_email}
            onChange={handleAWSchange}
            required
          />
        </div>
      {/*
        <div className="form-group">
          <label>Size:</label>
          <input
            type="number"
            name="size"
            value={formData.size}
            onChange={handleChange}
            max="4"
            required
          />
        </div>
        <div className="form-group">
          <label>Lease:</label>
          <input
            type="text"
            name="lease"
            value={formData.lease}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Image TAG:</label>
          <input
            type="text"
            name="image"
            value={formData.image_tag}
            onChange={handleChange}
            required
          />
        </div> */}
        <button type="submit" className="submit-btn">Create</button>
      </form>
    </div>
    <div className="form-container">
      <h2>Create GCP SaaSCluster</h2>
      <form onSubmit={handleGCPCluster}>
      <div className="form-group">
          <label>Cluster Name:</label>
          <input
            type="text"
            name="cluster_name"
            value={gcpdata.cluster_name}
            onChange={handleGCPchange}
            required
          />
        </div>
      
        <div className="form-group">
          <label>Email:</label>
          <input
            type="text"
            name="owner_email"
            value={gcpdata.owner_email}
            onChange={handleGCPchange}
            required
          />
        </div>
      {/* <div className="form-group">
          <label>name:</label>
          <input
            type="text"
            name="resource_name"
            value={formData.resource_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Team:</label>
          <input
            type="text"
            name="team"
            value={formData.team}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Size:</label>
          <input
            type="number"
            name="size"
            value={formData.size}
            onChange={handleChange}
            max="4"
            required
          />
        </div>
        <div className="form-group">
          <label>Lease:</label>
          <input
            type="text"
            name="lease"
            value={formData.lease}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Image TAG:</label>
          <input
            type="text"
            name="image"
            value={formData.image_tag}
            onChange={handleChange}
            required
          />
        </div> */}
        <button type="submit" className="submit-btn">Create</button>
      </form>
    </div>
    </div>
  );
};

export default CreateKBCluster;
