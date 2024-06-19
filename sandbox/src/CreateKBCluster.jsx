import React, { useEffect, useState } from 'react';
import './CreateKBCluster.css'; // Import the CSS file
import {generateRandomString} from "./constants.jsx"
import { useGlobalState } from './GlobalState.jsx';
import PatchCommandTab from './patchCommandTab.jsx';
const bearerToken = 'eyJraWQiOiIweUZSWHY1d2lpelVCVTR4RVdkOW5ONnBuRFZKRGFrd195MFJhWlI4R29VIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHUxNGh6N2ZraXpZVUNmRTB4OCIsImVtYWlsIjoicGl5dXNoLnRheWFsQHRob3VnaHRzcG90LmNvbSIsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly90aG91Z2h0c3BvdC5va3RhLmNvbSIsImF1ZCI6IjBvYXIzZHFvODQ3WU1uWUxaMHg3IiwiaWF0IjoxNzE3NTc0NzkyLCJleHAiOjE3MTc1NzgzOTIsImp0aSI6IklELkhBaDVWWDFteUhrY2JBNkFQR05XVVRudVh4djMxRDNMS2RVTWphWDB0LW8iLCJhbXIiOlsicHdkIl0sImlkcCI6IjBvYWVjOWttYWI4TVVONU1mMHk2Iiwibm9uY2UiOiJyb1lnWVRHd0Nzbml6OWtidHJ4Y1FnZ1U4clpiVlBWb3hnVHZ0aUZXMnN0VnJkRXJCOVl3SUhOQXNBN0JuZXgwIiwiYXV0aF90aW1lIjoxNzE3NDA5ODU4LCJhdF9oYXNoIjoiQ3FxalR4SXNqR0FxT09ZNjZibGE2ZyJ9.WY9WFQEOIYz6j7xLwvRx27V40-uXXgQUplHvaVcc6MWgR3e9rB1Q4PtRlMr-yB7jwyZAduLTjfdFNRDiGC5tBOSSQiUPm-YogwwhFt4MMMqZHTqR5uQBI6PUSVN74ynzY3K1bee9AT9nN0UrvifGBloiWbHPv1WtXLvP6oN2RwlB_zpP-Bw_RwUA06U0LERZuEZ9zbeEB5lfgrwOs4KCb8VUtlSGcgtU0kD9qdq6FzrngynrtUSJDTVl9glFV99kGwQmheZZMxv9HmCwyPODZafNO0QGlIsNX9Odry8CLpdzF4CzxTlM9g6yx9qh-1wVNYzFr-EjndnbeBN8BA7j8A'
const nonce = 'roYgYTGwCsniz9kbtrxcQggU8rZbVPVoxgTvtiFW2stVrdErB9YwIHNAsA7Bnex0'
const owner_email = 'piyush.tayal@thoughtspot.com'
import { Collapse } from 'antd';
import { useCluster } from "./ClusterContext";

const CreateKBCluster = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { cname, setCname } = useGlobalState();
  const { cenv, setCenv } = useGlobalState();
  const [randomString] = useState(generateRandomString(5));
  const [awsInit,setAwsInit]= useState(false)
  const [gcpInit,setGcpInit]= useState(false)
  const [commands, setCommands] = useState([]);
  const [commandsSearchTerm, setCommandsSearchTerm] = useState('');
  const cluster_name = cname+ '-clone'
  const [image_tag,setImage_tag] = useState('')
  const {
    upgradeVersion
  } = useCluster();
  const {apiUrl} = useGlobalState();
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
  useEffect(() => {
    const fetchAndParseVersion = async () => {
      try {
        // const response = await fetch('./cluster_scripts/version.txt');
        // const text = await response.text();
        // console.log(text)
        // // Find the line containing 'Upgrade version'
        // const lines = text.split('\n');
        // const upgradeVersionLine = lines.find(line => line.startsWith('Upgrade version'));
        
        // if (upgradeVersionLine) {
        //   const upgradeVersion = upgradeVersionLine.split(' ')[2];
        //   console.log(upgradeVersion)
        //   setImage_tag(upgradeVersion)
        //   return;
        // }
        setImage_tag(upgradeVersion);
        return;
        
        throw new Error('Upgrade version not found in file');
      } catch (error) {
        console.error('Error fetching or parsing version file:', error);
        throw error;
      }
    };
    fetchAndParseVersion();
  }, [])
  const [awsData, setAwsData]= useState({
    cluster_name: cluster_name,
    owner_email: owner_email,
    image_tag : image_tag
  })

  const [gcpdata, setGcpData]= useState({
    cluster_name: cluster_name,
    owner_email: owner_email,
    image_tag : image_tag
  })
  // useEffect(() => {
  //   // const newClusterName = `${cname}-${randomString}`;
  //   setAwsData(prevData => ({ ...prevData, cluster_name: cluster_name }));
  //   setGcpData(prevData => ({ ...prevData, cluster_name: cluster_name }));
  // }, [cname]);

  useEffect(() => {
    setAwsData(prevData => ({ ...prevData, image_tag: image_tag }));
    setGcpData(prevData => ({ ...prevData, image_tag: image_tag }));
  }, [image_tag]);

  // fetchCommands();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setK8sData({
      ...k8sData,
      [name]: value
    });
  };
  const handleImageChange = (e) => {
    setImage_tag(e.target.value)
  }
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
    setAwsInit(false)
    e.preventDefault();
    setAwsData({
      ...awsData,
      image_tag: image_tag
    });
    console.log(awsData);
    const response = await fetch(`${apiUrl}/run-AWS-cluster`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(awsData),
    });

    if (response.ok) {
      const data = await response.json();
      setAwsInit(true)
    } else {
      console.log(response)
      console.error('Error running the script');
    }
  }

  const handleGCPCluster = async (e) => {
    setGcpInit(false);
    e.preventDefault();
    setGcpData({
      ...gcpdata,
      image_tag: image_tag
    });
    const response = await fetch(`${apiUrl}/run-GCP-cluster`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gcpdata),
    });

    if (response.ok) {
      const data = await response.json();
      setGcpInit(true)
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
    <div className='flex flex-col gap-16'>
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
          <div className="form-group">
            <label>Image TAG:</label>
            <input
              type="text"
              name="image_tag"
              value={image_tag}
              onChange={handleImageChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Create</button>
          {awsInit?
          <div>
          <p>Cluster Creation Initialized...</p>
          <button className="submit-btn">Apply Patch</button>
          <button className="submit-btn">Apply Flags</button>
          </div>
          :<p></p>}
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
          <div className="form-group">
            <label>Image TAG:</label>
            <input
              type="text"
              name="image_tag"
              value={image_tag}
              onChange={handleImageChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Create</button>
          {gcpInit?
          <div>
          <p>Cluster Creation Initialized...</p>
          <button className="submit-btn">Apply Patch</button>
          <button className="submit-btn">Apply Flags</button>
          </div>
          :<p></p>}
        </form>
      </div>
      {commands.length > 0 && (
          <div className="commands-table-container">
          <h3>Commands</h3>
          <table className="commands-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Command</th>
              </tr>
            </thead>
            <tbody>
              {commands.map((command, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      onChange={(e) => handleCheckboxChange(command, e.target.checked)}
                    />
                  </td>
                  <td>{command}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        )}
      </div>
      <div>
        <Collapse
          size="large"
          items={[
            {
              key: '1',
              label: <span style={{ fontWeight: 'bold'}}>Apply Patch and Commands</span>,
              children: <PatchCommandTab/>,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default CreateKBCluster;