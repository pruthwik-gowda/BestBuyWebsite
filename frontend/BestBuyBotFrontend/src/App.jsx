import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import backgroundImage from './assets/cool-background.png'
import loader from './assets/loader-transparent.svg'

const App = () => {
  const [productName, setProductName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => { // we used event to use preventDefault
    event.preventDefault();

    // In JavaScript, the preventDefault() method is used to stop the default action of an event from occurring. 
    // For example, in the context of an HTML form, the default behavior when a form is submitted is to reload the page.
    // In your handleSubmit function, event.preventDefault(); prevents the form submission from reloading the page,
    // allowing you to handle the form data asynchronously with your axios.post() request.
    // Without preventDefault(), the browser would reload, and you wouldn't be able to execute the asynchronous logic to send data to the server and display results dynamically.

    setLoading(true);
    setResults([]);
    try {
      const response = await axios.post('https://best-buy-website-backend.vercel.app/api/scrape', { productName });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="App">
      <h1></h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className='search-bar'
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Enter product name"
          required
        />
        <button type="submit" className='search-btn'>Search</button>
      </form>
      {loading ? 
      <img src={loader} alt="" />
      : ( results.length > 0 ?
        <table>
          <thead>
            <tr>
              <th className='website-name'>Website</th>
              <th className='title'>Title</th>
              <th className='price'>Price</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.website}</td>
                <td>{result.title}</td>
                <td>{result.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      : ( submitted == true ? <h2 className='error-message'>Couldn't find a match</h2> : <h2 className='error-message'>Enter the product name<br></br> you want to compare</h2>))}
    </div>
  );
};

export default App;
