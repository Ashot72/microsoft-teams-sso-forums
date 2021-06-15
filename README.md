This is a basic forum app for Microsoft Teams. It uses SharePoint lists as data storage. Note, the app
is not a SharePoint SPFx app embedded in Teams. You can talk to the forum bot via adaptive cards and 
also search forums topics using Teams search-based messaging extension. The app can be added to 
user’s personal tab, to a team, chat or meeting. Single Sign-On (SSO) is used to authenticate tabs in 
Teams. 


You can download the package from [here](https://github.com/Ashot72/microsoft-teams-sso-forums/tree/main/package/forum.zip) and upload it to your Teams App Catalog to run the forum.

To get started.
```
       Clone the repository

       git clone https://github.com/Ashot72/microsoft-teams-sso-forums
       cd microsoft-teams-sso-forums

       # installs dependencies
       npm install

       # for local development
       gulp ngrok-serve
       
       # creates release package which should be deployed in Teams app catalog
        npm gulp manifest
      
```

Go to [Microsoft Teams Basic Forum Video](https://youtu.be/96qBGEBub1M) page

Go to [Microsoft Teams Basic Forum description](https://ashot72.github.io/microsoft-teams-sso-forums/) page