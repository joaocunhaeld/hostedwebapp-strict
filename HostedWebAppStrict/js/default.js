// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var appbarTileUri = window.location.href;
    var url;

    setCSS();
    setLoading();
    addAppBar();

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            // Based on: https://code.msdn.microsoft.com/windowsapps/Secondary-Tiles-Sample-edf2a178
            // Use setPromise to indicate to the system that the splash screen must not be torn down
            // until after processAll and navigate complete asynchronously.
            args.setPromise(WinJS.UI.processAll().then(function () {               
                
                if (args.detail.arguments !== " " && args.detail.arguments !== "") {
                    url = args.detail.arguments;
                    document.body.style.opacity = 0;
                }
                else {
                    url = window.location.href;
                }           
            }));
        }
    };

    app.onready = function (args) {
        if (url !== window.location.href) {
            document.location.href = url;
        }
    }

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
        // You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
        // If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
    };
    
    app.start();
    
    function setCSS() {
        var cssFile = document.createElement("link");
        cssFile.rel = "stylesheet";
        cssFile.type = "text/css";
        cssFile.href = "ms-appx-web:///WinJS/css/ui-light.css";
        cssFile.media = "all";
        document.head.appendChild(cssFile);

        document.body.role = "application";
        document.body.style.overflowX = "auto"; 
    }

    function setLoading() {
        var loadingContent = document.createElement("div");
        loadingContent.className = "loadingContent";
        loadingContent.style.position = "absolute";
        loadingContent.style.left = 0;
        loadingContent.style.top = 0;
        loadingContent.style.zIndex = 2;
        loadingContent.style.width = "100%";
        loadingContent.style.height = "100%";
        loadingContent.style.textAlign = "center";
        loadingContent.style.verticalAlign = "middle";
        loadingContent.style.backgroundColor = "#3377FF";
        loadingContent.style.opacity = 0.3;

        var progress = document.createElement("progress");
        progress.classList.add("win-ring");
        progress.classList.add("win-large");
        progress.style.position = "absolute";
        progress.style.margin = "auto";
        progress.style.overflow = "auto";
        progress.style.left = 0;
        progress.style.top = 0;
        progress.style.right = 0;
        progress.style.bottom = 0;

        loadingContent.appendChild(progress);
        document.body.appendChild(loadingContent);

        WinJS.UI.Animation.fadeOut(WinJS.Utilities.query(".loadingContent").get(0)).then(function (args) {
            WinJS.Utilities.query(".loadingContent").get(0).style.zIndex = -1;
        });

        window.onloadstart = (function (args) {
            WinJS.UI.Animation.fadeIn(WinJS.Utilities.query(".loadingContent").get(0)).then(function (args) {
                WinJS.Utilities.query(".loadingContent").get(0).style.zIndex = 999;
            });
        });

        window.onload = (function (args) {
            WinJS.UI.Animation.fadeOut(WinJS.Utilities.query(".loadingContent").get(0)).then(function (args) {
                WinJS.Utilities.query(".loadingContent").get(0).style.zIndex = -1;
            });
        });

        window.onerror = (function (args) {
            WinJS.UI.Animation.fadeOut(WinJS.Utilities.query(".loadingContent").get(0)).then(function (args) {
                WinJS.Utilities.query(".loadingContent").get(0).style.zIndex = -1;
            });
        });                
    }

    function addAppBar() {
        var pinDiv = document.createElement("div");
        pinDiv.id = "pinUnpinFromAppbar";

        var pinButton = document.createElement("button");

        pinDiv.appendChild(pinButton);
        document.body.appendChild(pinDiv);

        var appBarCommandPin = new WinJS.UI.AppBarCommand(pinButton);
        appBarCommandPin.id = "commandButton";
        appBarCommandPin.section = "global";
        appBarCommandPin.icon = "pin";

        var appBar = new WinJS.UI.AppBar(pinDiv);

        setAppbarButton();

        appBar.disabled = false;
        document.getElementById("commandButton").addEventListener("click", appbarButtonClicked, false);

        WinJS.UI.processAll();
    }

    function setAppbarButton() {
        var appBar = document.getElementById("pinUnpinFromAppbar");
        var commandButton = document.getElementById("commandButton").winControl;

        if (Windows.UI.StartScreen.SecondaryTile.exists(getAppbarTileId())) {
            commandButton.label = "Unpin from start";
            commandButton.icon = "unpin";
        }
        else {
            commandButton.label = "Pin to start";
            commandButton.icon = "pin";
        }

        appBar.winControl.sticky = false;
    }

    function appbarButtonClicked() {
        var appBar = document.getElementById("pinUnpinFromAppbar");
        appBar.winControl.sticky = true;

        var commandButton = document.getElementById("commandButton");

        if (WinJS.UI.AppBarIcon.unpin == commandButton.winControl.icon) {
            unpinByElementAsync(commandButton, getAppbarTileId()).done(function (isDeleted) {
                if (isDeleted) {
                    WinJS.log && WinJS.log("Secondary tile was successfully unpinned.", "sample", "status");
                }
                else {
                    WinJS.log && WinJS.log("Secondary tile was not unpinned.", "sample", "error");
                }

                setAppbarButton();
            });
        }
        else {
            pinByElementAsync(commandButton, getAppbarTileId(), appbarTileUri).done(function (isCreated) {
                if (isCreated) {
                    WinJS.log && WinJS.log("Secondary tile was successfully pinned.", "sample", "status");
                }
                else {
                    WinJS.log && WinJS.log("Secondary tile was not pinned.", "sample", "error");
                }

                setAppbarButton();
            });
        }
    }

    function pinByElementAsync(element, newTileId, newTileDisplayName) {
        var square150X150Logo = new Windows.Foundation.Uri("ms-appx:///images/logo.scale-100.png");
        var square30x30Logo = new Windows.Foundation.Uri("ms-appx:///images/smalllogo.scale-100.png");

        var currentTime = new Date();
        var newTileDesiredSize = Windows.UI.StartScreen.TileSize.square150x150;

        var tile = new Windows.UI.StartScreen.SecondaryTile(getAppbarTileId(), newTileDisplayName, appbarTileUri, square150X150Logo, newTileDesiredSize);

        tile.visualElements.showNameOnSquare150x150Logo = true;
        tile.visualElements.foregroundText = Windows.UI.StartScreen.ForegroundText.light;
        tile.visualElements.square30x30Logo = square30x30Logo;

        var selectionRect = element.getBoundingClientRect();
        var buttonCoordinates = { x: selectionRect.left, y: selectionRect.top, width: selectionRect.width, height: selectionRect.height };
        var placement = Windows.UI.Popups.Placement.above;

        return new WinJS.Promise(function (complete, error, progress) {
            tile.requestCreateForSelectionAsync(buttonCoordinates, placement).done(function (isCreated) {
                if (isCreated) {
                    complete(true);
                }
                else {
                    complete(false);
                }
            });
        });
    }

    function unpinByElementAsync(element, unwantedTileID) {
        var selectionRect = element.getBoundingClientRect();
        var buttonCoordinates = { x: selectionRect.left, y: selectionRect.top, width: selectionRect.width, height: selectionRect.height };
        var placement = Windows.UI.Popups.Placement.above;

        var tileToDelete = new Windows.UI.StartScreen.SecondaryTile(unwantedTileID);

        return new WinJS.Promise(function (complete, error, progress) {
            tileToDelete.requestDeleteForSelectionAsync(buttonCoordinates, placement).done(function (isDeleted) {
                if (isDeleted) {
                    complete(true);
                }
                else {
                    complete(false);
                }
            });
        });
    }

    function getAppbarTileId() {
        var appbarTileId = appbarTileUri;
        var uriLength = appbarTileUri.length;
        if (uriLength > 64) {
            appbarTileId = appbarTileId.substr(uriLength - 64, 64);
        }

        return appbarTileId.replace(new RegExp(/[\|\\"\/<>\?\;\:\!']/g), "-");
    }
})();