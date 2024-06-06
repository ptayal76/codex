import React from 'react';
const ViewJSON= ({jsonFile})=>{
    const jsonData = jsonFile;
    const jsonString = JSON.stringify(jsonData, null, 2); // The second parameter (null) is for the replacer function, and the third parameter (2) is for the number of spaces to use for indentation.
    return (
        <div>
            <pre>{jsonString}</pre>
        </div>
    );
}
export default ViewJSON;