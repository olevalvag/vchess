import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {NativeAudio} from '@ionic-native/native-audio';

@Injectable()
export class AudioPlayer {

  audioType: string = 'html5';
  sounds: any = [];

  constructor(public nativeAudio: NativeAudio, platform: Platform) {
    if (platform.is('cordova')) {
      this.audioType = 'native';
    }
  }

  preload(key, asset) {
    const me = this;
    if (me.audioType === 'html5') {
      me.sounds.push({
        key: key,
        asset: asset,
        type: 'html5'
      });
    } else {
      me.nativeAudio.preloadSimple(key, asset);
      me.sounds.push({
        key: key,
        asset: key,
        type: 'native'
      });
    }
  }

  play(key) {
    const me = this;
    let audio = me.sounds.find((sound) => {
      return sound.key === key;
    });

    if (audio.type === 'html5') {
      let audioAsset = new Audio(audio.asset);
      audioAsset.play();
    } else {
      me.nativeAudio.play(audio.asset).then((res) => {
        console.log(res);
      }, (err) => {
        console.log(err);
      });
    }
  }

}
