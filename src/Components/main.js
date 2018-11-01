import React, {Component, Fragment} from 'react'
import {Route} from 'react-router-dom'
import LoginPage from './LoginPage/LoginPage'
import User from './user/user'
import DriverWait from './driver/driverWait/driverWait'
import DriverRequested from './driver/driverRequested/driverRequested'
import DriverMap from './driver/driverMap/driverMap'

// Global vars
let tempDriverID = '5bd945e69dcd65623974ab09' // mock...This will come from google redirect
let socket

class Main extends Component {
  constructor (props) {
    super(props)
    this.state = {
      rideDetails: {},
      mapRenderData: {}
    }
  }
  componentWillMount () {
    socket = this.props.socket
  }
  setRideDetailsState (rideDetails, callback) {
    this.setState({
      rideDetails: rideDetails
    }, callback)
  }
  setMapState (obj, callback) {
    this.setState({
      mapRenderData: obj
    }, callback)
  }
  render () {
    return (
      <Fragment>
        <Route exact path='/' render={props => <LoginPage {...props} />} />
        <Route exact path='/user' render={(props) => <User {...props} socket={socket} onLogin={this.props.onCustomerLogin} />} />
        <Route exact path='/driver' render={(props) => <DriverWait {...props} socket={socket} driverID={tempDriverID} setRideDetailsState={this.setRideDetailsState.bind(this)} />} />
        <Route path='/driver/driverRequested' render={props => <DriverRequested {...props} socket={socket} rideDetails={this.state.rideDetails} setMapState={this.setMapState.bind(this)} />} />
        <Route path='/driver/map' render={props => <DriverMap {...props} mapRenderData={this.state.mapRenderData} />} />
      </Fragment>
    )
  }
}

export default Main
