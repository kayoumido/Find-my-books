app.onPageInit('add', function(page) {
    hasInternet();

    $$('input.search').on('input', function() {
        if ($$('input.search').val()) {
            $$('.search.button').removeAttr('disabled');
            $$('.search.button').addClass('active');
        }
        else {
            $$('.search.button').attr("disabled", true);
            $$('.search.button').removeClass('active');
        }
    });

    $$('.search.button').click(function() {

        // check if a search value was given
        if (!$$('input.search').val())
            return;

        let isbn = $$('input.search').val();

        // api request example https://www.googleapis.com/books/v1/volumes?q=isbn:9782253031338
        $$.ajax({
            url         : window.localStorage.getItem('api'),
            method      : 'GET',
            dataType    : 'json',
            cache       : false,
            data        : {
                q : `isbn:${isbn}`
            },
            success     : function(data) {
                resultPopup(data.items[0].volumeInfo, isbn);
            },
            error  : function(xhr) {
                app.modal({
                    title : "No books were found",
                    text  : "Check if the ISBN code is valid or that you have an internet connection",
                    buttons: [
                        {
                            text: "Ok"
                        }
                    ]
                });
                console.error(`readyState:            ${xhr.readyState}`);
                console.error(`status:                    ${xhr.status}`);
                console.error(`responseText:        ${xhr.responseText}`);
            }
        });
    });

    $$('.scan').click(function() {
        cordova.plugins.barcodeScanner.scan(
            // Success
            function (result) {
                // Get the result and put it on the input value
                if(!result.cancelled) {
                    $$('.search').val(result.text);
                    $$('.button.search').removeAttr('disabled');
                    $$('.button.search').addClass('active');
                    $$('.item-inner').addClass('focus-state');
                    $$('.item-input').addClass('focus-state');
                    $$('.search').addClass('focus-state');
                }
            },
            // Error
            function (error) {
                alert("Invalid barcode");
            },
            // Settings
            {
                preferFrontCamera       : false, // iOS and Android
                showFlipCameraButton    : false, // iOS and Android
                showTorchButton         : false, // iOS and Android
                torchOn                 : false, // Android, launch with the torch switched on (if available)
                prompt                  : "", // Android
                resultDisplayDuration   : 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats                 : "EAN_8,EAN_13,CODE_128,CODE_39", // default: all but PDF_417 and RSS_EXPANDED
                orientation             : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations       : true, // iOS
                disableSuccessBeep      : false // iOS
            }
        );
    });
});

function resultPopup(book, isbn) {
    // try and get cover and author, if they dont exist, use default one
    let cover  = book.imageLinks == null ? "img/nocover.jpg" : book.imageLinks.thumbnail;
    let author = book.authors == null ? "Unknown" : book.authors[0];

    app.modal({
        title: `${book.title}`,
        text: `
        <div class="row book no-shadow">
            <div class="col-35 book-cover">
                <img src="${cover}" alt="">
            </div>
            <div class="col-65 book-info">
                <div class="book-author">${author}</div>
            </div>
        </div>`,
        buttons: [
            {
                text: 'Cancel',
                onClick: function() {}
            },
            {
                text: 'Import',
                onClick: function() {
                    importBook(isbn, book.title, cover, author);
                    mainView.router.loadPage('index.html');
                }
            }
        ]
    });
}

function importBook(isbn, title, cover, author) {
        var db = new DBHandler();
        var dbh = db.getDBH();

        // insert book
        dbh.transaction(function(tx) {
            tx.executeSql('INSERT INTO books VALUES (?,?,?,?,?,?,?,?,?)',[
                null,
                title,
                author,
                cover,
                0,
                0,
                0,
                isbn,
                ''
            ]);
        }, function(error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function() {

        });
}
