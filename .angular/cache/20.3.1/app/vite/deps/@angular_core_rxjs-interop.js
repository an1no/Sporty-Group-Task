import {
  DestroyRef,
  Injector,
  PendingTasks,
  RuntimeError,
  assertInInjectionContext,
  assertNotInReactiveContext,
  computed,
  effect,
  encapsulateResourceError,
  getOutputDestroyRef,
  inject,
  resource,
  signal,
  untracked
} from "./chunk-PO3V5S7F.js";
import "./chunk-TJMWTXZG.js";
import "./chunk-S4N5HUZC.js";
import {
  Observable,
  ReplaySubject,
  __name,
  __spreadProps,
  __spreadValues,
  takeUntil
} from "./chunk-DZXEEKV3.js";

// node_modules/@angular/core/fesm2022/rxjs-interop.mjs
function takeUntilDestroyed(destroyRef) {
  if (!destroyRef) {
    ngDevMode && assertInInjectionContext(takeUntilDestroyed);
    destroyRef = inject(DestroyRef);
  }
  const destroyed$ = new Observable((subscriber) => {
    if (destroyRef.destroyed) {
      subscriber.next();
      return;
    }
    const unregisterFn = destroyRef.onDestroy(subscriber.next.bind(subscriber));
    return unregisterFn;
  });
  return (source) => {
    return source.pipe(takeUntil(destroyed$));
  };
}
__name(takeUntilDestroyed, "takeUntilDestroyed");
var _OutputFromObservableRef = class _OutputFromObservableRef {
  source;
  destroyed = false;
  destroyRef = inject(DestroyRef);
  constructor(source) {
    this.source = source;
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });
  }
  subscribe(callbackFn) {
    if (this.destroyed) {
      throw new RuntimeError(953, ngDevMode && "Unexpected subscription to destroyed `OutputRef`. The owning directive/component is destroyed.");
    }
    const subscription = this.source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: /* @__PURE__ */ __name((value) => callbackFn(value), "next")
    });
    return {
      unsubscribe: /* @__PURE__ */ __name(() => subscription.unsubscribe(), "unsubscribe")
    };
  }
};
__name(_OutputFromObservableRef, "OutputFromObservableRef");
var OutputFromObservableRef = _OutputFromObservableRef;
function outputFromObservable(observable, opts) {
  ngDevMode && assertInInjectionContext(outputFromObservable);
  return new OutputFromObservableRef(observable);
}
__name(outputFromObservable, "outputFromObservable");
function outputToObservable(ref) {
  const destroyRef = getOutputDestroyRef(ref);
  return new Observable((observer) => {
    const unregisterOnDestroy = destroyRef?.onDestroy(() => observer.complete());
    const subscription = ref.subscribe((v) => observer.next(v));
    return () => {
      subscription.unsubscribe();
      unregisterOnDestroy?.();
    };
  });
}
__name(outputToObservable, "outputToObservable");
function toObservable(source, options) {
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(toObservable);
  }
  const injector = options?.injector ?? inject(Injector);
  const subject = new ReplaySubject(1);
  const watcher = effect(() => {
    let value;
    try {
      value = source();
    } catch (err) {
      untracked(() => subject.error(err));
      return;
    }
    untracked(() => subject.next(value));
  }, { injector, manualCleanup: true });
  injector.get(DestroyRef).onDestroy(() => {
    watcher.destroy();
    subject.complete();
  });
  return subject.asObservable();
}
__name(toObservable, "toObservable");
function toSignal(source, options) {
  typeof ngDevMode !== "undefined" && ngDevMode && assertNotInReactiveContext(toSignal, "Invoking `toSignal` causes new subscriptions every time. Consider moving `toSignal` outside of the reactive context and read the signal value where needed.");
  const requiresCleanup = !options?.manualCleanup;
  if (ngDevMode && requiresCleanup && !options?.injector) {
    assertInInjectionContext(toSignal);
  }
  const cleanupRef = requiresCleanup ? options?.injector?.get(DestroyRef) ?? inject(DestroyRef) : null;
  const equal = makeToSignalEqual(options?.equal);
  let state;
  if (options?.requireSync) {
    state = signal({
      kind: 0
      /* StateKind.NoValue */
    }, { equal });
  } else {
    state = signal({ kind: 1, value: options?.initialValue }, { equal });
  }
  let destroyUnregisterFn;
  const sub = source.subscribe({
    next: /* @__PURE__ */ __name((value) => state.set({ kind: 1, value }), "next"),
    error: /* @__PURE__ */ __name((error) => {
      state.set({ kind: 2, error });
      destroyUnregisterFn?.();
    }, "error"),
    complete: /* @__PURE__ */ __name(() => {
      destroyUnregisterFn?.();
    }, "complete")
    // Completion of the Observable is meaningless to the signal. Signals don't have a concept of
    // "complete".
  });
  if (options?.requireSync && state().kind === 0) {
    throw new RuntimeError(601, (typeof ngDevMode === "undefined" || ngDevMode) && "`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.");
  }
  destroyUnregisterFn = cleanupRef?.onDestroy(sub.unsubscribe.bind(sub));
  return computed(() => {
    const current = state();
    switch (current.kind) {
      case 1:
        return current.value;
      case 2:
        throw current.error;
      case 0:
        throw new RuntimeError(601, (typeof ngDevMode === "undefined" || ngDevMode) && "`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.");
    }
  }, { equal: options?.equal });
}
__name(toSignal, "toSignal");
function makeToSignalEqual(userEquality = Object.is) {
  return (a, b) => a.kind === 1 && b.kind === 1 && userEquality(a.value, b.value);
}
__name(makeToSignalEqual, "makeToSignalEqual");
function pendingUntilEvent(injector) {
  if (injector === void 0) {
    ngDevMode && assertInInjectionContext(pendingUntilEvent);
    injector = inject(Injector);
  }
  const taskService = injector.get(PendingTasks);
  return (sourceObservable) => {
    return new Observable((originalSubscriber) => {
      const removeTask = taskService.add();
      let cleanedUp = false;
      function cleanupTask() {
        if (cleanedUp) {
          return;
        }
        removeTask();
        cleanedUp = true;
      }
      __name(cleanupTask, "cleanupTask");
      const innerSubscription = sourceObservable.subscribe({
        next: /* @__PURE__ */ __name((v) => {
          originalSubscriber.next(v);
          cleanupTask();
        }, "next"),
        complete: /* @__PURE__ */ __name(() => {
          originalSubscriber.complete();
          cleanupTask();
        }, "complete"),
        error: /* @__PURE__ */ __name((e) => {
          originalSubscriber.error(e);
          cleanupTask();
        }, "error")
      });
      innerSubscription.add(() => {
        originalSubscriber.unsubscribe();
        cleanupTask();
      });
      return innerSubscription;
    });
  };
}
__name(pendingUntilEvent, "pendingUntilEvent");
function rxResource(opts) {
  if (ngDevMode && !opts?.injector) {
    assertInInjectionContext(rxResource);
  }
  return resource(__spreadProps(__spreadValues({}, opts), {
    loader: void 0,
    stream: /* @__PURE__ */ __name((params) => {
      let sub;
      const onAbort = /* @__PURE__ */ __name(() => sub?.unsubscribe(), "onAbort");
      params.abortSignal.addEventListener("abort", onAbort);
      const stream = signal({ value: void 0 });
      let resolve;
      const promise = new Promise((r) => resolve = r);
      function send(value) {
        stream.set(value);
        resolve?.(stream);
        resolve = void 0;
      }
      __name(send, "send");
      const streamFn = opts.stream ?? opts.loader;
      if (streamFn === void 0) {
        throw new RuntimeError(990, ngDevMode && `Must provide \`stream\` option.`);
      }
      sub = streamFn(params).subscribe({
        next: /* @__PURE__ */ __name((value) => send({ value }), "next"),
        error: /* @__PURE__ */ __name((error) => {
          send({ error: encapsulateResourceError(error) });
          params.abortSignal.removeEventListener("abort", onAbort);
        }, "error"),
        complete: /* @__PURE__ */ __name(() => {
          if (resolve) {
            send({
              error: new RuntimeError(991, ngDevMode && "Resource completed before producing a value")
            });
          }
          params.abortSignal.removeEventListener("abort", onAbort);
        }, "complete")
      });
      return promise;
    }, "stream")
  }));
}
__name(rxResource, "rxResource");
export {
  outputFromObservable,
  outputToObservable,
  pendingUntilEvent,
  rxResource,
  takeUntilDestroyed,
  toObservable,
  toSignal
};
/*! Bundled license information:

@angular/core/fesm2022/rxjs-interop.mjs:
  (**
   * @license Angular v20.3.0
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)
*/
//# sourceMappingURL=@angular_core_rxjs-interop.js.map
