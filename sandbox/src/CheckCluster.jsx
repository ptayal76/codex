import React, { useState } from 'react';

const CheckCluster = ()=> {
    const [formInputs, setFormInputs] = useState({
        cluster_name : 'champagne-master-aws',
        owner_email: 'piyush.tayal@thoughtspot.com',
        image_tag: '9.10.0.cl',
        feature: '',
        team: '',
        token: ''
      });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormInputs(prevState => ({ ...prevState, [name]: value }));
      };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const response = await fetch('http://localhost:4000/run-check-cluster-script', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formInputs),
        });
    
        if (response.ok) {
          const data = await response.json();
          parseCSV(data.csvContent);
        } else {
          console.log(response)
          console.error('Error running the script');
        }
      };
    return (
        <div className="container">
          <form onSubmit={handleSubmit} className="input-form">
            {Object.keys(formInputs).map((key) => (
              <div key={key} className="input-group">
                <label className="input-label">
                  {key}:
                  <input
                    type="text"
                    name={key}
                    value={formInputs[key]}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </label>
              </div>
            ))}
            <button type="submit" className="submit-button">Run Script</button>
          </form>
        </div>
    )
}

export default CheckCluster;