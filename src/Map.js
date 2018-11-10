import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

class Map extends Component {
  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.node,
      style: "mapbox://styles/mapbox/streets-v9"
    });

    this.map.on("move", this.handleViewportChange);
    this.map.on("zoom", this.handleViewportChange);

    this.map.on("load", () => {
      this.map.addSource("users", {
        type: "geojson",
        data: this.props.users || {
          type: "FeatureCollection",
          features: [],
        }
      });

      this.map.addLayer({
        id: "users",
        source: "users",
        type: "circle",
        paint: {
          "circle-radius": 10,
          "circle-color": ['get', 'color'],
        }
      });
    });
  }

  componentDidUpdate() {
    if (this.map && this.map.getSource("users")) {
      this.map.getSource("users").setData(this.props.users);
    }
  }

  componentWillUnmount() {
    this.map.remove();
  }

  handleViewportChange = () => {
    this.props.onViewportChange(this.map.getCenter().toArray());
  };

  render() {
    return (
      <div
        style={{ width: "100vw", height: "100vh" }}
        ref={node => {
          this.node = node;
        }}
      />
    );
  }
}

export default Map;
