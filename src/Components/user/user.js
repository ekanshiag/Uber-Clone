import React, {Component, Fragment} from 'react'
import InputBoxes from '../inputBoxes'
import Map from '../map/map'

let watchId
let socket, userID
let options = {
  enableHighAccuracy: true
}
let geoError = () => {
  console.log('No position available')
}

class User extends Component {
  constructor (props) {
    super(props)
    this.state = {
      origin: {
        lat: undefined,
        lng: undefined,
        address: ''
      },
      destination: {
        lat: undefined,
        lng: undefined,
        address: ''
      },
      userPos: {lat: 12.9716, lng: 77.5946},
      // userPos: {lat: undefined, lng: undefined},
      drivers: []
    }
    socket = this.props.socket
    userID = this.props.userID
    socket.emit('userType', 'user', userID)
  }
  // ---- Functions ----
  geoSuccess (position) {
    this.setState({userPos: {lat: position.coords.latitude, lng: position.coords.longitude}})
  }
  updateOriginDestination (obj) {
    console.log('UPDATE origin destination ran', obj)
    this.setState({
      origin: obj.origin,
      destination: obj.destination
    }, () => { console.log('Updated State >>', this.state) })
  }

  // ---- Lifecycle Hooks ----
  componentWillMount () {
    // watchId = navigator.geolocation.watchPosition(this.geoSuccess.bind(this), geoError, options)
    watchId = navigator.geolocation.getCurrentPosition(this.geoSuccess.bind(this), geoError, options)
  }
  componentWillUnmount () {
    navigator.geolocation.clearWatch(watchId)
  }
  componentDidMount () {
    let data = {
      'userLoc': [this.state.userPos.lng, this.state.userPos.lat]
    }
    let myInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    fetch('/api/driver/find', myInit)
      .then(result => {
        return result.json()
      })
      .then(drivers => {
        this.setState({drivers: drivers})
      })
      .catch(err => {
        console.log(err.json())
      })
  }

  findRide () {
    if (this.state.drivers.length && this.state.userPos.lat && this.state.userPos.lng && this.state.drivers && this.state.destination) {
      const payload = {
        drivers: this.state.drivers,
        origin: this.state.origin,
        destination: this.state.destination,
        userPosition: this.state.userPos
      }
      socket.emit('findRide', payload)
    } else {
      console.log(`Can't find ride rite now`)
    }

    // let data = {
    //   origin: this.state.origin.address,
    //   destination: this.state.destination.address,
    //   user: userID
    // }
    // let myInit = {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(data)
    // }
    // fetch('/api/ride', myInit)
    //   .then(result => {
    //     console.log(result)
    //   })
    //   .catch(err => {
    //     console.log(err)
    //   })
  }

  render () {
    return (
      <Fragment>
        <InputBoxes
          updateOriginDestination={this.updateOriginDestination.bind(this)}
        />
        <button onClick={this.findRide.bind(this)}>Find Ride</button>
        <a href='/api/user/logout'>Logout</a>
        <Map
          origin={this.state.origin}
          destination={this.state.destination}
          userPos={this.state.userPos}
          drivers={this.state.drivers} />
      </Fragment>
    )
  }
}

export default User
