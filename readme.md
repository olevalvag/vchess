# vchess
Vchess is the code used by Clono up to version 2.66. The code is free to use under GNU General Public License v3.0, which means that you must disclose the source code for any derivative works. Please see the license file for all details.


## Requirements
1. [Node.js 10.x](https://nodejs.org/dist/latest-v10.x/)
2. [Ionic V3](https://ionicframework.com/docs/v3/)
3. [Cordova v8](https://www.npmjs.com/package/cordova-android)
4. [Android SDK 28](https://github.com/AndroidSDKSources/android-sdk-sources-for-api-level-28)

## Install
* Make sure environment has Node, Ionic and Cordova installed
* Ensure ionic is installed globally `npm install -g @ionic/cli`
* run `npm install` on root folder
* run `ionic cordova add platform android`

## Usage
* Add server endpoints into `./providers/quickgame` and `./providers/tournament` files 
* run `ionic serve` to start the app in browser
* run `ionic cordova run android` to start the app in an emulator
* run `ionic cordova build android` to create a new debug APK

#### NOTES
This app is a mobile application not meant to be used in a browser/web.

If using in web app will try and fail to use cordova plugins, while this is not a blocking issue is useful to keep it in mind

Also the UI is ONLY setup for mobile devices, web rendering may look strange (use device view instead)


#### Attributions 
* <a href="https://www.vecteezy.com/free-vector/chess-icon">Chess Icon Vectors by Vecteezy</a>
* [Chessground](https://github.com/lichess-org/chessground)
