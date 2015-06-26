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

                registerTask();
                setPictures();
            }));
        }
    };

    app.onready = function (args) {
        // check if is another url (loaded from a secondary tile)
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
        
        document.body.role = "application";
        document.body.style.overflowX = "auto";

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
    
    function registerTask()    {
        var taskRegistered = false;
        var exampleTaskName = "backgroundTask";

        var background = Windows.ApplicationModel.Background;
        var iter = background.BackgroundTaskRegistration.allTasks.first();

        while (iter.hasCurrent) {

            var task = iter.current.value;

            if (task.name === exampleTaskName) {

                taskRegistered = true;
                break;
            }

            iter.moveNext();
        }

        if (taskRegistered != true) {
            var builder = new Windows.ApplicationModel.Background.BackgroundTaskBuilder();
            var trigger = new Windows.ApplicationModel.Background.TimeTrigger(15, true);

            builder.name = exampleTaskName;
            builder.taskEntryPoint = "js\\backgroundTask.js";
            builder.setTrigger(trigger);

            builder.addCondition(new Windows.ApplicationModel.Background.SystemCondition(Windows.ApplicationModel.Background.SystemConditionType.internetAvailable));
            var task = builder.register();
            task.addEventListener("completed", backgroundTaskCompleted);
        }
    }

    function setTile() {

        var applicationData = Windows.Storage.ApplicationData.current;
        var localSettings = applicationData.localSettings;
        var currentPhoto = localSettings.values["currentPhoto"];
        var photoPath = localSettings.values["photo_" + currentPhoto];
            
        var lastPhotoChange = new Date(localSettings.values["lastPhotoChange"]);
        var currentDate = new Date();
        var nextPhotoChange = 15 - (currentDate.getUTCMinutes() - lastPhotoChange.getUTCMinutes());

        for (var i = 0; i < nextPhotoChange; i++) {
            updateTile(nextPhotoChange, i, photoPath);
        }
    }

    function updateTile(nextPhotoChange, iteration, photoPath) {
        var Notifications = Windows.UI.Notifications;
        var tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileSquarePeekImageAndText02);

        var tileTextAttributes = tileXml.getElementsByTagName("text");
        tileTextAttributes[0].appendChild(tileXml.createTextNode("Next BG in"));
        tileTextAttributes[1].appendChild(tileXml.createTextNode((nextPhotoChange - iteration) + " minutes"));

        var tileImageAttributes = tileXml.getElementsByTagName("image");
        tileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + photoPath);
        tileImageAttributes[0].setAttribute("alt", "current bg");

        if (iteration == 0) {
            var tileNotification = new Windows.UI.Notifications.TileNotification(tileXml);
            Notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
        }
        else {
            var dueDate = new Date();
            dueDate = new Date(dueDate.getTime() + iteration * 60000);

            var futureTile = new Notifications.ScheduledTileNotification(tileXml, dueDate);
            Notifications.TileUpdateManager.createTileUpdaterForApplication().addToSchedule(futureTile);
        }
    }


    function backgroundTaskCompleted(args) {
        try {
            var applicationData = Windows.Storage.ApplicationData.current;
            var localSettings = applicationData.localSettings;

            var currentPhoto = localSettings.values["currentPhoto"];
            var photoPath = localSettings.values["photo_" + currentPhoto];

            var pictures = $("#photos div");
            for (var i = 0; i < pictures.length; i++) {
                if (i == currentPhoto) {
                    pictures[i].style["border"] = "solid 5px blue";
                }
                else {
                    pictures[i].style["border"] = 0;
                }
            }

            // Todo fix update tile with image
            setTile();
        } catch (ex) {
            //WinJS.log && WinJS.log(ex, "sample", "status");
        }
    }

    function handleAction() {
        console.log("we're on windows 10");
        var picker = new Windows.Storage.Pickers.FileOpenPicker();
        picker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        picker.fileTypeFilter.replaceAll([".jpg", ".jpeg", ".png", ".bmp"]);

        picker.pickMultipleFilesAsync().done(function (files) {

            if (files.size > 0) {
                var file = files[0];

                // Application now has read/write access to the picked file, setting image to lockscreen.
                Windows.System.UserProfile.LockScreen.setImageFileAsync(file).done(function (imageSet) {
                    localSettings.values["lastPhotoChange"] = new Date();

                    console.log && console.log("File \"" + file.name + "\" set as lock screen image.", "sample", "status");

                    // Todo fix update tile with image
                    setTile();
                },
                function (imageSet) {
                    // Set Image promise failed.  Display failure message.
                    console.log && console.log("Setting the lock screen image failed.  Make sure your copy of Windows is activated.", "sample", "error");
                });

                var applicationData = Windows.Storage.ApplicationData.current;
                var localSettings = applicationData.localSettings;

                localSettings.values["numberOfPhotos"] = files.length;
                localSettings.values["currentPhoto"] = 0;

                var localFolder = applicationData.localFolder;

                for (var i = 0; i < files.size; i++) {
                    var photoIndex = "photo_" + i;
                    files[i].copyAsync(localFolder, files[i].name, Windows.Storage.NameCollisionOption.replaceExisting);
                    localSettings.values[photoIndex] = files[i].name;
                }

                console.log && console.log("Placing pictures on page", "sample", "status");
                // Todo wait copy of images to local folder before set pictures
                setPictures();

                console.log && console.log("The files has been set on settings.", "sample", "status");
            }
            else {
                console.log && console.log("No file was selected using the picker.", "sample", "error");
            }
        });
    }

    function setPictures() {
        var picturesDiv = document.getElementById("photos");
        while (picturesDiv.firstChild) {
            picturesDiv.removeChild(picturesDiv.firstChild);
        }

        var applicationData = Windows.Storage.ApplicationData.current;
        var localSettings = applicationData.localSettings;
        var localFolder = applicationData.localFolder;

        var numberOfPhotos = localSettings.values["numberOfPhotos"];

        for (var i = 0; i < numberOfPhotos; i++) {

            var photoPath = localSettings.values["photo_" + i];
            localFolder.getFileAsync(photoPath).done(function (file) {
                var pictureDiv = document.createElement("div");
                pictureDiv.style.height = "200px";
                pictureDiv.className = "col-md-4";
                pictureDiv.Id = file.name;

                var image = document.createElement("img");
                image.src = URL.createObjectURL(file, { oneTimeOnly: true });
                image.style.width = "100%";

                pictureDiv.appendChild(image);

                picturesDiv.appendChild(pictureDiv);

                var currentPhoto = localSettings.values["currentPhoto"];
                var photoId = localSettings.values["photo_" + currentPhoto];

                if (photoId == file.name) {
                    pictureDiv.style["border"] = "solid 5px blue";
                }
            });
        }
    }

    // exposes the private functions by using namespace
    WinJS.Namespace.define("HostedWebApp", {
        handleAction: handleAction
    });

})();

