// Initialize app
var app = new Framework7({
    material: true
});

var config = {
    devmode       : false,
    internet      : true,
    default_cover : "img/nocover.jpg",
    api           : "https://www.googleapis.com/books/v1/volumes"
};

Template7.global = {
    internet      : config.internet,
    default_cover : config.default_cover
};

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = app.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {

    // check if the api address is already set in localStorage
    if (!window.localStorage.getItem('api')) window.localStorage.setItem('api', config.api);

    // check if we have an internet connection
    hasInternet();

    var dbh = new DBHandler();
    dbh.init();

    if (config.devmode)
        dbh.populate();

    mainView.router.loadPage('index.html');
});
