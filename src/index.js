import React from 'react';
import ReactDOM from 'react-dom';
import { Sidebar, Menu, Table, Breadcrumb, Button, Checkbox, Icon, Divider, Form, Radio, Container } from 'semantic-ui-react'; 
import { HashRouter, Switch, Route, Link } from 'react-router-dom';
import MapGL from 'react-map-gl';
import DeckGL, { PathLayer } from 'deck.gl';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import './index.css';
import './css/styles.css';
import Helper from './js/helper.js';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicHZ4eWllIiwiYSI6ImNqNDUwbndteTF1NWozMnJ1bjA2a2xrOWoifQ.Dkr7hVK4a9hpq6ReN66ZsA';

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      viewport: {
        width: 200,
        height: 200,
        longitude: -118.2634,
        latitude: 34.0463,
        zoom: 12
      },
      settings: {
        dragPan: true,
        dragRotate: true,
        scrollZoom: true,
        touchZoomRotate: true,
        doubleClickZoom: true,
        minZoom: 0,
        maxZoom: 20,
        minPitch: 0,
        maxPitch: 60
      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }
  
  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }
  
  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  render() {
    const { viewport, settings } = this.state

    var div = document.createElement("div");
    div.innerHTML = 'HIIIII';
    div.className = 'testlabel';

    var imgUrl;

    Helper.getImageUrlForDom(document.getElementById('test')).then((url) => imgUrl = url);

    console.log(imgUrl);

    return (
      <div className='home'>
        <Leftbar />
        <div className='body-wrapper'>
          <MapGL 
            {...viewport} 
            {...settings} 
            onViewportChange={this._onViewportChange.bind(this)}
            mapStyle="mapbox://styles/mapbox/light-v9" 
            mapboxApiAccessToken={ MAPBOX_ACCESS_TOKEN }
          >
          </MapGL>
        </div>
        <div className='testlabel'>
          <img src={imgUrl} />
        </div>
      </div>
    );
  }
}

class Login extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
      </div>
    )
  }
}

class Leftbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      filters: {
        twitter: true,
        yelp: false,
        facebook: false
      }
    }
  }

  toggle(item) {
    var filters = this.state.filters;
    filters[item] = !this.state.filters[item];
    this.setState({ filters: filters });
  }
  
  render() {
    const { state } = this.props

    return (
      <Sidebar as={Menu} className='leftbar' animation='overlay' visible={this.state.visible} icon='labeled' vertical inverted>
        <Menu.Item header className='bartitle'>
          <h3>pulseQuery</h3>
        </Menu.Item>
        <Menu.Item className='leftbarmenu'>
          <Menu.Item header className='sectiontitle'>
            <div className='baritem'>Filter Options</div>
          </Menu.Item>
          <Form className='sectioncontent'>
            <Form.Field className='baritem'>
              <Checkbox onChange={() => this.toggle('twitter')} checked={this.state.filters.twitter} label='Tweets' />
            </Form.Field>
            <Form.Field className='baritem'>
              <Checkbox onChange={() => this.toggle('yelp')} checked={this.state.filters.yelp} label='Yelp' />
            </Form.Field>
            <Form.Field className='baritem'>
              <Checkbox onChange={() => this.toggle('facebook')} checked={this.state.filters.facebook} label='FB Events' />
            </Form.Field>
          </Form>
        </Menu.Item>
      </Sidebar>
    );
  }
}

// ========================================

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route exact path='/' component={Home}/>
      <Route path='/login' component={Login}/>
    </Switch>
  </HashRouter>, 
  document.getElementById('root')
);

