import React, { useState } from 'react';
import './CreateKBCluster.css'; // Import the CSS file
const bearerToken = 'eyJraWQiOiIweUZSWHY1d2lpelVCVTR4RVdkOW5ONnBuRFZKRGFrd195MFJhWlI4R29VIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHUxNGh6N2ZraXpZVUNmRTB4OCIsImVtYWlsIjoicGl5dXNoLnRheWFsQHRob3VnaHRzcG90LmNvbSIsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly90aG91Z2h0c3BvdC5va3RhLmNvbSIsImF1ZCI6IjBvYXIzZHFvODQ3WU1uWUxaMHg3IiwiaWF0IjoxNzE3NTc0NzkyLCJleHAiOjE3MTc1NzgzOTIsImp0aSI6IklELkhBaDVWWDFteUhrY2JBNkFQR05XVVRudVh4djMxRDNMS2RVTWphWDB0LW8iLCJhbXIiOlsicHdkIl0sImlkcCI6IjBvYWVjOWttYWI4TVVONU1mMHk2Iiwibm9uY2UiOiJyb1lnWVRHd0Nzbml6OWtidHJ4Y1FnZ1U4clpiVlBWb3hnVHZ0aUZXMnN0VnJkRXJCOVl3SUhOQXNBN0JuZXgwIiwiYXV0aF90aW1lIjoxNzE3NDA5ODU4LCJhdF9oYXNoIjoiQ3FxalR4SXNqR0FxT09ZNjZibGE2ZyJ9.WY9WFQEOIYz6j7xLwvRx27V40-uXXgQUplHvaVcc6MWgR3e9rB1Q4PtRlMr-yB7jwyZAduLTjfdFNRDiGC5tBOSSQiUPm-YogwwhFt4MMMqZHTqR5uQBI6PUSVN74ynzY3K1bee9AT9nN0UrvifGBloiWbHPv1WtXLvP6oN2RwlB_zpP-Bw_RwUA06U0LERZuEZ9zbeEB5lfgrwOs4KCb8VUtlSGcgtU0kD9qdq6FzrngynrtUSJDTVl9glFV99kGwQmheZZMxv9HmCwyPODZafNO0QGlIsNX9Odry8CLpdzF4CzxTlM9g6yx9qh-1wVNYzFr-EjndnbeBN8BA7j8A'
const nonce = 'roYgYTGwCsniz9kbtrxcQggU8rZbVPVoxgTvtiFW2stVrdErB9YwIHNAsA7Bnex0'
const ownerEmail = 'piyush.tayal@thoughtspot.com'
const CreateKBCluster = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    owner: ownerEmail,
    resource_name :"nebula-tse-testing1",
    post_deploy_plugins :[],
    team: 'ts-everywhere',
    size: 1,
    lease: '1 hour',
    image_tag: 'latest',
    type:"tpch",
    backend:"ts-k8s-athena2"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.size > 4) {
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
        body: JSON.stringify(formData)
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
    <div className="form-container">
      <h2>Create Cluster</h2>
      <form onSubmit={handleSubmit}>
      <div className="form-group">
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
        </div>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default CreateKBCluster;
