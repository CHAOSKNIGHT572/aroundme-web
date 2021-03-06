
import React from 'react';
import { Tabs, Spin } from 'antd';
import {GEO_OPTIONS, AUTH_PREFIX, API_ROOT, TOKEN_KEY} from "../constants"
import $ from 'jquery';
import {Gallery} from "./Gallery";
import {CreatePostButton} from "./CreatePostButton";

const TabPane = Tabs.TabPane;

export class Home extends React.Component {



state = {
    loadingGeoLocation: false,
    loadingPosts: false,
    error: '',
    posts: [],
}

componentDidMount() {
    this.setState({ loadingGeoLocation: true, error: '' });
    this.getGeoLocation();
}

getGeoLocation = () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            this.onSuccessLoadGeoLocation,
            this.onFailedLoadGeolocation,
            GEO_OPTIONS,
        );
    } else {
        this.setState({ error: 'Your browser does not support geolocation!' });
    }
}

onSuccessLoadGeoLocation = (position) => {
    console.log(position);
    this.setState({ loadingGeoLocation: false, error: '' });
    const { latitude, longitude } = position.coords;
    localStorage.setItem('POS_KEY', JSON.stringify({lat: latitude, lon: longitude}));
    this.loadNearbyPosts();
}

onFailedLoadGeolocation = () => {
    this.setState({ loadingGeoLocation: false, error: 'Failed to load geo location!' });
}

getGalleryPanelContent = () => {
    if (this.state.error) {
        return <div>{this.state.error}</div>;
    } else if (this.state.loadingGeoLocation) {
        return <Spin tip="Loading geo location..."/>;
    } else if (this.state.loadingPosts) {
        return <Spin tip="Loading posts..."/>;
    } else if (this.state.posts && this.state.posts.length > 0) {
        const images = this.state.posts.map((post) => {
            return {
                user: post.user,
                src: post.url,
                thumbnail: post.url,
                thumbnailWidth: 400,
                thumbnailHeight: 300,
                caption: post.message,
            }
        });
        return <Gallery images={images}/>;
    }
    else {
        return null;
    }
}

loadNearbyPosts = () => {
    //const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));
    const lat = 37.535623;
    const lon = -122.26956;
    //const { latitude, longitude } = position.coords;
    this.setState({ loadingPosts: true, error: ''});
    $.ajax({
        url: `${API_ROOT}/search?lat=${lat}&lon=${lon}&range=20`,
        method: 'GET',
        headers: {
            Authorization: `${AUTH_PREFIX} ${localStorage.getItem(TOKEN_KEY)}`
        },
    }).then((response) => {
        this.setState({ posts: response, loadingPosts: false, error: '' });
        console.log(response);
    }, (error) => {
        this.setState({ loadingPosts: false, error: error.responseText });
        console.log(error);
    }).catch((error) => {
        console.log(error);
    });
}

    render() {
        const operations = <CreatePostButton type="primary">Create New Post</CreatePostButton>;
        return (
            <Tabs tabBarExtraContent={operations} className="main-tabs">
                <TabPane tab="Posts" key="1">
                    {this.getGalleryPanelContent()}
                </TabPane>
                <TabPane tab="Map" key="2">Content of tab 2</TabPane>
            </Tabs>
        );
    }

}