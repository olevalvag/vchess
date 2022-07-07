import {Component} from "@angular/core";
import {default as Utils} from "../../utils/utils";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NativeStorage} from "@ionic-native/native-storage";
import {PID_KEY} from "../../utils/statics";
import {ScreenOrientation} from "@ionic-native/screen-orientation";

@Component({
  selector: "pid",
  templateUrl: "pid.html"
})
export class PID_Page {

  protected form: FormGroup;
  protected pid: string;
  public viewPID: boolean;
  protected showPidInput: boolean = true;
  protected loadingData: boolean;

  constructor(public ga: GoogleAnalytics,
              public screenOrientation: ScreenOrientation,
              public storage: NativeStorage,
              public formBuilder: FormBuilder,) {
    const me = this;
    me.form = this.formBuilder.group({
      pid: ["", [Validators.required, Validators.pattern(/^(?=.*[a-zA-Z0-9])(?=.*?[a-zA-Z]).{6,}$/)]]
    });
  }

  ngOnInit() {
    const me = this;
    me.lockScreenPortrait();
    me.retrievePID();
  }

  ionViewDidEnter() {
    const me = this;
    Utils.sendViewTagtoGA(me.ga, 'pid_page');
  }

  private lockScreenPortrait() {
    const me = this;
    const orientation = me.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY;
    try {
      me.screenOrientation.lock(orientation).catch(console.error);
    } catch (e) {
      console.log("Look not supported");
    }
  }

  public getFormPid(): string {
    const me = this;
    return (me.form.get("pid") || {value: ""}).value;
  }

  public onDeletePidClick() {
    const me = this;
    me.pid = '';
    me.showPidInput = true;
    me.storage.remove(PID_KEY);
    me.resetForm();
  }

  public onChangePidClick() {
    const me = this;
    me.resetForm();
    me.showPidInput = true;
  }

  public onPidSaveClick() {
    const me = this;
    me.pid = me.getFormPid();
    me.showPidInput = false;
    me.storage.setItem(PID_KEY, me.pid);
    me.resetForm();
  }

  public onChangeCancelClick() {
    const me = this;
    me.showPidInput = false;
    me.resetForm();
  }

  public onTogglePidVisibility() {
    const me = this;
    me.viewPID = !me.viewPID;
  }

  private retrievePID() {
    const me = this;
    me.storage.getItem(PID_KEY).then(value => {
      if (value) {
        me.pid = value;
        me.showPidInput = false;
      }
      me.loadingData = false;
    }).catch(() => {
      me.pid = '';
      me.showPidInput = true;
      me.loadingData = false;
    });
  }

  private resetForm() {
    const me = this;
    me.form.reset();
    me.form.get("pid").setValidators([Validators.required, Validators.pattern(/^(?=.*[a-zA-Z0-9])(?=.*?[a-zA-Z]).{6,}$/)]);
    me.form.updateValueAndValidity()
  }

}
