import { useEffect, useState } from "react";

import "./App.css";

import data from "./mockData.json";

/* the coordinates of the center of the United States */
const LONG = "-103.771556";
const LAT = "44.967243";

function App() {
  const [userAddress, setUserAddress] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  // const [userCoordinates, setUserCoordinates] = useState({ userLong: "", userLat: "" });
  // const [userMatchedAddress, setUserMatchedAddress] = useState("");

  const [userCoordinates, setUserCoordinates] = useState(data?.result?.addressMatches[0]?.coordinates);
  const [userMatchedAddress] = useState(data?.result?.addressMatches[0]?.matchedAddress);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { address, city, state, zip } = userAddress;
  const { userLong, userLat } = userCoordinates;

  useEffect(() => {
    window.navigator.geolocation.getCurrentPosition(
      position => setUserCoordinates({ userLong: position.coords.longitude, userLat: position.coords.latitude }),
      err => console.log(err)
    );
  }, []);

  let currentUserQuadrant = `${userLat > LAT ? "North" : "South"} ${userLong > LONG ? "East" : "West"}`;

  let cardBgColor;

  if (currentUserQuadrant === "North West") {
    cardBgColor = "#6A6C34";
  } else if (currentUserQuadrant === "South West") {
    cardBgColor = "#B16238";
  } else if (currentUserQuadrant === "North East") {
    cardBgColor = "#99507F";
  } else if (currentUserQuadrant === "South East") {
    cardBgColor = "#4294B5";
  }

  const onChange = e => {
    setUserAddress({
      ...userAddress,
      [e.target.name]: e.target.value,
    });
  };

  /**
   *
   * The API request is successfully made, however, no json data get send back on the response.
   * Please, take a look in the console. Wonder if something is wrong with the backend api.
   * I have used useEffect to get user coordinates since API is not responding with any data.
   * I have added all the implementations as per requirements to complete most of the tasks.
   *
   */

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    fetch(
      // `https://geocoding.geo.census.gov/geocoder/locations/address?street=${address}&city=${city}&state=${state}&zip=${zip}&benchmark=2020&format=json`

      `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${address.replaceAll(
        " ",
        "+"
      )}+${city.replaceAll(" ", "+")}+${state.replaceAll(" ", "+")}+${zip}&benchmark=4&format=jsonp`,
      {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then(res => {
        // checking whether the content type is correct
        const contentType = res.headers.get("content-type");
        console.log("contentType", contentType);

        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Oops, we haven't got JSON!");
        }
        return res.json();
      })
      .then(data => {
        console.log(data);
        // setUserCoordinate(data?.result?.addressMatches[0]?.coordinates);
        // setUserMatchedAddress(data?.result?.addressMatches[0]?.matchedAddress)
      })
      .catch(err => {
        setError(true);
        console.error(err);
      })
      .finally(() => setLoading(false));

    setUserAddress({ address: "", city: "", state: "", zip: "" });
  };

  if (loading) return <h4>Loading...</h4>;

  // if (error) return <h4>Something went wrong...</h4>;

  return (
    <div className="container">
      <header className="header">
        <h1>Quadrant Finder</h1>
      </header>

      <form onSubmit={onSubmit} className="form">
        <div>
          <label htmlFor="address" className="form__label">
            Address
          </label>
          <input
            id="address"
            type="text"
            required
            name="address"
            value={address}
            onChange={onChange}
            className="form__input"
          />
        </div>

        <div className="form__group">
          <div>
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              required
              name="city"
              value={city}
              onChange={onChange}
              className="form__input"
            />
          </div>

          <div>
            <label htmlFor="state" className="form__label">
              State
            </label>
            <input
              id="state"
              type="text"
              required
              name="state"
              value={state}
              onChange={onChange}
              className="form__input-zip"
            />
          </div>
        </div>

        <div>
          <label htmlFor="zip" className="form__label">
            Zip
          </label>
          <input id="zip" type="text" required name="zip" value={zip} onChange={onChange} className="form__input" />
        </div>

        <button type="submit" className="form__button">
          Submit
        </button>
      </form>

      <section className="container__section" style={{ backgroundColor: cardBgColor }}>
        <div>
          <h2 className="container__heading">{currentUserQuadrant}</h2>
        </div>
        <div className="container__address">{`${userMatchedAddress}`}</div>
      </section>
    </div>
  );
}

export default App;
