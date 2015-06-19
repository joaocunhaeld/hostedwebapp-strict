# hostedwebapp-strict
Sample of Windows 10 strict hosted web app. For this application, the local javascript files are loaded from the web page via javascript. In order to accomplish that, you must create a JS file in our website with the following content:
<code language="js">
// execute the following code only if running on windows
if (window.Windows) {
  // add the WinJS javascript file
  var windowsWinJS = document.createElement("script");
  windowsWinJS.type = "application/javascript";
  windowsWinJS.src = "ms-appx-web:///WinJS/js/WinJS.js";
  document.head.appendChild(windowsWinJS);

  // add the WinJS javascript file
  var windowsAppDefaultJS = document.createElement("script");
  windowsAppDefaultJS.type = "application/javascript";
  windowsAppDefaultJS.src = "ms-appx-web:///js/default.js";
  document.head.appendChild(windowsAppDefaultJS);
}
</code>

This javascript shall be included inside the <code>&lt;head&gt;</code> tag of your start page.

And then, make sure you have added the <code>default.js</code> file into your HostedWebApp.

Thanks,
Joao Cunha

