import {State} from './state'
import {cancelMove, getKeyAtDomPos, unselect} from './board'
import {eventPosition, isRightButton, raf} from './util'
import * as cg from './types'

export interface DrawShape {
  orig: cg.Key;
  dest?: cg.Key;
  brush: string;
  modifiers?: DrawModifiers;
  piece?: DrawShapePiece;
}

export interface DrawShapePiece {
  role: cg.Role;
  color: cg.Color;
  scale?: number;
}

export interface DrawBrush {
  key: string;
  color: string;
  opacity: number;
  lineWidth: number
}

export interface DrawBrushes {
  [name: string]: DrawBrush;
}

export interface DrawModifiers {
  lineWidth?: number;
}

export interface Drawable {
  enabled: boolean; // can draw
  visible: boolean; // can view
  eraseOnClick: boolean;
  onChange?: (shapes: DrawShape[]) => void;
  shapes: DrawShape[]; // user shapes
  autoShapes: DrawShape[]; // computer shapes
  current?: DrawCurrent;
  brushes: DrawBrushes;
  // drawable SVG pieces; used for crazyhouse drop
  pieces: {
    baseUrl: string
  },
  prevSvgHash: string
}

export interface DrawCurrent {
  orig: cg.Key; // orig key of drawing
  dest?: cg.Key; // shape dest, or undefined for circle
  mouseSq?: cg.Key; // square being moused over
  pos: cg.NumberPair; // relative current position
  brush: string; // brush name for shape
}

const brushes = ['green', 'red', 'blue', 'yellow'];

export function start(state: State, e: cg.MouchEvent): void {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  e.ctrlKey ? unselect(state) : cancelMove(state);
  const position = eventPosition(e) as cg.NumberPair;
  const orig = getKeyAtDomPos(position, state.orientation === 'white', state.dom.bounds());
  if (!orig) return;
  state.drawable.current = {
    orig: orig,
    pos: position,
    brush: eventBrush(e)
  };
  processDraw(state);
}

export function processDraw(state: State): void {
  raf(() => {
    const cur = state.drawable.current;
    if (cur) {
      const mouseSq = getKeyAtDomPos(cur.pos, state.orientation === 'white', state.dom.bounds());
      if (mouseSq !== cur.mouseSq) {
        cur.mouseSq = mouseSq;
        cur.dest = mouseSq !== cur.orig ? mouseSq : undefined;
        state.dom.redrawNow();
      }
      processDraw(state);
    }
  });
}

export function move(state: State, e: cg.MouchEvent): void {
  if (state.drawable.current) state.drawable.current.pos = eventPosition(e) as cg.NumberPair;
}

export function end(state: State): void {
  const cur = state.drawable.current;
  if (cur) {
    if (cur.mouseSq) addShape(state.drawable, cur);
    cancel(state);
  }
}

export function cancel(state: State): void {
  if (state.drawable.current) {
    state.drawable.current = undefined;
    state.dom.redraw();
  }
}

export function clear(state: State): void {
  if (state.drawable.shapes.length) {
    state.drawable.shapes = [];
    state.dom.redraw();
    onChange(state.drawable);
  }
}

function eventBrush(e: cg.MouchEvent): string {
  const a: number = e.shiftKey && isRightButton(e) ? 1 : 0;
  const b: number = e.altKey ? 2 : 0;
  return brushes[a + b];
}

function not<A>(f: (a: A) => boolean): (a: A) => boolean {
  return (x: A) => !f(x);
}

function addShape(drawable: Drawable, cur: DrawCurrent): void {
  const sameShape = (s: DrawShape) => {
    return s.orig === cur.orig && s.dest === cur.dest;
  };
  const similar = drawable.shapes.filter(sameShape)[0];
  if (similar) drawable.shapes = drawable.shapes.filter(not(sameShape));
  if (!similar || similar.brush !== cur.brush) drawable.shapes.push(cur);
  onChange(drawable);
}

function onChange(drawable: Drawable): void {
  if (drawable.onChange) drawable.onChange(drawable.shapes);
}
