import React, {Component} from 'react'
import './driverWait.css'
import config from '../../../config'
let socket, driverID

function geodesicInMtrs (lat1, lon1, lat2, lon2) {
  var R = 6371000
  var dLat = deg2rad(lat2 - lat1)
  var dLon = deg2rad(lon2 - lon1)
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var d = R * c // Distance in m
  return d
}
function deg2rad (deg) {
  return deg * (Math.PI / 180)
}
function getCurrLocation () {
  const options = {
    enableHighAccuracy: true,
    timeout: config.driverGpsTimeout * 1000
  }
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}
function intervalFunction () {
  getCurrLocation()
    .then(pos => {
      let crd = pos.coords
      console.log('Driver lat, long, accuracy >>', crd.latitude, crd.longitude, crd.accuracy)
      if (crd.accuracy <= config.driverMinAccuracy) {
        if (this.prevLat && this.prevLng) { // ignores the 1st reading
          if (geodesicInMtrs(this.prevLat, this.prevLng, crd.latitude, crd.longitude) > config.driverMinDist) {
            console.log(`Driver moving.. transmitting location to server`)
            transmitDriverLocToServer(crd.latitude, crd.longitude)
          } else {
            console.log(`Driver hasn't moved more than ${config.driverMinDist} mtr... Did NOT transmit location to server`)
          }
        } else {
          console.log('Ignoring 1st reading...')
        }
        this.prevLat = crd.latitude
        this.prevLng = crd.longitude
      } else console.log(`Driver's location inaccurate... Accuracy = ${crd.accuracy}, threshold = ${config.driverMinAccuracy}`)
    })
    .catch(e => console.log('Error getting driver location ', e))
}
function transmitDriverLocToServer (lat, lng) {
  const payload = {
    id: driverID,
    position: [lat, lng]
  }
  socket.emit('driverPosition', JSON.stringify(payload))
}

class DriverWait extends Component {
  componentWillMount () {
    socket = this.props.socket
    driverID = this.props.driverID
    this.setId = setInterval(intervalFunction.bind(this), config.driverCoordBroadcastTimeout * 1000)
    this.prevLat = 0
    this.prevLng = 0
  }
  componentDidMount () {
    document.getElementById('EmitRideAssigned').addEventListener('click', // for testing purpose
      () => socket.emit('EmitRideAssigned')
    )
    socket.on('rideAssigned', rideDetails => { // sets state in main component and redirects once done
      this.props.setRideDetailsState(rideDetails, () => this.props.history.push('/driver/driverRequested'))
    })
  }
  componentWillUnmount () {
    clearInterval(this.setId)
  }
  render () {
    return (
      <div className='container' id='driverWait' >
        <div><button id='EmitRideAssigned'>Simulate ride assignment</button></div>
        <p className='is-size-3 has-text-centered has-text-light is-inline-block'>Waiting for ride</p>
        <div className='lds-ripple'>
          <div />
          <div />
        </div>
      </div>
    )
  }
}

export default DriverWait
