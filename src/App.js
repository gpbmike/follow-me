import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import React, { Component } from "react";
import Map from "./Map";

function hashCode(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToRGB(i) {
  var c = (i & 0x00ffffff).toString(16).toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
}

class App extends Component {
  state = {
    users: undefined,
    uid: undefined
  };

  componentDidMount() {
    var config = {
      apiKey: "AIzaSyCIvQz1UxN_6f-wPggmuT3zbKxABMyqj5I",
      authDomain: "follow-me-map.firebaseapp.com",
      databaseURL: "https://follow-me-map.firebaseio.com",
      projectId: "follow-me-map",
      storageBucket: "follow-me-map.appspot.com",
      messagingSenderId: "561126193715"
    };

    firebase.initializeApp(config);

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ uid: user.uid });

        this.ref = firebase.database().ref(`users/${user.uid}`);

        this.ref.onDisconnect().set(null);

        this.ref.set({
          longitude: 0,
          latitude: 0
        });
      }
    });

    firebase.auth().signInAnonymously();

    firebase
      .database()
      .ref("users")
      .on("value", snapshot => {
        const data = snapshot.val() || {};

        const users = {
          type: "FeatureCollection",
          features: Object.entries(data).map(
            ([key, { longitude, latitude }]) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [longitude, latitude]
              },
              properties: {
                uid: key,
                color: "#" + intToRGB(hashCode(key))
              }
            })
          )
        };

        this.setState({ users });
      });
  }

  handleViewportChange = ([longitude, latitude]) => {
    if (this.ref) {
      this.ref.set({ longitude, latitude });
    }
  };

  render() {
    return (
      <Map
        onViewportChange={this.handleViewportChange}
        uid={this.state.uid}
        users={this.state.users}
      />
    );
  }
}

export default App;
