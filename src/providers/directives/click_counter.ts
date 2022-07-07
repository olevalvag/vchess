import {Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";

@Directive({
  selector: '[ClickCounter]'
})
export class ClickCounterDirective implements OnInit, OnDestroy {

  el: HTMLElement;
  timeoutHandler: number;
  @Output() countReach = new EventEmitter();
  @Input() clickLimit: number = 5;
  private clicksCount: number = 0;
  private clicks = new Subject();
  private subscription: Subscription;

  constructor(el: ElementRef) {
    const me = this;
    me.el = el.nativeElement;
  }

  ngOnInit() {
    const me = this;
    me.subscription = me.clicks.subscribe(e => me.countReach.emit(e));
  }

  @HostListener('click', ['$event'])
  clickEvent(event) {
    const me = this;
    event.preventDefault();
    event.stopPropagation();
    me.startTimer();
    me.checkClicks();
  }

  ngOnDestroy() {
    const me = this;
    me.subscription.unsubscribe();
  }

  public resetTimer() {
    const me = this;
    clearInterval(me.timeoutHandler);
    me.timeoutHandler = null;
    me.clicksCount = 0;
  }

  public startTimer() {
    const me = this;

    if (me.timeoutHandler) return;
    me.timeoutHandler = setInterval(() => me.resetTimer(), 5000);
  }

  private checkClicks() {
    const me = this;
    me.clicksCount += 1;
    if (me.clicksCount >= me.clickLimit) {
      me.clicks.next(event);
      me.resetTimer();
    }
  }

}
