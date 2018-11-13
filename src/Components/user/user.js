import React, {Component, Fragment} from 'react'
import UserHome from './userHome/userHome'
import FindRide from './findRide/findRide'
import WaitingForDriver from './waitingForDriver/waitingForDriver'
import Map from '../map/map'
import FinishRide from './finishRide/finishRide'
import {findDistance} from '../../helperFunctions'

async function setStatusAsFindRide (origin, destination) {
  let distance = await findDistance(origin, destination)
  let price = calculatePrice(distance)
  this.setState({
    status: 'findRide',
    price
  })
}

function calculatePrice (distance) {
  return 40 + (distance > 4 ? (distance - 4) * 15 : 0)
}
class User extends Component {
  constructor (props) {
    super(props)
    this.state = {
      status: 'renderHome',
      user: {},
      price: 0
    }
    this.props.socket.on('driverLocation', payload => console.log('Driver pos recvd ', payload))
  }

  // ---- Lifecycle Hooks ----
  componentWillMount () {
    fetch('/api/user/userDetails')
      .then(res => {
        return res.json()
      })
      .then(user => {
        this.setState({user: user})
        this.props.socket.emit('userType', 'user', user._id)
        this.props.onLogin(user)
      })
      .catch(err => {
        console.log('ERROR ', err)
      })

    this.props.socket.on('driversNotAvailable', () => console.log('driversNotAvailable'))
  }

  render () {
    let component
    switch (this.state.status) {
      case 'renderHome':
        component = <UserHome
          socket={this.props.socket}
          setStatusAsFindRide={setStatusAsFindRide.bind(this)}
          user={this.state.user} />
        break
      case 'findRide':
        component = <FindRide />
        break
      case 'noDrivers':
        component = <Fragment>
          <div class='notification is-danger'>
            <button class='delete' onClick={() => this.setState({ status: 'renderHome' })} />
            No drivers found! Please try again!!
          </div>
          <UserHome
            socket={this.props.socket}
            setStatusAsFindRide={setStatusAsFindRide.bind(this)}
            user={this.state.user} />
        </Fragment>
        break
      case 'waitingForDriver':
        component = <WaitingForDriver
          origin={{lat: 12.9615, lng: 77.6442}}
          destination={{lat: 12.9793, lng: 77.6406}} />
        break
      case 'trackRide':
        component = <Map
          origin={{lat: 12.9615, lng: 77.6442}}
          destination={{lat: 12.9793, lng: 77.6406}}
          userPos={{lat: 12.9615, lng: 77.6442}} />
        break
      case 'finishRide':
        component = <FinishRide price={this.state.price} />
        break
    }
    return component
  }
}

export default User
