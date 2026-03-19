import React, { useState, useEffect } from 'react';

// 1. Our Component
function Test() {
  const [posts, setPosts] = useState([]);

  // Fetch initial data (GET)
  useEffect(() => {
    const getPosts = async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
      const data = await response.json();
      setPosts(data);
    };
    getPosts();
  }, []);

  // 2. The Delete Function (DELETE)
  const deletePost = async (id) => {
    try {
      // We tell the API which ID to delete
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // If the API says "OK", we remove it from our React state
        setPosts(posts.filter(post => post.id !== id));
        alert(`Post ${id} deleted successfully!`);
      }
    } catch (error) {
      console.error("Oops, something went wrong:", error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Posts</h2>
      <ul>
        {posts.map(post => (
          <li key={post.id} style={{ marginBottom: '10px' }}>
            {post.title} 
            <button 
              onClick={() => deletePost(post.id)} 
              style={{ marginLeft: '10px', color: 'red' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Test;




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