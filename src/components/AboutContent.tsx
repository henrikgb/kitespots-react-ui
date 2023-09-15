import React, {useEffect, useState} from "react";

export function AboutContent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setData(data.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);
  return (
    <div className={"container bg-amber-200"}>
      <h1 className={"font-bold"}>Om denne siden..</h1>
      {data ? (
        <div>
          <h1>Værdata fra Azure Blob Storage</h1>
          <p>{data}</p>
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  )
}