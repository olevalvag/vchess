import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {
  ABORT_EVENT,
  CHANGE_EVENT,
  CONNECTION_ABORT_STATUS,
  CONNECTION_FAIL_STATUS,
  CONNECTION_PENDING_STATUS,
  CONNECTION_SUCCESS_STATUS
} from "../../../utils/statics";
import {Tablet} from "../../../utils/utils";

@Component({
  selector: "connection-list",
  templateUrl: "connection-list.html",
})
export class ConnectionListComponent implements OnInit {

  @Input() steps;
  @Input() pin;

  @Output() internetAbort = new EventEmitter();
  @Output() tournamentEvent = new EventEmitter<string>();
  @Output() tabletEvent = new EventEmitter<string>();
  @Output() gameEvent = new EventEmitter<string>();

  constructor(public changeRef: ChangeDetectorRef) {
    const me = this;
  }

  ngOnInit() {
    const me = this;
  }

  ngOnDestroy(): void {
    const me = this;
  }

  public uiRrefresh() {
    const me = this;
    me.changeRef.detectChanges();
  }

  /////////////////////////////////////////////// INTERNET CONNECTION -----------------------


  protected isInternetVisible(): boolean {
    const me = this;
    const {internet} = me.steps;
    return internet.visible;
  }

  protected isInternetStatusSuccess(): boolean {
    const me = this;
    const {internet} = me.steps;
    return internet.status === CONNECTION_SUCCESS_STATUS;
  }

  protected isInternetStatusFail(): boolean {
    const me = this;
    const {internet} = me.steps;
    return internet.status === CONNECTION_FAIL_STATUS;
  }

  protected isInternetStatusPending(): boolean {
    const me = this;
    const {internet} = me.steps;
    return internet.status === CONNECTION_PENDING_STATUS;
  }

  protected onStopInternetCheck(): void {
    const me = this;
    me.internetAbort.emit();
  }

  /////////////////////////////////////////////// FETCH TOURNAMENT -----------------------

  protected isTournamentVisible(): boolean {
    const me = this;
    const {tournament} = me.steps;
    return tournament.visible;
  }

  protected isTournamentStatusSuccess(): boolean {
    const me = this;
    const {tournament} = me.steps;
    return tournament.status === CONNECTION_SUCCESS_STATUS;
  }

  protected isTournamentStatusFail(): boolean {
    const me = this;
    const {tournament} = me.steps;
    return tournament.status === CONNECTION_FAIL_STATUS;
  }

  protected isTournamentStatusPending(): boolean {
    const me = this;
    const {tournament} = me.steps;
    return tournament.status === CONNECTION_PENDING_STATUS;
  }

  protected getTournamentRetryAttempt(): number {
    const me = this;
    const {tournament} = me.steps;
    return tournament.attempt;
  }

  protected onAbortTournamentFetch(): void {
    const me = this;
    me.tournamentEvent.emit(ABORT_EVENT);
  }

  protected onTournamentPinChange(): void {
    const me = this;
    me.tournamentEvent.emit(CHANGE_EVENT);
  }

  protected showTournamentFailResponse(): boolean {
    const me = this;
    const {tournament} = me.steps;
    return tournament.showResponse;
  }

  protected toggleTournamentFailResponse(): void {
    const me = this;
    const {tournament} = me.steps;
    tournament.showResponse = !tournament.showResponse;
  }

  protected getTournamentFailResponse(): string {
    const me = this;
    const {tournament} = me.steps;
    return tournament.requestResponse;
  }

  /////////////////////////////////////////////// REGISTER TABLET -----------------------

  protected isRegisterTabletVisible(): boolean {
    const me = this;
    const {tablet} = me.steps;
    return tablet.visible;
  }

  protected isRegisterTabletStatusAborted(): boolean {
    const me = this;
    const {tablet} = me.steps;
    return tablet.status === CONNECTION_ABORT_STATUS;
  }

  protected isRegisterTabletStatusSuccess(): boolean {
    const me = this;
    const {tablet} = me.steps;
    return tablet.status === CONNECTION_SUCCESS_STATUS;
  }

  protected isRegisterTabletStatusFail(): boolean {
    const me = this;
    const {tablet} = me.steps;
    return tablet.status === CONNECTION_FAIL_STATUS;
  }

  protected isRegisterTabletStatusPending(): boolean {
    const me = this;
    const {tablet} = me.steps;
    return tablet.status === CONNECTION_PENDING_STATUS;
  }

  protected getRegisterTabletRetryAttempt(): number {
    const me = this;
    const {tablet} = me.steps;
    return tablet.attempt;
  }

  protected onRegisterTabletAbort(): void {
    const me = this;
    me.tabletEvent.emit(ABORT_EVENT);
  }

  protected onRegisterTabletManually(): void {
    const me = this;
    me.tabletEvent.emit(CHANGE_EVENT);
  }

  protected getCurrentTablet(): Tablet {
    const me = this;
    const {tablet} = me.steps;
    return tablet.data;
  }

  protected get getCurrentTabletName(): string {
    const me = this;
    const {tablet} = me.steps;
    const tabletData = tablet.data;
    return tabletData.tablet_name;
  }

  protected showRegisterTabletFailResponse(): boolean {
    const me = this;
    const {tablet} = me.steps;
    return tablet.showResponse;
  }

  protected toggleRegisterTabletResponse(): void {
    const me = this;
    const {tablet} = me.steps;
    tablet.showResponse = !tablet.showResponse;
  }

  protected getRegisterTabletFailResponse(): string {
    const me = this;
    const {tablet} = me.steps;
    return tablet.requestResponse;
  }

  /////////////////////////////////////////////// ASSIGNED GAME -----------------------

  protected isAssignedGameVisible(): boolean {
    const me = this;
    const {game} = me.steps;
    return game.visible;
  }

  protected isAssignedGameStatusSuccess(): boolean {
    const me = this;
    const {game} = me.steps;
    return game.status === CONNECTION_SUCCESS_STATUS;
  }

  protected isAssignedGameStatusFail(): boolean {
    const me = this;
    const {game} = me.steps;
    return game.status === CONNECTION_FAIL_STATUS;
  }

  protected isAssignedGameStatusPending(): boolean {
    const me = this;
    const {game} = me.steps;
    return game.status === CONNECTION_PENDING_STATUS;
  }


  protected isAssignedGameStatusAborted(): boolean {
    const me = this;
    const {game} = me.steps;
    return game.status === CONNECTION_ABORT_STATUS;
  }

  protected getGameRetryAttempt(): number {
    const me = this;
    const {game} = me.steps;
    return game.attempt;
  }

  protected onAssignedGameAbort(): void {
    const me = this;
    me.gameEvent.emit(ABORT_EVENT);
  }

  protected onAssignedGameManually(): void {
    const me = this;
    me.gameEvent.emit(CHANGE_EVENT);
  }

  protected showAssignedGameFailResponse(): boolean {
    const me = this;
    const {tablet} = me.steps;
    return tablet.showResponse;
  }

  protected toggleAssignedGameResponse(): void {
    const me = this;
    const {tablet} = me.steps;
    tablet.showResponse = !tablet.showResponse;
  }

  protected getAssignedGameFailResponse(): string {
    const me = this;
    const {tablet} = me.steps;
    return tablet.requestResponse;
  }

}
