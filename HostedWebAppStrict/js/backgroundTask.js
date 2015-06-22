//
// A JavaScript background task is specified in a .js file. The name of the file is used to
// launch the background task.
//
(function () {
    "use strict";

    //
    // This var is used to get information about the current instance of the background task.
    //
    var backgroundTaskInstance = Windows.UI.WebUI.WebUIBackgroundTaskInstance.current;


    //
    // This function will do the work of your background task.
    //
    function doWork() {
        var key = null,
            settings = Windows.Storage.ApplicationData.current.localSettings;
        
        // Write JavaScript code here to do work in the background.


        //
        // Record information in LocalSettings to communicate with the app.
        //
        key = backgroundTaskInstance.task.taskId.toString();
        settings.values[key] = "Succeeded";

        var currentPhoto = settings.values["currentPhoto"];
        var newPhoto = currentPhoto + 1;
        var numberOfPhotos = settings.values["numberOfPhotos"];

        if (newPhoto >= numberOfPhotos) {
            newPhoto = 0;            
        }

        settings.values["currentPhoto"] = newPhoto;
        
        var photoPath = settings.values["photo_" + newPhoto];

        var applicationData = Windows.Storage.ApplicationData.current;
        var localFolder = applicationData.localFolder;
        localFolder.getFileAsync(photoPath).then(function (file) {
            console.log && console.log("File loaded.", "background", " status");

            Windows.System.UserProfile.LockScreen.setImageFileAsync(file).done(function (imageSet) {
                var msg = "File \"" + photoPath + "\" set as lock screen image.";
                console.log && console.log(msg, "background", " status");

                showToast(msg);
                close();
            },
            function (imageSet) {
                var msg = "Setting the lock screen image failed.";
                console.log && console.log(msg, "background", " status");

                close();
            });
        });
    }

    doWork();

    function showToast(toastText) {
        var notifications = Windows.UI.Notifications;
        var template = notifications.ToastTemplateType.toastText01;
        var toastXml = notifications.ToastNotificationManager.getTemplateContent(toastXml);
        var toastTextElements = toastXml.getElementsByTagName("text");
        toastTextElements[0].appendChild(toastXml.createTextNode(toastText));
        var toast = new notifications.ToastNotification(toastXml);
        var toastNotifier = notifications.ToastNotificationManager.createToastNotifier();
        toastNotifier.show(toast);
    }

})();
