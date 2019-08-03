import React, { Component } from "react";
import Animate from "react-smooth";
import axios from 'axios';
import { Link } from 'react-router-dom';
import HeaderNav from './Navbar';

class Trending extends Component{
    constructor(props){
        super(props);
        this.showCaseMovies = 5;
        this.timeOutTime = 5000;
        this.mounted = false;
        this.state = {
            movies: [],
            userList: [],
            i: 0,
            user: {}
        }
    }
    componentDidMount(){
        this.mounted = true;
        fetch('https://api.themoviedb.org/3/movie/popular?api_key=17117ab9c18276d48d8634390c025df4&language=en-US&page=1')
            .then(res => res.json())
            .then(data => {
                if(this.mounted){
                    this.getUserMovielist()
                    this.setState({
                        movies: data.results,
                        user: this.props.user
                    })
                    // this.checkinList(this.state.movies)
                }
            })
            .catch(err => console.log(err))
            this.startTimeOut();
        // console.log(this.props.user)
    }

    startTimeOut(){
        this.timeOut = setTimeout(() => {
            if(this.state.i  < this.showCaseMovies){
                this.setState({
                    i: this.state.i  + 1
                })
            } else {
                this.setState({
                    i: 0
                })
            }
            this.startTimeOut();
        } , this.timeOutTime)
    }

    componentWillUnmount(){
        this.mounted = false;
        clearTimeout(this.timeOut)
    }
    getUserMovielist(){
        console.log("this.props.user " + this.props.user.id)
        fetch(`http://localhost:3000/api/movies/getUsersMovieList/${this.props.user.id}`)
            .then(r => r.json())
            .then((data) => {
                this.setState({
                    userList: data
                })
                // console.log(data)
                this.checkinList(this.state.movies, this.state.userList)
                return data
            })
            .catch(err => console.log(err))
        // console.log(this.state)
    }
    // check Trending movie in list
    checkinList(movies, userList){
        for(var i=0; i<userList.length; i++){
            for(var j=i;j<movies.length; j++){
                if(userList[i].id === movies[j].id){
                    movies[j].added = "true";
                }   
            }
        }
        this.setState({
            movies: movies
        })
    }
    addMovietoList(movie, user){
        axios.put(`http://localhost:3000/api/movies/addToUserList/${user.id}`, {movie})
            .then((result) => {
                if(result.data){
                    var joined = this.state.userList.concat(result.data)
                    this.setState({
                        userList: joined
                    })
                    console.log("Updated")
                }
            })
            .catch((error) => {
                console.log("An error occured")
            })
    }
    render(){
        const { movies, i, user, userList } = this.state;
        console.log(movies);
        const {
            value,
            searchMovies, 
            showResponse,
            handleChange
        } = this.props;
       
        const divs = movies.length
            ? movies.map((movies, index) => {
                if(index <= this.showCaseMovies){
                    return(
                        <div 
                            key={index}
                            className={i === index ? "active" : null}
                            onClick={() => 
                                this.setState({i: index}, () => {
                                    clearTimeout(this.timeOut);
                                    this.startTimeOut();
                                })
                            }
                        />
                    );
                } else return null;
            }) 
        : null;
        const movieList = movies.length
            ? ( 
                <div key={movies[i].id} >
                    <Animate to="1" from="0.2" attributeName="opacity" >
                        <div style={{
                            backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 60%), url("https://image.tmdb.org/t/p/original/${
                                movies[i].backdrop_path
                            }")`
                        }}
                        className="bgImage" 
                        >
                            <div className="popularInfo" >
                                <h1>{movies[i].title}</h1>
                                <p className="rating">
                                    <em>Rating: {movies[i].vote_average}</em>
                                </p>
                                <p className="release-date" >
                                    Release Date : {new Date(movies[i].release_date).toDateString() }
                                </p>
                                <p className="header-overview" >{movies[i].overview}</p>
                                {/* <Link to={"/"}> */}
                                    <button onClick={() => this.addMovietoList(movies[i], this.props.user)} > {(movies[i].added === "true") ? "Added to My list" : "Add to My List" } </button>
                                {/* </Link> */}
                            </div>
                            <div className="switchImage" >{divs}</div>
                        </div>
                    </Animate>
                </div>
            ) : (
                <h4>Loading ...</h4>
            )
        return(
            <header>
                <HeaderNav 
                    value={value}
                    user={this.props.user}
                    searchMovies={searchMovies}
                    showResponse={showResponse}
                    handleChange={handleChange}
                />
                <div className="trending" >{movieList}</div>
            </header>
        )
    }
}


export default Trending;