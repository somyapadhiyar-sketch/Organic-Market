/*import { useState, useEffect } from "react";

function Test() {
  const [user, setUser] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users"
        );
        const jresponse = await response.json();
        console.log(jresponse);
        setUser(jresponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);  

  return (
    <div>
      <h2>API data Fetching using useEffect</h2>

      {user.map((user) => (
        <p key={user.id}>
          {user.email} : {user.name} : {user.phone}
        </p>
      ))}
    </div>
  );
}

export default Test;*/