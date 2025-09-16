import {
  BehaviorSubject,
  Observable,
  __name,
  __publicField,
  __spreadProps,
  __spreadValues
} from "./chunk-DZXEEKV3.js";

// node_modules/@angular/core/fesm2022/not_found.mjs
var _currentInjector = void 0;
function getCurrentInjector() {
  return _currentInjector;
}
__name(getCurrentInjector, "getCurrentInjector");
function setCurrentInjector(injector) {
  const former = _currentInjector;
  _currentInjector = injector;
  return former;
}
__name(setCurrentInjector, "setCurrentInjector");
var NOT_FOUND = Symbol("NotFound");
function isNotFound(e) {
  return e === NOT_FOUND || e?.name === "ɵNotFound";
}
__name(isNotFound, "isNotFound");

// node_modules/@angular/core/fesm2022/signal.mjs
function defaultEquals(a, b) {
  return Object.is(a, b);
}
__name(defaultEquals, "defaultEquals");
var activeConsumer = null;
var inNotificationPhase = false;
var epoch = 1;
var postProducerCreatedFn = null;
var SIGNAL = Symbol("SIGNAL");
function setActiveConsumer(consumer) {
  const prev = activeConsumer;
  activeConsumer = consumer;
  return prev;
}
__name(setActiveConsumer, "setActiveConsumer");
function getActiveConsumer() {
  return activeConsumer;
}
__name(getActiveConsumer, "getActiveConsumer");
function isInNotificationPhase() {
  return inNotificationPhase;
}
__name(isInNotificationPhase, "isInNotificationPhase");
var REACTIVE_NODE = {
  version: 0,
  lastCleanEpoch: 0,
  dirty: false,
  producers: void 0,
  producersTail: void 0,
  consumers: void 0,
  consumersTail: void 0,
  recomputing: false,
  consumerAllowSignalWrites: false,
  consumerIsAlwaysLive: false,
  kind: "unknown",
  producerMustRecompute: /* @__PURE__ */ __name(() => false, "producerMustRecompute"),
  producerRecomputeValue: /* @__PURE__ */ __name(() => {
  }, "producerRecomputeValue"),
  consumerMarkedDirty: /* @__PURE__ */ __name(() => {
  }, "consumerMarkedDirty"),
  consumerOnSignalRead: /* @__PURE__ */ __name(() => {
  }, "consumerOnSignalRead")
};
function producerAccessed(node) {
  if (inNotificationPhase) {
    throw new Error(typeof ngDevMode !== "undefined" && ngDevMode ? `Assertion error: signal read during notification phase` : "");
  }
  if (activeConsumer === null) {
    return;
  }
  activeConsumer.consumerOnSignalRead(node);
  const prevProducerLink = activeConsumer.producersTail;
  if (prevProducerLink !== void 0 && prevProducerLink.producer === node) {
    return;
  }
  let nextProducerLink = void 0;
  const isRecomputing = activeConsumer.recomputing;
  if (isRecomputing) {
    nextProducerLink = prevProducerLink !== void 0 ? prevProducerLink.nextProducer : activeConsumer.producers;
    if (nextProducerLink !== void 0 && nextProducerLink.producer === node) {
      activeConsumer.producersTail = nextProducerLink;
      nextProducerLink.lastReadVersion = node.version;
      return;
    }
  }
  const prevConsumerLink = node.consumersTail;
  if (prevConsumerLink !== void 0 && prevConsumerLink.consumer === activeConsumer && // However, we have to make sure that the link we've discovered isn't from a node that is incrementally rebuilding its producer list
  (!isRecomputing || isValidLink(prevConsumerLink, activeConsumer))) {
    return;
  }
  const isLive = consumerIsLive(activeConsumer);
  const newLink = {
    producer: node,
    consumer: activeConsumer,
    // instead of eagerly destroying the previous link, we delay until we've finished recomputing
    // the producers list, so that we can destroy all of the old links at once.
    nextProducer: nextProducerLink,
    prevConsumer: prevConsumerLink,
    lastReadVersion: node.version,
    nextConsumer: void 0
  };
  activeConsumer.producersTail = newLink;
  if (prevProducerLink !== void 0) {
    prevProducerLink.nextProducer = newLink;
  } else {
    activeConsumer.producers = newLink;
  }
  if (isLive) {
    producerAddLiveConsumer(node, newLink);
  }
}
__name(producerAccessed, "producerAccessed");
function producerIncrementEpoch() {
  epoch++;
}
__name(producerIncrementEpoch, "producerIncrementEpoch");
function producerUpdateValueVersion(node) {
  if (consumerIsLive(node) && !node.dirty) {
    return;
  }
  if (!node.dirty && node.lastCleanEpoch === epoch) {
    return;
  }
  if (!node.producerMustRecompute(node) && !consumerPollProducersForChange(node)) {
    producerMarkClean(node);
    return;
  }
  node.producerRecomputeValue(node);
  producerMarkClean(node);
}
__name(producerUpdateValueVersion, "producerUpdateValueVersion");
function producerNotifyConsumers(node) {
  if (node.consumers === void 0) {
    return;
  }
  const prev = inNotificationPhase;
  inNotificationPhase = true;
  try {
    for (let link = node.consumers; link !== void 0; link = link.nextConsumer) {
      const consumer = link.consumer;
      if (!consumer.dirty) {
        consumerMarkDirty(consumer);
      }
    }
  } finally {
    inNotificationPhase = prev;
  }
}
__name(producerNotifyConsumers, "producerNotifyConsumers");
function producerUpdatesAllowed() {
  return activeConsumer?.consumerAllowSignalWrites !== false;
}
__name(producerUpdatesAllowed, "producerUpdatesAllowed");
function consumerMarkDirty(node) {
  node.dirty = true;
  producerNotifyConsumers(node);
  node.consumerMarkedDirty?.(node);
}
__name(consumerMarkDirty, "consumerMarkDirty");
function producerMarkClean(node) {
  node.dirty = false;
  node.lastCleanEpoch = epoch;
}
__name(producerMarkClean, "producerMarkClean");
function consumerBeforeComputation(node) {
  if (node) {
    node.producersTail = void 0;
    node.recomputing = true;
  }
  return setActiveConsumer(node);
}
__name(consumerBeforeComputation, "consumerBeforeComputation");
function consumerAfterComputation(node, prevConsumer) {
  setActiveConsumer(prevConsumer);
  if (!node) {
    return;
  }
  node.recomputing = false;
  const producersTail = node.producersTail;
  let toRemove = producersTail !== void 0 ? producersTail.nextProducer : node.producers;
  if (toRemove !== void 0) {
    if (consumerIsLive(node)) {
      do {
        toRemove = producerRemoveLiveConsumerLink(toRemove);
      } while (toRemove !== void 0);
    }
    if (producersTail !== void 0) {
      producersTail.nextProducer = void 0;
    } else {
      node.producers = void 0;
    }
  }
}
__name(consumerAfterComputation, "consumerAfterComputation");
function consumerPollProducersForChange(node) {
  for (let link = node.producers; link !== void 0; link = link.nextProducer) {
    const producer = link.producer;
    const seenVersion = link.lastReadVersion;
    if (seenVersion !== producer.version) {
      return true;
    }
    producerUpdateValueVersion(producer);
    if (seenVersion !== producer.version) {
      return true;
    }
  }
  return false;
}
__name(consumerPollProducersForChange, "consumerPollProducersForChange");
function consumerDestroy(node) {
  if (consumerIsLive(node)) {
    let link = node.producers;
    while (link !== void 0) {
      link = producerRemoveLiveConsumerLink(link);
    }
  }
  node.producers = void 0;
  node.producersTail = void 0;
  node.consumers = void 0;
  node.consumersTail = void 0;
}
__name(consumerDestroy, "consumerDestroy");
function producerAddLiveConsumer(node, link) {
  const consumersTail = node.consumersTail;
  const wasLive = consumerIsLive(node);
  if (consumersTail !== void 0) {
    link.nextConsumer = consumersTail.nextConsumer;
    consumersTail.nextConsumer = link;
  } else {
    link.nextConsumer = void 0;
    node.consumers = link;
  }
  link.prevConsumer = consumersTail;
  node.consumersTail = link;
  if (!wasLive) {
    for (let link2 = node.producers; link2 !== void 0; link2 = link2.nextProducer) {
      producerAddLiveConsumer(link2.producer, link2);
    }
  }
}
__name(producerAddLiveConsumer, "producerAddLiveConsumer");
function producerRemoveLiveConsumerLink(link) {
  const producer = link.producer;
  const nextProducer = link.nextProducer;
  const nextConsumer = link.nextConsumer;
  const prevConsumer = link.prevConsumer;
  link.nextConsumer = void 0;
  link.prevConsumer = void 0;
  if (nextConsumer !== void 0) {
    nextConsumer.prevConsumer = prevConsumer;
  } else {
    producer.consumersTail = prevConsumer;
  }
  if (prevConsumer !== void 0) {
    prevConsumer.nextConsumer = nextConsumer;
  } else {
    producer.consumers = nextConsumer;
    if (!consumerIsLive(producer)) {
      let producerLink = producer.producers;
      while (producerLink !== void 0) {
        producerLink = producerRemoveLiveConsumerLink(producerLink);
      }
    }
  }
  return nextProducer;
}
__name(producerRemoveLiveConsumerLink, "producerRemoveLiveConsumerLink");
function consumerIsLive(node) {
  return node.consumerIsAlwaysLive || node.consumers !== void 0;
}
__name(consumerIsLive, "consumerIsLive");
function runPostProducerCreatedFn(node) {
  postProducerCreatedFn?.(node);
}
__name(runPostProducerCreatedFn, "runPostProducerCreatedFn");
function isValidLink(checkLink, consumer) {
  const producersTail = consumer.producersTail;
  if (producersTail !== void 0) {
    let link = consumer.producers;
    do {
      if (link === checkLink) {
        return true;
      }
      if (link === producersTail) {
        break;
      }
      link = link.nextProducer;
    } while (link !== void 0);
  }
  return false;
}
__name(isValidLink, "isValidLink");
function createComputed(computation, equal) {
  const node = Object.create(COMPUTED_NODE);
  node.computation = computation;
  if (equal !== void 0) {
    node.equal = equal;
  }
  const computed2 = /* @__PURE__ */ __name(() => {
    producerUpdateValueVersion(node);
    producerAccessed(node);
    if (node.value === ERRORED) {
      throw node.error;
    }
    return node.value;
  }, "computed");
  computed2[SIGNAL] = node;
  if (typeof ngDevMode !== "undefined" && ngDevMode) {
    const debugName = node.debugName ? " (" + node.debugName + ")" : "";
    computed2.toString = () => `[Computed${debugName}: ${node.value}]`;
  }
  runPostProducerCreatedFn(node);
  return computed2;
}
__name(createComputed, "createComputed");
var UNSET = Symbol("UNSET");
var COMPUTING = Symbol("COMPUTING");
var ERRORED = Symbol("ERRORED");
var COMPUTED_NODE = (() => {
  return __spreadProps(__spreadValues({}, REACTIVE_NODE), {
    value: UNSET,
    dirty: true,
    error: null,
    equal: defaultEquals,
    kind: "computed",
    producerMustRecompute(node) {
      return node.value === UNSET || node.value === COMPUTING;
    },
    producerRecomputeValue(node) {
      if (node.value === COMPUTING) {
        throw new Error(typeof ngDevMode !== "undefined" && ngDevMode ? "Detected cycle in computations." : "");
      }
      const oldValue = node.value;
      node.value = COMPUTING;
      const prevConsumer = consumerBeforeComputation(node);
      let newValue;
      let wasEqual = false;
      try {
        newValue = node.computation();
        setActiveConsumer(null);
        wasEqual = oldValue !== UNSET && oldValue !== ERRORED && newValue !== ERRORED && node.equal(oldValue, newValue);
      } catch (err) {
        newValue = ERRORED;
        node.error = err;
      } finally {
        consumerAfterComputation(node, prevConsumer);
      }
      if (wasEqual) {
        node.value = oldValue;
        return;
      }
      node.value = newValue;
      node.version++;
    }
  });
})();
function defaultThrowError() {
  throw new Error();
}
__name(defaultThrowError, "defaultThrowError");
var throwInvalidWriteToSignalErrorFn = defaultThrowError;
function throwInvalidWriteToSignalError(node) {
  throwInvalidWriteToSignalErrorFn(node);
}
__name(throwInvalidWriteToSignalError, "throwInvalidWriteToSignalError");
function setThrowInvalidWriteToSignalError(fn) {
  throwInvalidWriteToSignalErrorFn = fn;
}
__name(setThrowInvalidWriteToSignalError, "setThrowInvalidWriteToSignalError");
var postSignalSetFn = null;
function createSignal(initialValue, equal) {
  const node = Object.create(SIGNAL_NODE);
  node.value = initialValue;
  if (equal !== void 0) {
    node.equal = equal;
  }
  const getter = /* @__PURE__ */ __name((() => signalGetFn(node)), "getter");
  getter[SIGNAL] = node;
  if (typeof ngDevMode !== "undefined" && ngDevMode) {
    const debugName = node.debugName ? " (" + node.debugName + ")" : "";
    getter.toString = () => `[Signal${debugName}: ${node.value}]`;
  }
  runPostProducerCreatedFn(node);
  const set = /* @__PURE__ */ __name((newValue) => signalSetFn(node, newValue), "set");
  const update = /* @__PURE__ */ __name((updateFn) => signalUpdateFn(node, updateFn), "update");
  return [getter, set, update];
}
__name(createSignal, "createSignal");
function signalGetFn(node) {
  producerAccessed(node);
  return node.value;
}
__name(signalGetFn, "signalGetFn");
function signalSetFn(node, newValue) {
  if (!producerUpdatesAllowed()) {
    throwInvalidWriteToSignalError(node);
  }
  if (!node.equal(node.value, newValue)) {
    node.value = newValue;
    signalValueChanged(node);
  }
}
__name(signalSetFn, "signalSetFn");
function signalUpdateFn(node, updater) {
  if (!producerUpdatesAllowed()) {
    throwInvalidWriteToSignalError(node);
  }
  signalSetFn(node, updater(node.value));
}
__name(signalUpdateFn, "signalUpdateFn");
var SIGNAL_NODE = (() => {
  return __spreadProps(__spreadValues({}, REACTIVE_NODE), {
    equal: defaultEquals,
    value: void 0,
    kind: "signal"
  });
})();
function signalValueChanged(node) {
  node.version++;
  producerIncrementEpoch();
  producerNotifyConsumers(node);
  postSignalSetFn?.(node);
}
__name(signalValueChanged, "signalValueChanged");

// node_modules/@angular/core/fesm2022/effect.mjs
function createLinkedSignal(sourceFn, computationFn, equalityFn) {
  const node = Object.create(LINKED_SIGNAL_NODE);
  node.source = sourceFn;
  node.computation = computationFn;
  if (equalityFn != void 0) {
    node.equal = equalityFn;
  }
  const linkedSignalGetter = /* @__PURE__ */ __name(() => {
    producerUpdateValueVersion(node);
    producerAccessed(node);
    if (node.value === ERRORED) {
      throw node.error;
    }
    return node.value;
  }, "linkedSignalGetter");
  const getter = linkedSignalGetter;
  getter[SIGNAL] = node;
  if (typeof ngDevMode !== "undefined" && ngDevMode) {
    const debugName = node.debugName ? " (" + node.debugName + ")" : "";
    getter.toString = () => `[LinkedSignal${debugName}: ${node.value}]`;
  }
  runPostProducerCreatedFn(node);
  return getter;
}
__name(createLinkedSignal, "createLinkedSignal");
function linkedSignalSetFn(node, newValue) {
  producerUpdateValueVersion(node);
  signalSetFn(node, newValue);
  producerMarkClean(node);
}
__name(linkedSignalSetFn, "linkedSignalSetFn");
function linkedSignalUpdateFn(node, updater) {
  producerUpdateValueVersion(node);
  signalUpdateFn(node, updater);
  producerMarkClean(node);
}
__name(linkedSignalUpdateFn, "linkedSignalUpdateFn");
var LINKED_SIGNAL_NODE = (() => {
  return __spreadProps(__spreadValues({}, REACTIVE_NODE), {
    value: UNSET,
    dirty: true,
    error: null,
    equal: defaultEquals,
    kind: "linkedSignal",
    producerMustRecompute(node) {
      return node.value === UNSET || node.value === COMPUTING;
    },
    producerRecomputeValue(node) {
      if (node.value === COMPUTING) {
        throw new Error(typeof ngDevMode !== "undefined" && ngDevMode ? "Detected cycle in computations." : "");
      }
      const oldValue = node.value;
      node.value = COMPUTING;
      const prevConsumer = consumerBeforeComputation(node);
      let newValue;
      try {
        const newSourceValue = node.source();
        const prev = oldValue === UNSET || oldValue === ERRORED ? void 0 : {
          source: node.sourceValue,
          value: oldValue
        };
        newValue = node.computation(newSourceValue, prev);
        node.sourceValue = newSourceValue;
      } catch (err) {
        newValue = ERRORED;
        node.error = err;
      } finally {
        consumerAfterComputation(node, prevConsumer);
      }
      if (oldValue !== UNSET && newValue !== ERRORED && node.equal(oldValue, newValue)) {
        node.value = oldValue;
        return;
      }
      node.value = newValue;
      node.version++;
    }
  });
})();
function untracked(nonReactiveReadsFn) {
  const prevConsumer = setActiveConsumer(null);
  try {
    return nonReactiveReadsFn();
  } finally {
    setActiveConsumer(prevConsumer);
  }
}
__name(untracked, "untracked");
var BASE_EFFECT_NODE = (() => __spreadProps(__spreadValues({}, REACTIVE_NODE), {
  consumerIsAlwaysLive: true,
  consumerAllowSignalWrites: true,
  dirty: true,
  hasRun: false,
  kind: "effect"
}))();
function runEffect(node) {
  node.dirty = false;
  if (node.hasRun && !consumerPollProducersForChange(node)) {
    return;
  }
  node.hasRun = true;
  const prevNode = consumerBeforeComputation(node);
  try {
    node.cleanup();
    node.fn();
  } finally {
    consumerAfterComputation(node, prevNode);
  }
}
__name(runEffect, "runEffect");

// node_modules/@angular/core/fesm2022/weak_ref.mjs
function setAlternateWeakRefImpl(impl) {
}
__name(setAlternateWeakRefImpl, "setAlternateWeakRefImpl");

// node_modules/@angular/core/fesm2022/primitives/signals.mjs
var NOOP_CLEANUP_FN = /* @__PURE__ */ __name(() => {
}, "NOOP_CLEANUP_FN");
var WATCH_NODE = (() => {
  return __spreadProps(__spreadValues({}, REACTIVE_NODE), {
    consumerIsAlwaysLive: true,
    consumerAllowSignalWrites: false,
    consumerMarkedDirty: /* @__PURE__ */ __name((node) => {
      if (node.schedule !== null) {
        node.schedule(node.ref);
      }
    }, "consumerMarkedDirty"),
    hasRun: false,
    cleanupFn: NOOP_CLEANUP_FN
  });
})();

// node_modules/@angular/core/fesm2022/root_effect_scheduler.mjs
var ERROR_DETAILS_PAGE_BASE_URL = "https://angular.dev/errors";
var XSS_SECURITY_URL = "https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss";
var _RuntimeError = class _RuntimeError extends Error {
  code;
  constructor(code, message) {
    super(formatRuntimeError(code, message));
    this.code = code;
  }
};
__name(_RuntimeError, "RuntimeError");
var RuntimeError = _RuntimeError;
function formatRuntimeErrorCode(code) {
  return `NG0${Math.abs(code)}`;
}
__name(formatRuntimeErrorCode, "formatRuntimeErrorCode");
function formatRuntimeError(code, message) {
  const fullCode = formatRuntimeErrorCode(code);
  let errorMessage = `${fullCode}${message ? ": " + message : ""}`;
  if (ngDevMode && code < 0) {
    const addPeriodSeparator = !errorMessage.match(/[.,;!?\n]$/);
    const separator = addPeriodSeparator ? "." : "";
    errorMessage = `${errorMessage}${separator} Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/${fullCode}`;
  }
  return errorMessage;
}
__name(formatRuntimeError, "formatRuntimeError");
var _global = globalThis;
function ngDevModeResetPerfCounters() {
  const locationString = typeof location !== "undefined" ? location.toString() : "";
  const newCounters = {
    hydratedNodes: 0,
    hydratedComponents: 0,
    dehydratedViewsRemoved: 0,
    dehydratedViewsCleanupRuns: 0,
    componentsSkippedHydration: 0,
    deferBlocksWithIncrementalHydration: 0
  };
  const allowNgDevModeTrue = locationString.indexOf("ngDevMode=false") === -1;
  if (!allowNgDevModeTrue) {
    _global["ngDevMode"] = false;
  } else {
    if (typeof _global["ngDevMode"] !== "object") {
      _global["ngDevMode"] = {};
    }
    Object.assign(_global["ngDevMode"], newCounters);
  }
  return newCounters;
}
__name(ngDevModeResetPerfCounters, "ngDevModeResetPerfCounters");
function initNgDevMode() {
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    if (typeof ngDevMode !== "object" || Object.keys(ngDevMode).length === 0) {
      ngDevModeResetPerfCounters();
    }
    return typeof ngDevMode !== "undefined" && !!ngDevMode;
  }
  return false;
}
__name(initNgDevMode, "initNgDevMode");
function getClosureSafeProperty(objWithPropertyToExtract) {
  for (let key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === getClosureSafeProperty) {
      return key;
    }
  }
  throw Error(typeof ngDevMode !== "undefined" && ngDevMode ? "Could not find renamed property on target object." : "");
}
__name(getClosureSafeProperty, "getClosureSafeProperty");
function fillProperties(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}
__name(fillProperties, "fillProperties");
function stringify(token) {
  if (typeof token === "string") {
    return token;
  }
  if (Array.isArray(token)) {
    return `[${token.map(stringify).join(", ")}]`;
  }
  if (token == null) {
    return "" + token;
  }
  const name = token.overriddenName || token.name;
  if (name) {
    return `${name}`;
  }
  const result = token.toString();
  if (result == null) {
    return "" + result;
  }
  const newLineIndex = result.indexOf("\n");
  return newLineIndex >= 0 ? result.slice(0, newLineIndex) : result;
}
__name(stringify, "stringify");
function concatStringsWithSpace(before, after) {
  if (!before)
    return after || "";
  if (!after)
    return before;
  return `${before} ${after}`;
}
__name(concatStringsWithSpace, "concatStringsWithSpace");
function truncateMiddle(str, maxLength = 100) {
  if (!str || maxLength < 1 || str.length <= maxLength)
    return str;
  if (maxLength == 1)
    return str.substring(0, 1) + "...";
  const halfLimit = Math.round(maxLength / 2);
  return str.substring(0, halfLimit) + "..." + str.substring(str.length - halfLimit);
}
__name(truncateMiddle, "truncateMiddle");
var __forward_ref__ = getClosureSafeProperty({ __forward_ref__: getClosureSafeProperty });
function forwardRef(forwardRefFn) {
  forwardRefFn.__forward_ref__ = forwardRef;
  forwardRefFn.toString = function() {
    return stringify(this());
  };
  return forwardRefFn;
}
__name(forwardRef, "forwardRef");
function resolveForwardRef(type) {
  return isForwardRef(type) ? type() : type;
}
__name(resolveForwardRef, "resolveForwardRef");
function isForwardRef(fn) {
  return typeof fn === "function" && fn.hasOwnProperty(__forward_ref__) && fn.__forward_ref__ === forwardRef;
}
__name(isForwardRef, "isForwardRef");
function assertNumber(actual, msg) {
  if (!(typeof actual === "number")) {
    throwError(msg, typeof actual, "number", "===");
  }
}
__name(assertNumber, "assertNumber");
function assertNumberInRange(actual, minInclusive, maxInclusive) {
  assertNumber(actual, "Expected a number");
  assertLessThanOrEqual(actual, maxInclusive, "Expected number to be less than or equal to");
  assertGreaterThanOrEqual(actual, minInclusive, "Expected number to be greater than or equal to");
}
__name(assertNumberInRange, "assertNumberInRange");
function assertString(actual, msg) {
  if (!(typeof actual === "string")) {
    throwError(msg, actual === null ? "null" : typeof actual, "string", "===");
  }
}
__name(assertString, "assertString");
function assertFunction(actual, msg) {
  if (!(typeof actual === "function")) {
    throwError(msg, actual === null ? "null" : typeof actual, "function", "===");
  }
}
__name(assertFunction, "assertFunction");
function assertEqual(actual, expected, msg) {
  if (!(actual == expected)) {
    throwError(msg, actual, expected, "==");
  }
}
__name(assertEqual, "assertEqual");
function assertNotEqual(actual, expected, msg) {
  if (!(actual != expected)) {
    throwError(msg, actual, expected, "!=");
  }
}
__name(assertNotEqual, "assertNotEqual");
function assertSame(actual, expected, msg) {
  if (!(actual === expected)) {
    throwError(msg, actual, expected, "===");
  }
}
__name(assertSame, "assertSame");
function assertNotSame(actual, expected, msg) {
  if (!(actual !== expected)) {
    throwError(msg, actual, expected, "!==");
  }
}
__name(assertNotSame, "assertNotSame");
function assertLessThan(actual, expected, msg) {
  if (!(actual < expected)) {
    throwError(msg, actual, expected, "<");
  }
}
__name(assertLessThan, "assertLessThan");
function assertLessThanOrEqual(actual, expected, msg) {
  if (!(actual <= expected)) {
    throwError(msg, actual, expected, "<=");
  }
}
__name(assertLessThanOrEqual, "assertLessThanOrEqual");
function assertGreaterThan(actual, expected, msg) {
  if (!(actual > expected)) {
    throwError(msg, actual, expected, ">");
  }
}
__name(assertGreaterThan, "assertGreaterThan");
function assertGreaterThanOrEqual(actual, expected, msg) {
  if (!(actual >= expected)) {
    throwError(msg, actual, expected, ">=");
  }
}
__name(assertGreaterThanOrEqual, "assertGreaterThanOrEqual");
function assertNotDefined(actual, msg) {
  if (actual != null) {
    throwError(msg, actual, null, "==");
  }
}
__name(assertNotDefined, "assertNotDefined");
function assertDefined(actual, msg) {
  if (actual == null) {
    throwError(msg, actual, null, "!=");
  }
}
__name(assertDefined, "assertDefined");
function throwError(msg, actual, expected, comparison) {
  throw new Error(`ASSERTION ERROR: ${msg}` + (comparison == null ? "" : ` [Expected=> ${expected} ${comparison} ${actual} <=Actual]`));
}
__name(throwError, "throwError");
function assertDomNode(node) {
  if (!(node instanceof Node)) {
    throwError(`The provided value must be an instance of a DOM Node but got ${stringify(node)}`);
  }
}
__name(assertDomNode, "assertDomNode");
function assertElement(node) {
  if (!(node instanceof Element)) {
    throwError(`The provided value must be an element but got ${stringify(node)}`);
  }
}
__name(assertElement, "assertElement");
function assertIndexInRange(arr, index) {
  assertDefined(arr, "Array must be defined.");
  const maxLen = arr.length;
  if (index < 0 || index >= maxLen) {
    throwError(`Index expected to be less than ${maxLen} but got ${index}`);
  }
}
__name(assertIndexInRange, "assertIndexInRange");
function assertOneOf(value, ...validValues) {
  if (validValues.indexOf(value) !== -1)
    return true;
  throwError(`Expected value to be one of ${JSON.stringify(validValues)} but was ${JSON.stringify(value)}.`);
}
__name(assertOneOf, "assertOneOf");
function assertNotReactive(fn) {
  if (getActiveConsumer() !== null) {
    throwError(`${fn}() should never be called in a reactive context.`);
  }
}
__name(assertNotReactive, "assertNotReactive");
function ɵɵdefineInjectable(opts) {
  return {
    token: opts.token,
    providedIn: opts.providedIn || null,
    factory: opts.factory,
    value: void 0
  };
}
__name(ɵɵdefineInjectable, "ɵɵdefineInjectable");
var defineInjectable = ɵɵdefineInjectable;
function ɵɵdefineInjector(options) {
  return { providers: options.providers || [], imports: options.imports || [] };
}
__name(ɵɵdefineInjector, "ɵɵdefineInjector");
function getInjectableDef(type) {
  return getOwnDefinition(type, NG_PROV_DEF);
}
__name(getInjectableDef, "getInjectableDef");
function isInjectable(type) {
  return getInjectableDef(type) !== null;
}
__name(isInjectable, "isInjectable");
function getOwnDefinition(type, field) {
  return type.hasOwnProperty(field) && type[field] || null;
}
__name(getOwnDefinition, "getOwnDefinition");
function getInheritedInjectableDef(type) {
  const def = type?.[NG_PROV_DEF] ?? null;
  if (def) {
    ngDevMode && console.warn(`DEPRECATED: DI is instantiating a token "${type.name}" that inherits its @Injectable decorator but does not provide one itself.
This will become an error in a future version of Angular. Please add @Injectable() to the "${type.name}" class.`);
    return def;
  } else {
    return null;
  }
}
__name(getInheritedInjectableDef, "getInheritedInjectableDef");
function getInjectorDef(type) {
  return type && type.hasOwnProperty(NG_INJ_DEF) ? type[NG_INJ_DEF] : null;
}
__name(getInjectorDef, "getInjectorDef");
var NG_PROV_DEF = getClosureSafeProperty({ ɵprov: getClosureSafeProperty });
var NG_INJ_DEF = getClosureSafeProperty({ ɵinj: getClosureSafeProperty });
var _InjectionToken = class _InjectionToken {
  _desc;
  /** @internal */
  ngMetadataName = "InjectionToken";
  ɵprov;
  /**
   * @param _desc   Description for the token,
   *                used only for debugging purposes,
   *                it should but does not need to be unique
   * @param options Options for the token's usage, as described above
   */
  constructor(_desc, options) {
    this._desc = _desc;
    this.ɵprov = void 0;
    if (typeof options == "number") {
      (typeof ngDevMode === "undefined" || ngDevMode) && assertLessThan(options, 0, "Only negative numbers are supported here");
      this.__NG_ELEMENT_ID__ = options;
    } else if (options !== void 0) {
      this.ɵprov = ɵɵdefineInjectable({
        token: this,
        providedIn: options.providedIn || "root",
        factory: options.factory
      });
    }
  }
  /**
   * @internal
   */
  get multi() {
    return this;
  }
  toString() {
    return `InjectionToken ${this._desc}`;
  }
};
__name(_InjectionToken, "InjectionToken");
var InjectionToken = _InjectionToken;
var _injectorProfilerContext;
function getInjectorProfilerContext() {
  !ngDevMode && throwError("getInjectorProfilerContext should never be called in production mode");
  return _injectorProfilerContext;
}
__name(getInjectorProfilerContext, "getInjectorProfilerContext");
function setInjectorProfilerContext(context) {
  !ngDevMode && throwError("setInjectorProfilerContext should never be called in production mode");
  const previous = _injectorProfilerContext;
  _injectorProfilerContext = context;
  return previous;
}
__name(setInjectorProfilerContext, "setInjectorProfilerContext");
var injectorProfilerCallbacks = [];
var NOOP_PROFILER_REMOVAL = /* @__PURE__ */ __name(() => {
}, "NOOP_PROFILER_REMOVAL");
function removeProfiler(profiler) {
  const profilerIdx = injectorProfilerCallbacks.indexOf(profiler);
  if (profilerIdx !== -1) {
    injectorProfilerCallbacks.splice(profilerIdx, 1);
  }
}
__name(removeProfiler, "removeProfiler");
function setInjectorProfiler(injectorProfiler2) {
  !ngDevMode && throwError("setInjectorProfiler should never be called in production mode");
  if (injectorProfiler2 !== null) {
    if (!injectorProfilerCallbacks.includes(injectorProfiler2)) {
      injectorProfilerCallbacks.push(injectorProfiler2);
    }
    return () => removeProfiler(injectorProfiler2);
  } else {
    injectorProfilerCallbacks.length = 0;
    return NOOP_PROFILER_REMOVAL;
  }
}
__name(setInjectorProfiler, "setInjectorProfiler");
function injectorProfiler(event) {
  !ngDevMode && throwError("Injector profiler should never be called in production mode");
  for (let i = 0; i < injectorProfilerCallbacks.length; i++) {
    const injectorProfilerCallback = injectorProfilerCallbacks[i];
    injectorProfilerCallback(event);
  }
}
__name(injectorProfiler, "injectorProfiler");
function emitProviderConfiguredEvent(eventProvider, isViewProvider = false) {
  !ngDevMode && throwError("Injector profiler should never be called in production mode");
  let token;
  if (typeof eventProvider === "function") {
    token = eventProvider;
  } else if (eventProvider instanceof InjectionToken) {
    token = eventProvider;
  } else {
    token = resolveForwardRef(eventProvider.provide);
  }
  let provider = eventProvider;
  if (eventProvider instanceof InjectionToken) {
    provider = eventProvider.ɵprov || eventProvider;
  }
  injectorProfiler({
    type: 2,
    context: getInjectorProfilerContext(),
    providerRecord: { token, provider, isViewProvider }
  });
}
__name(emitProviderConfiguredEvent, "emitProviderConfiguredEvent");
function emitInjectorToCreateInstanceEvent(token) {
  !ngDevMode && throwError("Injector profiler should never be called in production mode");
  injectorProfiler({
    type: 4,
    context: getInjectorProfilerContext(),
    token
  });
}
__name(emitInjectorToCreateInstanceEvent, "emitInjectorToCreateInstanceEvent");
function emitInstanceCreatedByInjectorEvent(instance) {
  !ngDevMode && throwError("Injector profiler should never be called in production mode");
  injectorProfiler({
    type: 1,
    context: getInjectorProfilerContext(),
    instance: { value: instance }
  });
}
__name(emitInstanceCreatedByInjectorEvent, "emitInstanceCreatedByInjectorEvent");
function emitInjectEvent(token, value, flags) {
  !ngDevMode && throwError("Injector profiler should never be called in production mode");
  injectorProfiler({
    type: 0,
    context: getInjectorProfilerContext(),
    service: { token, value, flags }
  });
}
__name(emitInjectEvent, "emitInjectEvent");
function emitEffectCreatedEvent(effect2) {
  !ngDevMode && throwError("Injector profiler should never be called in production mode");
  injectorProfiler({
    type: 3,
    context: getInjectorProfilerContext(),
    effect: effect2
  });
}
__name(emitEffectCreatedEvent, "emitEffectCreatedEvent");
function runInInjectorProfilerContext(injector, token, callback) {
  !ngDevMode && throwError("runInInjectorProfilerContext should never be called in production mode");
  const prevInjectContext = setInjectorProfilerContext({ injector, token });
  try {
    callback();
  } finally {
    setInjectorProfilerContext(prevInjectContext);
  }
}
__name(runInInjectorProfilerContext, "runInInjectorProfilerContext");
function isEnvironmentProviders(value) {
  return value && !!value.ɵproviders;
}
__name(isEnvironmentProviders, "isEnvironmentProviders");
var NG_COMP_DEF = getClosureSafeProperty({ ɵcmp: getClosureSafeProperty });
var NG_DIR_DEF = getClosureSafeProperty({ ɵdir: getClosureSafeProperty });
var NG_PIPE_DEF = getClosureSafeProperty({ ɵpipe: getClosureSafeProperty });
var NG_MOD_DEF = getClosureSafeProperty({ ɵmod: getClosureSafeProperty });
var NG_FACTORY_DEF = getClosureSafeProperty({ ɵfac: getClosureSafeProperty });
var NG_ELEMENT_ID = getClosureSafeProperty({
  __NG_ELEMENT_ID__: getClosureSafeProperty
});
var NG_ENV_ID = getClosureSafeProperty({ __NG_ENV_ID__: getClosureSafeProperty });
function renderStringify(value) {
  if (typeof value === "string")
    return value;
  if (value == null)
    return "";
  return String(value);
}
__name(renderStringify, "renderStringify");
function stringifyForError(value) {
  if (typeof value === "function")
    return value.name || value.toString();
  if (typeof value === "object" && value != null && typeof value.type === "function") {
    return value.type.name || value.type.toString();
  }
  return renderStringify(value);
}
__name(stringifyForError, "stringifyForError");
var NG_RUNTIME_ERROR_CODE = getClosureSafeProperty({ "ngErrorCode": getClosureSafeProperty });
var NG_RUNTIME_ERROR_MESSAGE = getClosureSafeProperty({ "ngErrorMessage": getClosureSafeProperty });
var NG_TOKEN_PATH = getClosureSafeProperty({ "ngTokenPath": getClosureSafeProperty });
function cyclicDependencyError(token, path) {
  const message = ngDevMode ? `Circular dependency detected for \`${token}\`.` : "";
  return createRuntimeError(message, -200, path);
}
__name(cyclicDependencyError, "cyclicDependencyError");
function cyclicDependencyErrorWithDetails(token, path) {
  return augmentRuntimeError(cyclicDependencyError(token, path), null);
}
__name(cyclicDependencyErrorWithDetails, "cyclicDependencyErrorWithDetails");
function throwMixedMultiProviderError() {
  throw new Error(`Cannot mix multi providers and regular providers`);
}
__name(throwMixedMultiProviderError, "throwMixedMultiProviderError");
function throwInvalidProviderError(ngModuleType, providers, provider) {
  if (ngModuleType && providers) {
    const providerDetail = providers.map((v) => v == provider ? "?" + provider + "?" : "...");
    throw new Error(`Invalid provider for the NgModule '${stringify(ngModuleType)}' - only instances of Provider and Type are allowed, got: [${providerDetail.join(", ")}]`);
  } else if (isEnvironmentProviders(provider)) {
    if (provider.ɵfromNgModule) {
      throw new RuntimeError(207, `Invalid providers from 'importProvidersFrom' present in a non-environment injector. 'importProvidersFrom' can't be used for component providers.`);
    } else {
      throw new RuntimeError(207, `Invalid providers present in a non-environment injector. 'EnvironmentProviders' can't be used for component providers.`);
    }
  } else {
    throw new Error("Invalid provider");
  }
}
__name(throwInvalidProviderError, "throwInvalidProviderError");
function throwProviderNotFoundError(token, injectorName) {
  const errorMessage = ngDevMode && `No provider for ${stringifyForError(token)} found${injectorName ? ` in ${injectorName}` : ""}`;
  throw new RuntimeError(-201, errorMessage);
}
__name(throwProviderNotFoundError, "throwProviderNotFoundError");
function prependTokenToDependencyPath(error, token) {
  error[NG_TOKEN_PATH] ??= [];
  const currentPath = error[NG_TOKEN_PATH];
  let pathStr;
  if (typeof token === "object" && "multi" in token && token?.multi === true) {
    assertDefined(token.provide, "Token with multi: true should have a provide property");
    pathStr = stringifyForError(token.provide);
  } else {
    pathStr = stringifyForError(token);
  }
  if (currentPath[0] !== pathStr) {
    error[NG_TOKEN_PATH].unshift(pathStr);
  }
}
__name(prependTokenToDependencyPath, "prependTokenToDependencyPath");
function augmentRuntimeError(error, source) {
  const tokenPath = error[NG_TOKEN_PATH];
  const errorCode = error[NG_RUNTIME_ERROR_CODE];
  const message = error[NG_RUNTIME_ERROR_MESSAGE] || error.message;
  error.message = formatErrorMessage(message, errorCode, tokenPath, source);
  return error;
}
__name(augmentRuntimeError, "augmentRuntimeError");
function createRuntimeError(message, code, path) {
  const error = new RuntimeError(code, message);
  error[NG_RUNTIME_ERROR_CODE] = code;
  error[NG_RUNTIME_ERROR_MESSAGE] = message;
  if (path) {
    error[NG_TOKEN_PATH] = path;
  }
  return error;
}
__name(createRuntimeError, "createRuntimeError");
function getRuntimeErrorCode(error) {
  return error[NG_RUNTIME_ERROR_CODE];
}
__name(getRuntimeErrorCode, "getRuntimeErrorCode");
function formatErrorMessage(text, code, path = [], source = null) {
  let pathDetails = "";
  if (path && path.length > 1) {
    pathDetails = ` Path: ${path.join(" -> ")}.`;
  }
  const sourceDetails = source ? ` Source: ${source}.` : "";
  return formatRuntimeError(code, `${text}${sourceDetails}${pathDetails}`);
}
__name(formatErrorMessage, "formatErrorMessage");
var _injectImplementation;
function getInjectImplementation() {
  return _injectImplementation;
}
__name(getInjectImplementation, "getInjectImplementation");
function setInjectImplementation(impl) {
  const previous = _injectImplementation;
  _injectImplementation = impl;
  return previous;
}
__name(setInjectImplementation, "setInjectImplementation");
function injectRootLimpMode(token, notFoundValue, flags) {
  const injectableDef = getInjectableDef(token);
  if (injectableDef && injectableDef.providedIn == "root") {
    return injectableDef.value === void 0 ? injectableDef.value = injectableDef.factory() : injectableDef.value;
  }
  if (flags & 8)
    return null;
  if (notFoundValue !== void 0)
    return notFoundValue;
  throwProviderNotFoundError(token, "Injector");
}
__name(injectRootLimpMode, "injectRootLimpMode");
function assertInjectImplementationNotEqual(fn) {
  ngDevMode && assertNotEqual(_injectImplementation, fn, "Calling ɵɵinject would cause infinite recursion");
}
__name(assertInjectImplementationNotEqual, "assertInjectImplementationNotEqual");
var _THROW_IF_NOT_FOUND = {};
var THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
var DI_DECORATOR_FLAG = "__NG_DI_FLAG__";
var _RetrievingInjector = class _RetrievingInjector {
  injector;
  constructor(injector) {
    this.injector = injector;
  }
  retrieve(token, options) {
    const flags = convertToBitFlags(options) || 0;
    try {
      return this.injector.get(
        token,
        // When a dependency is requested with an optional flag, DI returns null as the default value.
        flags & 8 ? null : THROW_IF_NOT_FOUND,
        flags
      );
    } catch (e) {
      if (isNotFound(e)) {
        return e;
      }
      throw e;
    }
  }
};
__name(_RetrievingInjector, "RetrievingInjector");
var RetrievingInjector = _RetrievingInjector;
function injectInjectorOnly(token, flags = 0) {
  const currentInjector = getCurrentInjector();
  if (currentInjector === void 0) {
    throw new RuntimeError(-203, ngDevMode && `The \`${stringify(token)}\` token injection failed. \`inject()\` function must be called from an injection context such as a constructor, a factory function, a field initializer, or a function used with \`runInInjectionContext\`.`);
  } else if (currentInjector === null) {
    return injectRootLimpMode(token, void 0, flags);
  } else {
    const options = convertToInjectOptions(flags);
    const value = currentInjector.retrieve(token, options);
    ngDevMode && emitInjectEvent(token, value, flags);
    if (isNotFound(value)) {
      if (options.optional) {
        return null;
      }
      throw value;
    }
    return value;
  }
}
__name(injectInjectorOnly, "injectInjectorOnly");
function ɵɵinject(token, flags = 0) {
  return (getInjectImplementation() || injectInjectorOnly)(resolveForwardRef(token), flags);
}
__name(ɵɵinject, "ɵɵinject");
function ɵɵinvalidFactoryDep(index) {
  throw new RuntimeError(202, ngDevMode && `This constructor is not compatible with Angular Dependency Injection because its dependency at index ${index} of the parameter list is invalid.
This can happen if the dependency type is a primitive like a string or if an ancestor of this class is missing an Angular decorator.

Please check that 1) the type for the parameter at index ${index} is correct and 2) the correct Angular decorators are defined for this class and its ancestors.`);
}
__name(ɵɵinvalidFactoryDep, "ɵɵinvalidFactoryDep");
function inject2(token, options) {
  return ɵɵinject(token, convertToBitFlags(options));
}
__name(inject2, "inject");
function convertToBitFlags(flags) {
  if (typeof flags === "undefined" || typeof flags === "number") {
    return flags;
  }
  return 0 | // comment to force a line break in the formatter
  (flags.optional && 8) | (flags.host && 1) | (flags.self && 2) | (flags.skipSelf && 4);
}
__name(convertToBitFlags, "convertToBitFlags");
function convertToInjectOptions(flags) {
  return {
    optional: !!(flags & 8),
    host: !!(flags & 1),
    self: !!(flags & 2),
    skipSelf: !!(flags & 4)
  };
}
__name(convertToInjectOptions, "convertToInjectOptions");
function injectArgs(types) {
  const args = [];
  for (let i = 0; i < types.length; i++) {
    const arg = resolveForwardRef(types[i]);
    if (Array.isArray(arg)) {
      if (arg.length === 0) {
        throw new RuntimeError(900, ngDevMode && "Arguments array must have arguments.");
      }
      let type = void 0;
      let flags = 0;
      for (let j = 0; j < arg.length; j++) {
        const meta = arg[j];
        const flag = getInjectFlag(meta);
        if (typeof flag === "number") {
          if (flag === -1) {
            type = meta.token;
          } else {
            flags |= flag;
          }
        } else {
          type = meta;
        }
      }
      args.push(ɵɵinject(type, flags));
    } else {
      args.push(ɵɵinject(arg));
    }
  }
  return args;
}
__name(injectArgs, "injectArgs");
function attachInjectFlag(decorator, flag) {
  decorator[DI_DECORATOR_FLAG] = flag;
  decorator.prototype[DI_DECORATOR_FLAG] = flag;
  return decorator;
}
__name(attachInjectFlag, "attachInjectFlag");
function getInjectFlag(token) {
  return token[DI_DECORATOR_FLAG];
}
__name(getInjectFlag, "getInjectFlag");
function getFactoryDef(type, throwNotFound) {
  const hasFactoryDef = type.hasOwnProperty(NG_FACTORY_DEF);
  if (!hasFactoryDef && throwNotFound === true && ngDevMode) {
    throw new Error(`Type ${stringify(type)} does not have 'ɵfac' property.`);
  }
  return hasFactoryDef ? type[NG_FACTORY_DEF] : null;
}
__name(getFactoryDef, "getFactoryDef");
function arrayEquals(a, b, identityAccessor) {
  if (a.length !== b.length)
    return false;
  for (let i = 0; i < a.length; i++) {
    let valueA = a[i];
    let valueB = b[i];
    if (identityAccessor) {
      valueA = identityAccessor(valueA);
      valueB = identityAccessor(valueB);
    }
    if (valueB !== valueA) {
      return false;
    }
  }
  return true;
}
__name(arrayEquals, "arrayEquals");
function flatten(list) {
  return list.flat(Number.POSITIVE_INFINITY);
}
__name(flatten, "flatten");
function deepForEach(input, fn) {
  input.forEach((value) => Array.isArray(value) ? deepForEach(value, fn) : fn(value));
}
__name(deepForEach, "deepForEach");
function addToArray(arr, index, value) {
  if (index >= arr.length) {
    arr.push(value);
  } else {
    arr.splice(index, 0, value);
  }
}
__name(addToArray, "addToArray");
function removeFromArray(arr, index) {
  if (index >= arr.length - 1) {
    return arr.pop();
  } else {
    return arr.splice(index, 1)[0];
  }
}
__name(removeFromArray, "removeFromArray");
function newArray(size, value) {
  const list = [];
  for (let i = 0; i < size; i++) {
    list.push(value);
  }
  return list;
}
__name(newArray, "newArray");
function arraySplice(array, index, count) {
  const length = array.length - count;
  while (index < length) {
    array[index] = array[index + count];
    index++;
  }
  while (count--) {
    array.pop();
  }
}
__name(arraySplice, "arraySplice");
function arrayInsert2(array, index, value1, value2) {
  ngDevMode && assertLessThanOrEqual(index, array.length, "Can't insert past array end.");
  let end = array.length;
  if (end == index) {
    array.push(value1, value2);
  } else if (end === 1) {
    array.push(value2, array[0]);
    array[0] = value1;
  } else {
    end--;
    array.push(array[end - 1], array[end]);
    while (end > index) {
      const previousEnd = end - 2;
      array[end] = array[previousEnd];
      end--;
    }
    array[index] = value1;
    array[index + 1] = value2;
  }
}
__name(arrayInsert2, "arrayInsert2");
function keyValueArraySet(keyValueArray, key, value) {
  let index = keyValueArrayIndexOf(keyValueArray, key);
  if (index >= 0) {
    keyValueArray[index | 1] = value;
  } else {
    index = ~index;
    arrayInsert2(keyValueArray, index, key, value);
  }
  return index;
}
__name(keyValueArraySet, "keyValueArraySet");
function keyValueArrayGet(keyValueArray, key) {
  const index = keyValueArrayIndexOf(keyValueArray, key);
  if (index >= 0) {
    return keyValueArray[index | 1];
  }
  return void 0;
}
__name(keyValueArrayGet, "keyValueArrayGet");
function keyValueArrayIndexOf(keyValueArray, key) {
  return _arrayIndexOfSorted(keyValueArray, key, 1);
}
__name(keyValueArrayIndexOf, "keyValueArrayIndexOf");
function _arrayIndexOfSorted(array, value, shift) {
  ngDevMode && assertEqual(Array.isArray(array), true, "Expecting an array");
  let start = 0;
  let end = array.length >> shift;
  while (end !== start) {
    const middle = start + (end - start >> 1);
    const current = array[middle << shift];
    if (value === current) {
      return middle << shift;
    } else if (current > value) {
      end = middle;
    } else {
      start = middle + 1;
    }
  }
  return ~(end << shift);
}
__name(_arrayIndexOfSorted, "_arrayIndexOfSorted");
var EMPTY_OBJ = {};
var EMPTY_ARRAY = [];
if ((typeof ngDevMode === "undefined" || ngDevMode) && initNgDevMode()) {
  Object.freeze(EMPTY_OBJ);
  Object.freeze(EMPTY_ARRAY);
}
var ENVIRONMENT_INITIALIZER = new InjectionToken(ngDevMode ? "ENVIRONMENT_INITIALIZER" : "");
var INJECTOR$1 = new InjectionToken(
  ngDevMode ? "INJECTOR" : "",
  // Disable tslint because this is const enum which gets inlined not top level prop access.
  // tslint:disable-next-line: no-toplevel-property-access
  -1
  /* InjectorMarkers.Injector */
);
var INJECTOR_DEF_TYPES = new InjectionToken(ngDevMode ? "INJECTOR_DEF_TYPES" : "");
var _NullInjector = class _NullInjector {
  get(token, notFoundValue = THROW_IF_NOT_FOUND) {
    if (notFoundValue === THROW_IF_NOT_FOUND) {
      const message = ngDevMode ? `No provider found for \`${stringify(token)}\`.` : "";
      const error = createRuntimeError(
        message,
        -201
        /* RuntimeErrorCode.PROVIDER_NOT_FOUND */
      );
      error.name = "ɵNotFound";
      throw error;
    }
    return notFoundValue;
  }
};
__name(_NullInjector, "NullInjector");
var NullInjector = _NullInjector;
function getNgModuleDef(type) {
  return type[NG_MOD_DEF] || null;
}
__name(getNgModuleDef, "getNgModuleDef");
function getNgModuleDefOrThrow(type) {
  const ngModuleDef = getNgModuleDef(type);
  if (!ngModuleDef) {
    throw new RuntimeError(915, (typeof ngDevMode === "undefined" || ngDevMode) && `Type ${stringify(type)} does not have 'ɵmod' property.`);
  }
  return ngModuleDef;
}
__name(getNgModuleDefOrThrow, "getNgModuleDefOrThrow");
function getComponentDef(type) {
  return type[NG_COMP_DEF] || null;
}
__name(getComponentDef, "getComponentDef");
function getDirectiveDefOrThrow(type) {
  const def = getDirectiveDef(type);
  if (!def) {
    throw new RuntimeError(916, (typeof ngDevMode === "undefined" || ngDevMode) && `Type ${stringify(type)} does not have 'ɵdir' property.`);
  }
  return def;
}
__name(getDirectiveDefOrThrow, "getDirectiveDefOrThrow");
function getDirectiveDef(type) {
  return type[NG_DIR_DEF] || null;
}
__name(getDirectiveDef, "getDirectiveDef");
function getPipeDef(type) {
  return type[NG_PIPE_DEF] || null;
}
__name(getPipeDef, "getPipeDef");
function isStandalone(type) {
  const def = getComponentDef(type) || getDirectiveDef(type) || getPipeDef(type);
  return def !== null && def.standalone;
}
__name(isStandalone, "isStandalone");
function makeEnvironmentProviders(providers) {
  return {
    ɵproviders: providers
  };
}
__name(makeEnvironmentProviders, "makeEnvironmentProviders");
function provideEnvironmentInitializer(initializerFn) {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: initializerFn
    }
  ]);
}
__name(provideEnvironmentInitializer, "provideEnvironmentInitializer");
function importProvidersFrom(...sources) {
  return {
    ɵproviders: internalImportProvidersFrom(true, sources),
    ɵfromNgModule: true
  };
}
__name(importProvidersFrom, "importProvidersFrom");
function internalImportProvidersFrom(checkForStandaloneCmp, ...sources) {
  const providersOut = [];
  const dedup = /* @__PURE__ */ new Set();
  let injectorTypesWithProviders;
  const collectProviders = /* @__PURE__ */ __name((provider) => {
    providersOut.push(provider);
  }, "collectProviders");
  deepForEach(sources, (source) => {
    if ((typeof ngDevMode === "undefined" || ngDevMode) && checkForStandaloneCmp) {
      const cmpDef = getComponentDef(source);
      if (cmpDef?.standalone) {
        throw new RuntimeError(800, `Importing providers supports NgModule or ModuleWithProviders but got a standalone component "${stringifyForError(source)}"`);
      }
    }
    const internalSource = source;
    if (walkProviderTree(internalSource, collectProviders, [], dedup)) {
      injectorTypesWithProviders ||= [];
      injectorTypesWithProviders.push(internalSource);
    }
  });
  if (injectorTypesWithProviders !== void 0) {
    processInjectorTypesWithProviders(injectorTypesWithProviders, collectProviders);
  }
  return providersOut;
}
__name(internalImportProvidersFrom, "internalImportProvidersFrom");
function processInjectorTypesWithProviders(typesWithProviders, visitor) {
  for (let i = 0; i < typesWithProviders.length; i++) {
    const { ngModule, providers } = typesWithProviders[i];
    deepForEachProvider(providers, (provider) => {
      ngDevMode && validateProvider(provider, providers || EMPTY_ARRAY, ngModule);
      visitor(provider, ngModule);
    });
  }
}
__name(processInjectorTypesWithProviders, "processInjectorTypesWithProviders");
function walkProviderTree(container, visitor, parents, dedup) {
  container = resolveForwardRef(container);
  if (!container)
    return false;
  let defType = null;
  let injDef = getInjectorDef(container);
  const cmpDef = !injDef && getComponentDef(container);
  if (!injDef && !cmpDef) {
    const ngModule = container.ngModule;
    injDef = getInjectorDef(ngModule);
    if (injDef) {
      defType = ngModule;
    } else {
      return false;
    }
  } else if (cmpDef && !cmpDef.standalone) {
    return false;
  } else {
    defType = container;
  }
  if (ngDevMode && parents.indexOf(defType) !== -1) {
    const defName = stringify(defType);
    const path = parents.map(stringify).concat(defName);
    throw cyclicDependencyErrorWithDetails(defName, path);
  }
  const isDuplicate = dedup.has(defType);
  if (cmpDef) {
    if (isDuplicate) {
      return false;
    }
    dedup.add(defType);
    if (cmpDef.dependencies) {
      const deps = typeof cmpDef.dependencies === "function" ? cmpDef.dependencies() : cmpDef.dependencies;
      for (const dep of deps) {
        walkProviderTree(dep, visitor, parents, dedup);
      }
    }
  } else if (injDef) {
    if (injDef.imports != null && !isDuplicate) {
      ngDevMode && parents.push(defType);
      dedup.add(defType);
      let importTypesWithProviders;
      try {
        deepForEach(injDef.imports, (imported) => {
          if (walkProviderTree(imported, visitor, parents, dedup)) {
            importTypesWithProviders ||= [];
            importTypesWithProviders.push(imported);
          }
        });
      } finally {
        ngDevMode && parents.pop();
      }
      if (importTypesWithProviders !== void 0) {
        processInjectorTypesWithProviders(importTypesWithProviders, visitor);
      }
    }
    if (!isDuplicate) {
      const factory = getFactoryDef(defType) || (() => new defType());
      visitor({ provide: defType, useFactory: factory, deps: EMPTY_ARRAY }, defType);
      visitor({ provide: INJECTOR_DEF_TYPES, useValue: defType, multi: true }, defType);
      visitor({ provide: ENVIRONMENT_INITIALIZER, useValue: /* @__PURE__ */ __name(() => ɵɵinject(defType), "useValue"), multi: true }, defType);
    }
    const defProviders = injDef.providers;
    if (defProviders != null && !isDuplicate) {
      const injectorType = container;
      deepForEachProvider(defProviders, (provider) => {
        ngDevMode && validateProvider(provider, defProviders, injectorType);
        visitor(provider, injectorType);
      });
    }
  } else {
    return false;
  }
  return defType !== container && container.providers !== void 0;
}
__name(walkProviderTree, "walkProviderTree");
function validateProvider(provider, providers, containerType) {
  if (isTypeProvider(provider) || isValueProvider(provider) || isFactoryProvider(provider) || isExistingProvider(provider)) {
    return;
  }
  const classRef = resolveForwardRef(provider && (provider.useClass || provider.provide));
  if (!classRef) {
    throwInvalidProviderError(containerType, providers, provider);
  }
}
__name(validateProvider, "validateProvider");
function deepForEachProvider(providers, fn) {
  for (let provider of providers) {
    if (isEnvironmentProviders(provider)) {
      provider = provider.ɵproviders;
    }
    if (Array.isArray(provider)) {
      deepForEachProvider(provider, fn);
    } else {
      fn(provider);
    }
  }
}
__name(deepForEachProvider, "deepForEachProvider");
var USE_VALUE = getClosureSafeProperty({
  provide: String,
  useValue: getClosureSafeProperty
});
function isValueProvider(value) {
  return value !== null && typeof value == "object" && USE_VALUE in value;
}
__name(isValueProvider, "isValueProvider");
function isExistingProvider(value) {
  return !!(value && value.useExisting);
}
__name(isExistingProvider, "isExistingProvider");
function isFactoryProvider(value) {
  return !!(value && value.useFactory);
}
__name(isFactoryProvider, "isFactoryProvider");
function isTypeProvider(value) {
  return typeof value === "function";
}
__name(isTypeProvider, "isTypeProvider");
function isClassProvider(value) {
  return !!value.useClass;
}
__name(isClassProvider, "isClassProvider");
var INJECTOR_SCOPE = new InjectionToken(ngDevMode ? "Set Injector scope." : "");
var NOT_YET = {};
var CIRCULAR = {};
var NULL_INJECTOR = void 0;
function getNullInjector() {
  if (NULL_INJECTOR === void 0) {
    NULL_INJECTOR = new NullInjector();
  }
  return NULL_INJECTOR;
}
__name(getNullInjector, "getNullInjector");
var _EnvironmentInjector = class _EnvironmentInjector {
};
__name(_EnvironmentInjector, "EnvironmentInjector");
var EnvironmentInjector = _EnvironmentInjector;
var _R3Injector = class _R3Injector extends EnvironmentInjector {
  parent;
  source;
  scopes;
  /**
   * Map of tokens to records which contain the instances of those tokens.
   * - `null` value implies that we don't have the record. Used by tree-shakable injectors
   * to prevent further searches.
   */
  records = /* @__PURE__ */ new Map();
  /**
   * Set of values instantiated by this injector which contain `ngOnDestroy` lifecycle hooks.
   */
  _ngOnDestroyHooks = /* @__PURE__ */ new Set();
  _onDestroyHooks = [];
  /**
   * Flag indicating that this injector was previously destroyed.
   */
  get destroyed() {
    return this._destroyed;
  }
  _destroyed = false;
  injectorDefTypes;
  constructor(providers, parent, source, scopes) {
    super();
    this.parent = parent;
    this.source = source;
    this.scopes = scopes;
    forEachSingleProvider(providers, (provider) => this.processProvider(provider));
    this.records.set(INJECTOR$1, makeRecord(void 0, this));
    if (scopes.has("environment")) {
      this.records.set(EnvironmentInjector, makeRecord(void 0, this));
    }
    const record = this.records.get(INJECTOR_SCOPE);
    if (record != null && typeof record.value === "string") {
      this.scopes.add(record.value);
    }
    this.injectorDefTypes = new Set(this.get(INJECTOR_DEF_TYPES, EMPTY_ARRAY, { self: true }));
  }
  retrieve(token, options) {
    const flags = convertToBitFlags(options) || 0;
    try {
      return this.get(
        token,
        // When a dependency is requested with an optional flag, DI returns null as the default value.
        THROW_IF_NOT_FOUND,
        flags
      );
    } catch (e) {
      if (isNotFound(e)) {
        return e;
      }
      throw e;
    }
  }
  /**
   * Destroy the injector and release references to every instance or provider associated with it.
   *
   * Also calls the `OnDestroy` lifecycle hooks of every instance that was created for which a
   * hook was found.
   */
  destroy() {
    assertNotDestroyed(this);
    this._destroyed = true;
    const prevConsumer = setActiveConsumer(null);
    try {
      for (const service of this._ngOnDestroyHooks) {
        service.ngOnDestroy();
      }
      const onDestroyHooks = this._onDestroyHooks;
      this._onDestroyHooks = [];
      for (const hook of onDestroyHooks) {
        hook();
      }
    } finally {
      this.records.clear();
      this._ngOnDestroyHooks.clear();
      this.injectorDefTypes.clear();
      setActiveConsumer(prevConsumer);
    }
  }
  onDestroy(callback) {
    assertNotDestroyed(this);
    this._onDestroyHooks.push(callback);
    return () => this.removeOnDestroy(callback);
  }
  runInContext(fn) {
    assertNotDestroyed(this);
    const previousInjector = setCurrentInjector(this);
    const previousInjectImplementation = setInjectImplementation(void 0);
    let prevInjectContext;
    if (ngDevMode) {
      prevInjectContext = setInjectorProfilerContext({ injector: this, token: null });
    }
    try {
      return fn();
    } finally {
      setCurrentInjector(previousInjector);
      setInjectImplementation(previousInjectImplementation);
      ngDevMode && setInjectorProfilerContext(prevInjectContext);
    }
  }
  get(token, notFoundValue = THROW_IF_NOT_FOUND, options) {
    assertNotDestroyed(this);
    if (token.hasOwnProperty(NG_ENV_ID)) {
      return token[NG_ENV_ID](this);
    }
    const flags = convertToBitFlags(options);
    let prevInjectContext;
    if (ngDevMode) {
      prevInjectContext = setInjectorProfilerContext({ injector: this, token });
    }
    const previousInjector = setCurrentInjector(this);
    const previousInjectImplementation = setInjectImplementation(void 0);
    try {
      if (!(flags & 4)) {
        let record = this.records.get(token);
        if (record === void 0) {
          const def = couldBeInjectableType(token) && getInjectableDef(token);
          if (def && this.injectableDefInScope(def)) {
            if (ngDevMode) {
              runInInjectorProfilerContext(this, token, () => {
                emitProviderConfiguredEvent(token);
              });
            }
            record = makeRecord(injectableDefOrInjectorDefFactory(token), NOT_YET);
          } else {
            record = null;
          }
          this.records.set(token, record);
        }
        if (record != null) {
          return this.hydrate(token, record, flags);
        }
      }
      const nextInjector = !(flags & 2) ? this.parent : getNullInjector();
      notFoundValue = flags & 8 && notFoundValue === THROW_IF_NOT_FOUND ? null : notFoundValue;
      return nextInjector.get(token, notFoundValue);
    } catch (error) {
      const errorCode = getRuntimeErrorCode(error);
      if (errorCode === -200 || errorCode === -201) {
        if (!ngDevMode) {
          throw new RuntimeError(errorCode, null);
        }
        prependTokenToDependencyPath(error, token);
        if (previousInjector) {
          throw error;
        } else {
          throw augmentRuntimeError(error, this.source);
        }
      } else {
        throw error;
      }
    } finally {
      setInjectImplementation(previousInjectImplementation);
      setCurrentInjector(previousInjector);
      ngDevMode && setInjectorProfilerContext(prevInjectContext);
    }
  }
  /** @internal */
  resolveInjectorInitializers() {
    const prevConsumer = setActiveConsumer(null);
    const previousInjector = setCurrentInjector(this);
    const previousInjectImplementation = setInjectImplementation(void 0);
    let prevInjectContext;
    if (ngDevMode) {
      prevInjectContext = setInjectorProfilerContext({ injector: this, token: null });
    }
    try {
      const initializers = this.get(ENVIRONMENT_INITIALIZER, EMPTY_ARRAY, { self: true });
      if (ngDevMode && !Array.isArray(initializers)) {
        throw new RuntimeError(-209, `Unexpected type of the \`ENVIRONMENT_INITIALIZER\` token value (expected an array, but got ${typeof initializers}). Please check that the \`ENVIRONMENT_INITIALIZER\` token is configured as a \`multi: true\` provider.`);
      }
      for (const initializer of initializers) {
        initializer();
      }
    } finally {
      setCurrentInjector(previousInjector);
      setInjectImplementation(previousInjectImplementation);
      ngDevMode && setInjectorProfilerContext(prevInjectContext);
      setActiveConsumer(prevConsumer);
    }
  }
  toString() {
    const tokens = [];
    const records = this.records;
    for (const token of records.keys()) {
      tokens.push(stringify(token));
    }
    return `R3Injector[${tokens.join(", ")}]`;
  }
  /**
   * Process a `SingleProvider` and add it.
   */
  processProvider(provider) {
    provider = resolveForwardRef(provider);
    let token = isTypeProvider(provider) ? provider : resolveForwardRef(provider && provider.provide);
    const record = providerToRecord(provider);
    if (ngDevMode) {
      runInInjectorProfilerContext(this, token, () => {
        if (isValueProvider(provider)) {
          emitInjectorToCreateInstanceEvent(token);
          emitInstanceCreatedByInjectorEvent(provider.useValue);
        }
        emitProviderConfiguredEvent(provider);
      });
    }
    if (!isTypeProvider(provider) && provider.multi === true) {
      let multiRecord = this.records.get(token);
      if (multiRecord) {
        if (ngDevMode && multiRecord.multi === void 0) {
          throwMixedMultiProviderError();
        }
      } else {
        multiRecord = makeRecord(void 0, NOT_YET, true);
        multiRecord.factory = () => injectArgs(multiRecord.multi);
        this.records.set(token, multiRecord);
      }
      token = provider;
      multiRecord.multi.push(provider);
    } else {
      if (ngDevMode) {
        const existing = this.records.get(token);
        if (existing && existing.multi !== void 0) {
          throwMixedMultiProviderError();
        }
      }
    }
    this.records.set(token, record);
  }
  hydrate(token, record, flags) {
    const prevConsumer = setActiveConsumer(null);
    try {
      if (record.value === CIRCULAR) {
        throw cyclicDependencyError(stringify(token));
      } else if (record.value === NOT_YET) {
        record.value = CIRCULAR;
        if (ngDevMode) {
          runInInjectorProfilerContext(this, token, () => {
            emitInjectorToCreateInstanceEvent(token);
            record.value = record.factory(void 0, flags);
            emitInstanceCreatedByInjectorEvent(record.value);
          });
        } else {
          record.value = record.factory(void 0, flags);
        }
      }
      if (typeof record.value === "object" && record.value && hasOnDestroy(record.value)) {
        this._ngOnDestroyHooks.add(record.value);
      }
      return record.value;
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
  injectableDefInScope(def) {
    if (!def.providedIn) {
      return false;
    }
    const providedIn = resolveForwardRef(def.providedIn);
    if (typeof providedIn === "string") {
      return providedIn === "any" || this.scopes.has(providedIn);
    } else {
      return this.injectorDefTypes.has(providedIn);
    }
  }
  removeOnDestroy(callback) {
    const destroyCBIdx = this._onDestroyHooks.indexOf(callback);
    if (destroyCBIdx !== -1) {
      this._onDestroyHooks.splice(destroyCBIdx, 1);
    }
  }
};
__name(_R3Injector, "R3Injector");
var R3Injector = _R3Injector;
function injectableDefOrInjectorDefFactory(token) {
  const injectableDef = getInjectableDef(token);
  const factory = injectableDef !== null ? injectableDef.factory : getFactoryDef(token);
  if (factory !== null) {
    return factory;
  }
  if (token instanceof InjectionToken) {
    throw new RuntimeError(204, ngDevMode && `Token ${stringify(token)} is missing a ɵprov definition.`);
  }
  if (token instanceof Function) {
    return getUndecoratedInjectableFactory(token);
  }
  throw new RuntimeError(204, ngDevMode && "unreachable");
}
__name(injectableDefOrInjectorDefFactory, "injectableDefOrInjectorDefFactory");
function getUndecoratedInjectableFactory(token) {
  const paramLength = token.length;
  if (paramLength > 0) {
    throw new RuntimeError(204, ngDevMode && `Can't resolve all parameters for ${stringify(token)}: (${newArray(paramLength, "?").join(", ")}).`);
  }
  const inheritedInjectableDef = getInheritedInjectableDef(token);
  if (inheritedInjectableDef !== null) {
    return () => inheritedInjectableDef.factory(token);
  } else {
    return () => new token();
  }
}
__name(getUndecoratedInjectableFactory, "getUndecoratedInjectableFactory");
function providerToRecord(provider) {
  if (isValueProvider(provider)) {
    return makeRecord(void 0, provider.useValue);
  } else {
    const factory = providerToFactory(provider);
    return makeRecord(factory, NOT_YET);
  }
}
__name(providerToRecord, "providerToRecord");
function providerToFactory(provider, ngModuleType, providers) {
  let factory = void 0;
  if (ngDevMode && isEnvironmentProviders(provider)) {
    throwInvalidProviderError(void 0, providers, provider);
  }
  if (isTypeProvider(provider)) {
    const unwrappedProvider = resolveForwardRef(provider);
    return getFactoryDef(unwrappedProvider) || injectableDefOrInjectorDefFactory(unwrappedProvider);
  } else {
    if (isValueProvider(provider)) {
      factory = /* @__PURE__ */ __name(() => resolveForwardRef(provider.useValue), "factory");
    } else if (isFactoryProvider(provider)) {
      factory = /* @__PURE__ */ __name(() => provider.useFactory(...injectArgs(provider.deps || [])), "factory");
    } else if (isExistingProvider(provider)) {
      factory = /* @__PURE__ */ __name((_, flags) => ɵɵinject(resolveForwardRef(provider.useExisting), flags !== void 0 && flags & 8 ? 8 : void 0), "factory");
    } else {
      const classRef = resolveForwardRef(provider && (provider.useClass || provider.provide));
      if (ngDevMode && !classRef) {
        throwInvalidProviderError(ngModuleType, providers, provider);
      }
      if (hasDeps(provider)) {
        factory = /* @__PURE__ */ __name(() => new classRef(...injectArgs(provider.deps)), "factory");
      } else {
        return getFactoryDef(classRef) || injectableDefOrInjectorDefFactory(classRef);
      }
    }
  }
  return factory;
}
__name(providerToFactory, "providerToFactory");
function assertNotDestroyed(injector) {
  if (injector.destroyed) {
    throw new RuntimeError(205, ngDevMode && "Injector has already been destroyed.");
  }
}
__name(assertNotDestroyed, "assertNotDestroyed");
function makeRecord(factory, value, multi = false) {
  return {
    factory,
    value,
    multi: multi ? [] : void 0
  };
}
__name(makeRecord, "makeRecord");
function hasDeps(value) {
  return !!value.deps;
}
__name(hasDeps, "hasDeps");
function hasOnDestroy(value) {
  return value !== null && typeof value === "object" && typeof value.ngOnDestroy === "function";
}
__name(hasOnDestroy, "hasOnDestroy");
function couldBeInjectableType(value) {
  return typeof value === "function" || typeof value === "object" && value.ngMetadataName === "InjectionToken";
}
__name(couldBeInjectableType, "couldBeInjectableType");
function forEachSingleProvider(providers, fn) {
  for (const provider of providers) {
    if (Array.isArray(provider)) {
      forEachSingleProvider(provider, fn);
    } else if (provider && isEnvironmentProviders(provider)) {
      forEachSingleProvider(provider.ɵproviders, fn);
    } else {
      fn(provider);
    }
  }
}
__name(forEachSingleProvider, "forEachSingleProvider");
function runInInjectionContext(injector, fn) {
  let internalInjector;
  if (injector instanceof R3Injector) {
    assertNotDestroyed(injector);
    internalInjector = injector;
  } else {
    internalInjector = new RetrievingInjector(injector);
  }
  let prevInjectorProfilerContext;
  if (ngDevMode) {
    prevInjectorProfilerContext = setInjectorProfilerContext({ injector, token: null });
  }
  const prevInjector = setCurrentInjector(internalInjector);
  const previousInjectImplementation = setInjectImplementation(void 0);
  try {
    return fn();
  } finally {
    setCurrentInjector(prevInjector);
    ngDevMode && setInjectorProfilerContext(prevInjectorProfilerContext);
    setInjectImplementation(previousInjectImplementation);
  }
}
__name(runInInjectionContext, "runInInjectionContext");
function isInInjectionContext() {
  return getInjectImplementation() !== void 0 || getCurrentInjector() != null;
}
__name(isInInjectionContext, "isInInjectionContext");
function assertInInjectionContext(debugFn) {
  if (!isInInjectionContext()) {
    throw new RuntimeError(-203, ngDevMode && debugFn.name + "() can only be used within an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`");
  }
}
__name(assertInInjectionContext, "assertInInjectionContext");
var HOST = 0;
var TVIEW = 1;
var FLAGS = 2;
var PARENT = 3;
var NEXT = 4;
var T_HOST = 5;
var HYDRATION = 6;
var CLEANUP = 7;
var CONTEXT = 8;
var INJECTOR = 9;
var ENVIRONMENT = 10;
var RENDERER = 11;
var CHILD_HEAD = 12;
var CHILD_TAIL = 13;
var DECLARATION_VIEW = 14;
var DECLARATION_COMPONENT_VIEW = 15;
var DECLARATION_LCONTAINER = 16;
var PREORDER_HOOK_FLAGS = 17;
var QUERIES = 18;
var ID = 19;
var EMBEDDED_VIEW_INJECTOR = 20;
var ON_DESTROY_HOOKS = 21;
var EFFECTS_TO_SCHEDULE = 22;
var EFFECTS = 23;
var REACTIVE_TEMPLATE_CONSUMER = 24;
var AFTER_RENDER_SEQUENCES_TO_ADD = 25;
var HEADER_OFFSET = 26;
var TYPE = 1;
var DEHYDRATED_VIEWS = 6;
var NATIVE = 7;
var VIEW_REFS = 8;
var MOVED_VIEWS = 9;
var CONTAINER_HEADER_OFFSET = 10;
function isLView(value) {
  return Array.isArray(value) && typeof value[TYPE] === "object";
}
__name(isLView, "isLView");
function isLContainer(value) {
  return Array.isArray(value) && value[TYPE] === true;
}
__name(isLContainer, "isLContainer");
function isContentQueryHost(tNode) {
  return (tNode.flags & 4) !== 0;
}
__name(isContentQueryHost, "isContentQueryHost");
function isComponentHost(tNode) {
  return tNode.componentOffset > -1;
}
__name(isComponentHost, "isComponentHost");
function isDirectiveHost(tNode) {
  return (tNode.flags & 1) === 1;
}
__name(isDirectiveHost, "isDirectiveHost");
function isComponentDef(def) {
  return !!def.template;
}
__name(isComponentDef, "isComponentDef");
function isRootView(target) {
  return (target[FLAGS] & 512) !== 0;
}
__name(isRootView, "isRootView");
function isProjectionTNode(tNode) {
  return (tNode.type & 16) === 16;
}
__name(isProjectionTNode, "isProjectionTNode");
function hasI18n(lView) {
  return (lView[FLAGS] & 32) === 32;
}
__name(hasI18n, "hasI18n");
function isDestroyed(lView) {
  return (lView[FLAGS] & 256) === 256;
}
__name(isDestroyed, "isDestroyed");
function assertTNodeForLView(tNode, lView) {
  assertTNodeForTView(tNode, lView[TVIEW]);
}
__name(assertTNodeForLView, "assertTNodeForLView");
function assertTNodeCreationIndex(lView, index) {
  const adjustedIndex = index + HEADER_OFFSET;
  assertIndexInRange(lView, adjustedIndex);
  assertLessThan(adjustedIndex, lView[TVIEW].bindingStartIndex, "TNodes should be created before any bindings");
}
__name(assertTNodeCreationIndex, "assertTNodeCreationIndex");
function assertTNodeForTView(tNode, tView) {
  assertTNode(tNode);
  const tData = tView.data;
  for (let i = HEADER_OFFSET; i < tData.length; i++) {
    if (tData[i] === tNode) {
      return;
    }
  }
  throwError("This TNode does not belong to this TView.");
}
__name(assertTNodeForTView, "assertTNodeForTView");
function assertTNode(tNode) {
  assertDefined(tNode, "TNode must be defined");
  if (!(tNode && typeof tNode === "object" && tNode.hasOwnProperty("directiveStylingLast"))) {
    throwError("Not of type TNode, got: " + tNode);
  }
}
__name(assertTNode, "assertTNode");
function assertTIcu(tIcu) {
  assertDefined(tIcu, "Expected TIcu to be defined");
  if (!(typeof tIcu.currentCaseLViewIndex === "number")) {
    throwError("Object is not of TIcu type.");
  }
}
__name(assertTIcu, "assertTIcu");
function assertComponentType(actual, msg = "Type passed in is not ComponentType, it does not have 'ɵcmp' property.") {
  if (!getComponentDef(actual)) {
    throwError(msg);
  }
}
__name(assertComponentType, "assertComponentType");
function assertNgModuleType(actual, msg = "Type passed in is not NgModuleType, it does not have 'ɵmod' property.") {
  if (!getNgModuleDef(actual)) {
    throwError(msg);
  }
}
__name(assertNgModuleType, "assertNgModuleType");
function assertHasParent(tNode) {
  assertDefined(tNode, "currentTNode should exist!");
  assertDefined(tNode.parent, "currentTNode should have a parent");
}
__name(assertHasParent, "assertHasParent");
function assertLContainer(value) {
  assertDefined(value, "LContainer must be defined");
  assertEqual(isLContainer(value), true, "Expecting LContainer");
}
__name(assertLContainer, "assertLContainer");
function assertLViewOrUndefined(value) {
  value && assertEqual(isLView(value), true, "Expecting LView or undefined or null");
}
__name(assertLViewOrUndefined, "assertLViewOrUndefined");
function assertLView(value) {
  assertDefined(value, "LView must be defined");
  assertEqual(isLView(value), true, "Expecting LView");
}
__name(assertLView, "assertLView");
function assertFirstCreatePass(tView, errMessage) {
  assertEqual(tView.firstCreatePass, true, errMessage || "Should only be called in first create pass.");
}
__name(assertFirstCreatePass, "assertFirstCreatePass");
function assertFirstUpdatePass(tView, errMessage) {
  assertEqual(tView.firstUpdatePass, true, "Should only be called in first update pass.");
}
__name(assertFirstUpdatePass, "assertFirstUpdatePass");
function assertDirectiveDef(obj) {
  if (obj.type === void 0 || obj.selectors == void 0 || obj.inputs === void 0) {
    throwError(`Expected a DirectiveDef/ComponentDef and this object does not seem to have the expected shape.`);
  }
}
__name(assertDirectiveDef, "assertDirectiveDef");
function assertIndexInDeclRange(tView, index) {
  assertBetween(HEADER_OFFSET, tView.bindingStartIndex, index);
}
__name(assertIndexInDeclRange, "assertIndexInDeclRange");
function assertIndexInExpandoRange(lView, index) {
  const tView = lView[1];
  assertBetween(tView.expandoStartIndex, lView.length, index);
}
__name(assertIndexInExpandoRange, "assertIndexInExpandoRange");
function assertBetween(lower, upper, index) {
  if (!(lower <= index && index < upper)) {
    throwError(`Index out of range (expecting ${lower} <= ${index} < ${upper})`);
  }
}
__name(assertBetween, "assertBetween");
function assertProjectionSlots(lView, errMessage) {
  assertDefined(lView[DECLARATION_COMPONENT_VIEW], "Component views should exist.");
  assertDefined(lView[DECLARATION_COMPONENT_VIEW][T_HOST].projection, "Components with projection nodes (<ng-content>) must have projection slots defined.");
}
__name(assertProjectionSlots, "assertProjectionSlots");
function assertParentView(lView, errMessage) {
  assertDefined(lView, "Component views should always have a parent view (component's host view)");
}
__name(assertParentView, "assertParentView");
function assertNodeInjector(lView, injectorIndex) {
  assertIndexInExpandoRange(lView, injectorIndex);
  assertIndexInExpandoRange(
    lView,
    injectorIndex + 8
    /* NodeInjectorOffset.PARENT */
  );
  assertNumber(lView[injectorIndex + 0], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 1], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 2], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 3], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 4], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 5], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 6], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 7], "injectorIndex should point to a bloom filter");
  assertNumber(lView[
    injectorIndex + 8
    /* NodeInjectorOffset.PARENT */
  ], "injectorIndex should point to parent injector");
}
__name(assertNodeInjector, "assertNodeInjector");
var SVG_NAMESPACE = "svg";
var MATH_ML_NAMESPACE = "math";
function unwrapRNode(value) {
  while (Array.isArray(value)) {
    value = value[HOST];
  }
  return value;
}
__name(unwrapRNode, "unwrapRNode");
function unwrapLView(value) {
  while (Array.isArray(value)) {
    if (typeof value[TYPE] === "object")
      return value;
    value = value[HOST];
  }
  return null;
}
__name(unwrapLView, "unwrapLView");
function getNativeByIndex(index, lView) {
  ngDevMode && assertIndexInRange(lView, index);
  ngDevMode && assertGreaterThanOrEqual(index, HEADER_OFFSET, "Expected to be past HEADER_OFFSET");
  return unwrapRNode(lView[index]);
}
__name(getNativeByIndex, "getNativeByIndex");
function getNativeByTNode(tNode, lView) {
  ngDevMode && assertTNodeForLView(tNode, lView);
  ngDevMode && assertIndexInRange(lView, tNode.index);
  const node = unwrapRNode(lView[tNode.index]);
  return node;
}
__name(getNativeByTNode, "getNativeByTNode");
function getNativeByTNodeOrNull(tNode, lView) {
  const index = tNode === null ? -1 : tNode.index;
  if (index !== -1) {
    ngDevMode && assertTNodeForLView(tNode, lView);
    const node = unwrapRNode(lView[index]);
    return node;
  }
  return null;
}
__name(getNativeByTNodeOrNull, "getNativeByTNodeOrNull");
function getTNode(tView, index) {
  ngDevMode && assertGreaterThan(index, -1, "wrong index for TNode");
  ngDevMode && assertLessThan(index, tView.data.length, "wrong index for TNode");
  const tNode = tView.data[index];
  ngDevMode && tNode !== null && assertTNode(tNode);
  return tNode;
}
__name(getTNode, "getTNode");
function load(view, index) {
  ngDevMode && assertIndexInRange(view, index);
  return view[index];
}
__name(load, "load");
function store(tView, lView, index, value) {
  if (index >= tView.data.length) {
    tView.data[index] = null;
    tView.blueprint[index] = null;
  }
  lView[index] = value;
}
__name(store, "store");
function getComponentLViewByIndex(nodeIndex, hostView) {
  ngDevMode && assertIndexInRange(hostView, nodeIndex);
  const slotValue = hostView[nodeIndex];
  const lView = isLView(slotValue) ? slotValue : slotValue[HOST];
  return lView;
}
__name(getComponentLViewByIndex, "getComponentLViewByIndex");
function isCreationMode(view) {
  return (view[FLAGS] & 4) === 4;
}
__name(isCreationMode, "isCreationMode");
function viewAttachedToChangeDetector(view) {
  return (view[FLAGS] & 128) === 128;
}
__name(viewAttachedToChangeDetector, "viewAttachedToChangeDetector");
function viewAttachedToContainer(view) {
  return isLContainer(view[PARENT]);
}
__name(viewAttachedToContainer, "viewAttachedToContainer");
function getConstant(consts, index) {
  if (index === null || index === void 0)
    return null;
  ngDevMode && assertIndexInRange(consts, index);
  return consts[index];
}
__name(getConstant, "getConstant");
function resetPreOrderHookFlags(lView) {
  lView[PREORDER_HOOK_FLAGS] = 0;
}
__name(resetPreOrderHookFlags, "resetPreOrderHookFlags");
function markViewForRefresh(lView) {
  if (lView[FLAGS] & 1024) {
    return;
  }
  lView[FLAGS] |= 1024;
  if (viewAttachedToChangeDetector(lView)) {
    markAncestorsForTraversal(lView);
  }
}
__name(markViewForRefresh, "markViewForRefresh");
function walkUpViews(nestingLevel, currentView) {
  while (nestingLevel > 0) {
    ngDevMode && assertDefined(currentView[DECLARATION_VIEW], "Declaration view should be defined if nesting level is greater than 0.");
    currentView = currentView[DECLARATION_VIEW];
    nestingLevel--;
  }
  return currentView;
}
__name(walkUpViews, "walkUpViews");
function requiresRefreshOrTraversal(lView) {
  return !!(lView[FLAGS] & (1024 | 8192) || lView[REACTIVE_TEMPLATE_CONSUMER]?.dirty);
}
__name(requiresRefreshOrTraversal, "requiresRefreshOrTraversal");
function updateAncestorTraversalFlagsOnAttach(lView) {
  lView[ENVIRONMENT].changeDetectionScheduler?.notify(
    8
    /* NotificationSource.ViewAttached */
  );
  if (lView[FLAGS] & 64) {
    lView[FLAGS] |= 1024;
  }
  if (requiresRefreshOrTraversal(lView)) {
    markAncestorsForTraversal(lView);
  }
}
__name(updateAncestorTraversalFlagsOnAttach, "updateAncestorTraversalFlagsOnAttach");
function markAncestorsForTraversal(lView) {
  lView[ENVIRONMENT].changeDetectionScheduler?.notify(
    0
    /* NotificationSource.MarkAncestorsForTraversal */
  );
  let parent = getLViewParent(lView);
  while (parent !== null) {
    if (parent[FLAGS] & 8192) {
      break;
    }
    parent[FLAGS] |= 8192;
    if (!viewAttachedToChangeDetector(parent)) {
      break;
    }
    parent = getLViewParent(parent);
  }
}
__name(markAncestorsForTraversal, "markAncestorsForTraversal");
function storeLViewOnDestroy(lView, onDestroyCallback) {
  if (isDestroyed(lView)) {
    throw new RuntimeError(911, ngDevMode && "View has already been destroyed.");
  }
  if (lView[ON_DESTROY_HOOKS] === null) {
    lView[ON_DESTROY_HOOKS] = [];
  }
  lView[ON_DESTROY_HOOKS].push(onDestroyCallback);
}
__name(storeLViewOnDestroy, "storeLViewOnDestroy");
function removeLViewOnDestroy(lView, onDestroyCallback) {
  if (lView[ON_DESTROY_HOOKS] === null)
    return;
  const destroyCBIdx = lView[ON_DESTROY_HOOKS].indexOf(onDestroyCallback);
  if (destroyCBIdx !== -1) {
    lView[ON_DESTROY_HOOKS].splice(destroyCBIdx, 1);
  }
}
__name(removeLViewOnDestroy, "removeLViewOnDestroy");
function getLViewParent(lView) {
  ngDevMode && assertLView(lView);
  const parent = lView[PARENT];
  return isLContainer(parent) ? parent[PARENT] : parent;
}
__name(getLViewParent, "getLViewParent");
function getOrCreateLViewCleanup(view) {
  return view[CLEANUP] ??= [];
}
__name(getOrCreateLViewCleanup, "getOrCreateLViewCleanup");
function getOrCreateTViewCleanup(tView) {
  return tView.cleanup ??= [];
}
__name(getOrCreateTViewCleanup, "getOrCreateTViewCleanup");
function storeCleanupWithContext(tView, lView, context, cleanupFn) {
  const lCleanup = getOrCreateLViewCleanup(lView);
  ngDevMode && assertDefined(context, "Cleanup context is mandatory when registering framework-level destroy hooks");
  lCleanup.push(context);
  if (tView.firstCreatePass) {
    getOrCreateTViewCleanup(tView).push(cleanupFn, lCleanup.length - 1);
  } else {
    if (ngDevMode) {
      Object.freeze(getOrCreateTViewCleanup(tView));
    }
  }
}
__name(storeCleanupWithContext, "storeCleanupWithContext");
var instructionState = {
  lFrame: createLFrame(null),
  bindingsEnabled: true,
  skipHydrationRootTNode: null
};
var CheckNoChangesMode;
(function(CheckNoChangesMode2) {
  CheckNoChangesMode2[CheckNoChangesMode2["Off"] = 0] = "Off";
  CheckNoChangesMode2[CheckNoChangesMode2["Exhaustive"] = 1] = "Exhaustive";
  CheckNoChangesMode2[CheckNoChangesMode2["OnlyDirtyViews"] = 2] = "OnlyDirtyViews";
})(CheckNoChangesMode || (CheckNoChangesMode = {}));
var _checkNoChangesMode = 0;
var _isRefreshingViews = false;
function getElementDepthCount() {
  return instructionState.lFrame.elementDepthCount;
}
__name(getElementDepthCount, "getElementDepthCount");
function increaseElementDepthCount() {
  instructionState.lFrame.elementDepthCount++;
}
__name(increaseElementDepthCount, "increaseElementDepthCount");
function decreaseElementDepthCount() {
  instructionState.lFrame.elementDepthCount--;
}
__name(decreaseElementDepthCount, "decreaseElementDepthCount");
function getBindingsEnabled() {
  return instructionState.bindingsEnabled;
}
__name(getBindingsEnabled, "getBindingsEnabled");
function isInSkipHydrationBlock() {
  return instructionState.skipHydrationRootTNode !== null;
}
__name(isInSkipHydrationBlock, "isInSkipHydrationBlock");
function isSkipHydrationRootTNode(tNode) {
  return instructionState.skipHydrationRootTNode === tNode;
}
__name(isSkipHydrationRootTNode, "isSkipHydrationRootTNode");
function ɵɵenableBindings() {
  instructionState.bindingsEnabled = true;
}
__name(ɵɵenableBindings, "ɵɵenableBindings");
function enterSkipHydrationBlock(tNode) {
  instructionState.skipHydrationRootTNode = tNode;
}
__name(enterSkipHydrationBlock, "enterSkipHydrationBlock");
function ɵɵdisableBindings() {
  instructionState.bindingsEnabled = false;
}
__name(ɵɵdisableBindings, "ɵɵdisableBindings");
function leaveSkipHydrationBlock() {
  instructionState.skipHydrationRootTNode = null;
}
__name(leaveSkipHydrationBlock, "leaveSkipHydrationBlock");
function getLView() {
  return instructionState.lFrame.lView;
}
__name(getLView, "getLView");
function getTView() {
  return instructionState.lFrame.tView;
}
__name(getTView, "getTView");
function ɵɵrestoreView(viewToRestore) {
  instructionState.lFrame.contextLView = viewToRestore;
  return viewToRestore[CONTEXT];
}
__name(ɵɵrestoreView, "ɵɵrestoreView");
function ɵɵresetView(value) {
  instructionState.lFrame.contextLView = null;
  return value;
}
__name(ɵɵresetView, "ɵɵresetView");
function getCurrentTNode() {
  let currentTNode = getCurrentTNodePlaceholderOk();
  while (currentTNode !== null && currentTNode.type === 64) {
    currentTNode = currentTNode.parent;
  }
  return currentTNode;
}
__name(getCurrentTNode, "getCurrentTNode");
function getCurrentTNodePlaceholderOk() {
  return instructionState.lFrame.currentTNode;
}
__name(getCurrentTNodePlaceholderOk, "getCurrentTNodePlaceholderOk");
function getCurrentParentTNode() {
  const lFrame = instructionState.lFrame;
  const currentTNode = lFrame.currentTNode;
  return lFrame.isParent ? currentTNode : currentTNode.parent;
}
__name(getCurrentParentTNode, "getCurrentParentTNode");
function setCurrentTNode(tNode, isParent) {
  ngDevMode && tNode && assertTNodeForTView(tNode, instructionState.lFrame.tView);
  const lFrame = instructionState.lFrame;
  lFrame.currentTNode = tNode;
  lFrame.isParent = isParent;
}
__name(setCurrentTNode, "setCurrentTNode");
function isCurrentTNodeParent() {
  return instructionState.lFrame.isParent;
}
__name(isCurrentTNodeParent, "isCurrentTNodeParent");
function setCurrentTNodeAsNotParent() {
  instructionState.lFrame.isParent = false;
}
__name(setCurrentTNodeAsNotParent, "setCurrentTNodeAsNotParent");
function getContextLView() {
  const contextLView = instructionState.lFrame.contextLView;
  ngDevMode && assertDefined(contextLView, "contextLView must be defined.");
  return contextLView;
}
__name(getContextLView, "getContextLView");
function isInCheckNoChangesMode() {
  !ngDevMode && throwError("Must never be called in production mode");
  return _checkNoChangesMode !== CheckNoChangesMode.Off;
}
__name(isInCheckNoChangesMode, "isInCheckNoChangesMode");
function isExhaustiveCheckNoChanges() {
  !ngDevMode && throwError("Must never be called in production mode");
  return _checkNoChangesMode === CheckNoChangesMode.Exhaustive;
}
__name(isExhaustiveCheckNoChanges, "isExhaustiveCheckNoChanges");
function setIsInCheckNoChangesMode(mode) {
  !ngDevMode && throwError("Must never be called in production mode");
  _checkNoChangesMode = mode;
}
__name(setIsInCheckNoChangesMode, "setIsInCheckNoChangesMode");
function isRefreshingViews() {
  return _isRefreshingViews;
}
__name(isRefreshingViews, "isRefreshingViews");
function setIsRefreshingViews(mode) {
  const prev = _isRefreshingViews;
  _isRefreshingViews = mode;
  return prev;
}
__name(setIsRefreshingViews, "setIsRefreshingViews");
function getBindingRoot() {
  const lFrame = instructionState.lFrame;
  let index = lFrame.bindingRootIndex;
  if (index === -1) {
    index = lFrame.bindingRootIndex = lFrame.tView.bindingStartIndex;
  }
  return index;
}
__name(getBindingRoot, "getBindingRoot");
function getBindingIndex() {
  return instructionState.lFrame.bindingIndex;
}
__name(getBindingIndex, "getBindingIndex");
function setBindingIndex(value) {
  return instructionState.lFrame.bindingIndex = value;
}
__name(setBindingIndex, "setBindingIndex");
function nextBindingIndex() {
  return instructionState.lFrame.bindingIndex++;
}
__name(nextBindingIndex, "nextBindingIndex");
function incrementBindingIndex(count) {
  const lFrame = instructionState.lFrame;
  const index = lFrame.bindingIndex;
  lFrame.bindingIndex = lFrame.bindingIndex + count;
  return index;
}
__name(incrementBindingIndex, "incrementBindingIndex");
function isInI18nBlock() {
  return instructionState.lFrame.inI18n;
}
__name(isInI18nBlock, "isInI18nBlock");
function setInI18nBlock(isInI18nBlock2) {
  instructionState.lFrame.inI18n = isInI18nBlock2;
}
__name(setInI18nBlock, "setInI18nBlock");
function setBindingRootForHostBindings(bindingRootIndex, currentDirectiveIndex) {
  const lFrame = instructionState.lFrame;
  lFrame.bindingIndex = lFrame.bindingRootIndex = bindingRootIndex;
  setCurrentDirectiveIndex(currentDirectiveIndex);
}
__name(setBindingRootForHostBindings, "setBindingRootForHostBindings");
function getCurrentDirectiveIndex() {
  return instructionState.lFrame.currentDirectiveIndex;
}
__name(getCurrentDirectiveIndex, "getCurrentDirectiveIndex");
function setCurrentDirectiveIndex(currentDirectiveIndex) {
  instructionState.lFrame.currentDirectiveIndex = currentDirectiveIndex;
}
__name(setCurrentDirectiveIndex, "setCurrentDirectiveIndex");
function getCurrentDirectiveDef(tData) {
  const currentDirectiveIndex = instructionState.lFrame.currentDirectiveIndex;
  return currentDirectiveIndex === -1 ? null : tData[currentDirectiveIndex];
}
__name(getCurrentDirectiveDef, "getCurrentDirectiveDef");
function getCurrentQueryIndex() {
  return instructionState.lFrame.currentQueryIndex;
}
__name(getCurrentQueryIndex, "getCurrentQueryIndex");
function setCurrentQueryIndex(value) {
  instructionState.lFrame.currentQueryIndex = value;
}
__name(setCurrentQueryIndex, "setCurrentQueryIndex");
function getDeclarationTNode(lView) {
  const tView = lView[TVIEW];
  if (tView.type === 2) {
    ngDevMode && assertDefined(tView.declTNode, "Embedded TNodes should have declaration parents.");
    return tView.declTNode;
  }
  if (tView.type === 1) {
    return lView[T_HOST];
  }
  return null;
}
__name(getDeclarationTNode, "getDeclarationTNode");
function enterDI(lView, tNode, flags) {
  ngDevMode && assertLViewOrUndefined(lView);
  if (flags & 4) {
    ngDevMode && assertTNodeForTView(tNode, lView[TVIEW]);
    let parentTNode = tNode;
    let parentLView = lView;
    while (true) {
      ngDevMode && assertDefined(parentTNode, "Parent TNode should be defined");
      parentTNode = parentTNode.parent;
      if (parentTNode === null && !(flags & 1)) {
        parentTNode = getDeclarationTNode(parentLView);
        if (parentTNode === null)
          break;
        ngDevMode && assertDefined(parentLView, "Parent LView should be defined");
        parentLView = parentLView[DECLARATION_VIEW];
        if (parentTNode.type & (2 | 8)) {
          break;
        }
      } else {
        break;
      }
    }
    if (parentTNode === null) {
      return false;
    } else {
      tNode = parentTNode;
      lView = parentLView;
    }
  }
  ngDevMode && assertTNodeForLView(tNode, lView);
  const lFrame = instructionState.lFrame = allocLFrame();
  lFrame.currentTNode = tNode;
  lFrame.lView = lView;
  return true;
}
__name(enterDI, "enterDI");
function enterView(newView) {
  ngDevMode && assertNotEqual(newView[0], newView[1], "????");
  ngDevMode && assertLViewOrUndefined(newView);
  const newLFrame = allocLFrame();
  if (ngDevMode) {
    assertEqual(newLFrame.isParent, true, "Expected clean LFrame");
    assertEqual(newLFrame.lView, null, "Expected clean LFrame");
    assertEqual(newLFrame.tView, null, "Expected clean LFrame");
    assertEqual(newLFrame.selectedIndex, -1, "Expected clean LFrame");
    assertEqual(newLFrame.elementDepthCount, 0, "Expected clean LFrame");
    assertEqual(newLFrame.currentDirectiveIndex, -1, "Expected clean LFrame");
    assertEqual(newLFrame.currentNamespace, null, "Expected clean LFrame");
    assertEqual(newLFrame.bindingRootIndex, -1, "Expected clean LFrame");
    assertEqual(newLFrame.currentQueryIndex, 0, "Expected clean LFrame");
  }
  const tView = newView[TVIEW];
  instructionState.lFrame = newLFrame;
  ngDevMode && tView.firstChild && assertTNodeForTView(tView.firstChild, tView);
  newLFrame.currentTNode = tView.firstChild;
  newLFrame.lView = newView;
  newLFrame.tView = tView;
  newLFrame.contextLView = newView;
  newLFrame.bindingIndex = tView.bindingStartIndex;
  newLFrame.inI18n = false;
}
__name(enterView, "enterView");
function allocLFrame() {
  const currentLFrame = instructionState.lFrame;
  const childLFrame = currentLFrame === null ? null : currentLFrame.child;
  const newLFrame = childLFrame === null ? createLFrame(currentLFrame) : childLFrame;
  return newLFrame;
}
__name(allocLFrame, "allocLFrame");
function createLFrame(parent) {
  const lFrame = {
    currentTNode: null,
    isParent: true,
    lView: null,
    tView: null,
    selectedIndex: -1,
    contextLView: null,
    elementDepthCount: 0,
    currentNamespace: null,
    currentDirectiveIndex: -1,
    bindingRootIndex: -1,
    bindingIndex: -1,
    currentQueryIndex: 0,
    parent,
    child: null,
    inI18n: false
  };
  parent !== null && (parent.child = lFrame);
  return lFrame;
}
__name(createLFrame, "createLFrame");
function leaveViewLight() {
  const oldLFrame = instructionState.lFrame;
  instructionState.lFrame = oldLFrame.parent;
  oldLFrame.currentTNode = null;
  oldLFrame.lView = null;
  return oldLFrame;
}
__name(leaveViewLight, "leaveViewLight");
var leaveDI = leaveViewLight;
function leaveView() {
  const oldLFrame = leaveViewLight();
  oldLFrame.isParent = true;
  oldLFrame.tView = null;
  oldLFrame.selectedIndex = -1;
  oldLFrame.contextLView = null;
  oldLFrame.elementDepthCount = 0;
  oldLFrame.currentDirectiveIndex = -1;
  oldLFrame.currentNamespace = null;
  oldLFrame.bindingRootIndex = -1;
  oldLFrame.bindingIndex = -1;
  oldLFrame.currentQueryIndex = 0;
}
__name(leaveView, "leaveView");
function nextContextImpl(level) {
  const contextLView = instructionState.lFrame.contextLView = walkUpViews(level, instructionState.lFrame.contextLView);
  return contextLView[CONTEXT];
}
__name(nextContextImpl, "nextContextImpl");
function getSelectedIndex() {
  return instructionState.lFrame.selectedIndex;
}
__name(getSelectedIndex, "getSelectedIndex");
function setSelectedIndex(index) {
  ngDevMode && index !== -1 && assertGreaterThanOrEqual(index, HEADER_OFFSET, "Index must be past HEADER_OFFSET (or -1).");
  ngDevMode && assertLessThan(index, instructionState.lFrame.lView.length, "Can't set index passed end of LView");
  instructionState.lFrame.selectedIndex = index;
}
__name(setSelectedIndex, "setSelectedIndex");
function getSelectedTNode() {
  const lFrame = instructionState.lFrame;
  return getTNode(lFrame.tView, lFrame.selectedIndex);
}
__name(getSelectedTNode, "getSelectedTNode");
function ɵɵnamespaceSVG() {
  instructionState.lFrame.currentNamespace = SVG_NAMESPACE;
}
__name(ɵɵnamespaceSVG, "ɵɵnamespaceSVG");
function ɵɵnamespaceMathML() {
  instructionState.lFrame.currentNamespace = MATH_ML_NAMESPACE;
}
__name(ɵɵnamespaceMathML, "ɵɵnamespaceMathML");
function ɵɵnamespaceHTML() {
  namespaceHTMLInternal();
}
__name(ɵɵnamespaceHTML, "ɵɵnamespaceHTML");
function namespaceHTMLInternal() {
  instructionState.lFrame.currentNamespace = null;
}
__name(namespaceHTMLInternal, "namespaceHTMLInternal");
function getNamespace() {
  return instructionState.lFrame.currentNamespace;
}
__name(getNamespace, "getNamespace");
var _wasLastNodeCreated = true;
function wasLastNodeCreated() {
  return _wasLastNodeCreated;
}
__name(wasLastNodeCreated, "wasLastNodeCreated");
function lastNodeWasCreated(flag) {
  _wasLastNodeCreated = flag;
}
__name(lastNodeWasCreated, "lastNodeWasCreated");
var registry = { elements: void 0 };
function setAnimationElementRemovalRegistry(value) {
  if (registry.elements === void 0) {
    registry.elements = value;
  }
}
__name(setAnimationElementRemovalRegistry, "setAnimationElementRemovalRegistry");
function getAnimationElementRemovalRegistry() {
  return registry;
}
__name(getAnimationElementRemovalRegistry, "getAnimationElementRemovalRegistry");
function createInjector(defType, parent = null, additionalProviders = null, name) {
  const injector = createInjectorWithoutInjectorInstances(defType, parent, additionalProviders, name);
  injector.resolveInjectorInitializers();
  return injector;
}
__name(createInjector, "createInjector");
function createInjectorWithoutInjectorInstances(defType, parent = null, additionalProviders = null, name, scopes = /* @__PURE__ */ new Set()) {
  const providers = [additionalProviders || EMPTY_ARRAY, importProvidersFrom(defType)];
  name = name || (typeof defType === "object" ? void 0 : stringify(defType));
  return new R3Injector(providers, parent || getNullInjector(), name || null, scopes);
}
__name(createInjectorWithoutInjectorInstances, "createInjectorWithoutInjectorInstances");
var _Injector = class _Injector {
  static create(options, parent) {
    if (Array.isArray(options)) {
      return createInjector({ name: "" }, parent, options, "");
    } else {
      const name = options.name ?? "";
      return createInjector({ name }, options.parent, options.providers, name);
    }
  }
};
__name(_Injector, "Injector");
__publicField(_Injector, "THROW_IF_NOT_FOUND", THROW_IF_NOT_FOUND);
__publicField(_Injector, "NULL", new NullInjector());
/** @nocollapse */
__publicField(
  _Injector,
  "ɵprov",
  /** @pureOrBreakMyCode */
  ɵɵdefineInjectable({
    token: _Injector,
    providedIn: "any",
    factory: /* @__PURE__ */ __name(() => ɵɵinject(INJECTOR$1), "factory")
  })
);
/**
 * @internal
 * @nocollapse
 */
__publicField(_Injector, "__NG_ELEMENT_ID__", -1);
var Injector = _Injector;
var DOCUMENT = new InjectionToken(ngDevMode ? "DocumentToken" : "");
var _DestroyRef = class _DestroyRef {
};
__name(_DestroyRef, "DestroyRef");
/**
 * @internal
 * @nocollapse
 */
__publicField(_DestroyRef, "__NG_ELEMENT_ID__", injectDestroyRef);
/**
 * @internal
 * @nocollapse
 */
__publicField(_DestroyRef, "__NG_ENV_ID__", /* @__PURE__ */ __name((injector) => injector, "__NG_ENV_ID__"));
var DestroyRef = _DestroyRef;
var _NodeInjectorDestroyRef = class _NodeInjectorDestroyRef extends DestroyRef {
  _lView;
  constructor(_lView) {
    super();
    this._lView = _lView;
  }
  get destroyed() {
    return isDestroyed(this._lView);
  }
  onDestroy(callback) {
    const lView = this._lView;
    storeLViewOnDestroy(lView, callback);
    return () => removeLViewOnDestroy(lView, callback);
  }
};
__name(_NodeInjectorDestroyRef, "NodeInjectorDestroyRef");
var NodeInjectorDestroyRef = _NodeInjectorDestroyRef;
function injectDestroyRef() {
  return new NodeInjectorDestroyRef(getLView());
}
__name(injectDestroyRef, "injectDestroyRef");
var _ErrorHandler = class _ErrorHandler {
  /**
   * @internal
   */
  _console = console;
  handleError(error) {
    this._console.error("ERROR", error);
  }
};
__name(_ErrorHandler, "ErrorHandler");
var ErrorHandler = _ErrorHandler;
var INTERNAL_APPLICATION_ERROR_HANDLER = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "internal error handler" : "", {
  providedIn: "root",
  factory: /* @__PURE__ */ __name(() => {
    const injector = inject2(EnvironmentInjector);
    let userErrorHandler;
    return (e) => {
      if (injector.destroyed && !userErrorHandler) {
        setTimeout(() => {
          throw e;
        });
      } else {
        userErrorHandler ??= injector.get(ErrorHandler);
        userErrorHandler.handleError(e);
      }
    };
  }, "factory")
});
var errorHandlerEnvironmentInitializer = {
  provide: ENVIRONMENT_INITIALIZER,
  useValue: /* @__PURE__ */ __name(() => void inject2(ErrorHandler), "useValue"),
  multi: true
};
var globalErrorListeners = new InjectionToken(ngDevMode ? "GlobalErrorListeners" : "", {
  providedIn: "root",
  factory: /* @__PURE__ */ __name(() => {
    if (false) {
      return;
    }
    const window = inject2(DOCUMENT).defaultView;
    if (!window) {
      return;
    }
    const errorHandler = inject2(INTERNAL_APPLICATION_ERROR_HANDLER);
    const rejectionListener = /* @__PURE__ */ __name((e) => {
      errorHandler(e.reason);
      e.preventDefault();
    }, "rejectionListener");
    const errorListener = /* @__PURE__ */ __name((e) => {
      if (e.error) {
        errorHandler(e.error);
      } else {
        errorHandler(new Error(ngDevMode ? `An ErrorEvent with no error occurred. See Error.cause for details: ${e.message}` : e.message, { cause: e }));
      }
      e.preventDefault();
    }, "errorListener");
    const setupEventListeners = /* @__PURE__ */ __name(() => {
      window.addEventListener("unhandledrejection", rejectionListener);
      window.addEventListener("error", errorListener);
    }, "setupEventListeners");
    if (typeof Zone !== "undefined") {
      Zone.root.run(setupEventListeners);
    } else {
      setupEventListeners();
    }
    inject2(DestroyRef).onDestroy(() => {
      window.removeEventListener("error", errorListener);
      window.removeEventListener("unhandledrejection", rejectionListener);
    });
  }, "factory")
});
function provideBrowserGlobalErrorListeners() {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => void inject2(globalErrorListeners))
  ]);
}
__name(provideBrowserGlobalErrorListeners, "provideBrowserGlobalErrorListeners");
function isSignal(value) {
  return typeof value === "function" && value[SIGNAL] !== void 0;
}
__name(isSignal, "isSignal");
function ɵunwrapWritableSignal(value) {
  return null;
}
__name(ɵunwrapWritableSignal, "ɵunwrapWritableSignal");
function signal(initialValue, options) {
  const [get, set, update] = createSignal(initialValue, options?.equal);
  const signalFn = get;
  const node = signalFn[SIGNAL];
  signalFn.set = set;
  signalFn.update = update;
  signalFn.asReadonly = signalAsReadonlyFn.bind(signalFn);
  if (ngDevMode) {
    signalFn.toString = () => `[Signal: ${signalFn()}]`;
    node.debugName = options?.debugName;
  }
  return signalFn;
}
__name(signal, "signal");
function signalAsReadonlyFn() {
  const node = this[SIGNAL];
  if (node.readonlyFn === void 0) {
    const readonlyFn = /* @__PURE__ */ __name(() => this(), "readonlyFn");
    readonlyFn[SIGNAL] = node;
    node.readonlyFn = readonlyFn;
  }
  return node.readonlyFn;
}
__name(signalAsReadonlyFn, "signalAsReadonlyFn");
function isWritableSignal(value) {
  return isSignal(value) && typeof value.set === "function";
}
__name(isWritableSignal, "isWritableSignal");
var _ChangeDetectionScheduler = class _ChangeDetectionScheduler {
};
__name(_ChangeDetectionScheduler, "ChangeDetectionScheduler");
var ChangeDetectionScheduler = _ChangeDetectionScheduler;
var ZONELESS_ENABLED = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "Zoneless enabled" : "", { providedIn: "root", factory: /* @__PURE__ */ __name(() => false, "factory") });
var PROVIDED_ZONELESS = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "Zoneless provided" : "", { providedIn: "root", factory: /* @__PURE__ */ __name(() => false, "factory") });
var ZONELESS_SCHEDULER_DISABLED = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "scheduler disabled" : "");
var SCHEDULE_IN_ROOT_ZONE = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "run changes outside zone in root" : "");
function assertNotInReactiveContext(debugFn, extraContext) {
  if (getActiveConsumer() !== null) {
    throw new RuntimeError(-602, ngDevMode && `${debugFn.name}() cannot be called from within a reactive context.${extraContext ? ` ${extraContext}` : ""}`);
  }
}
__name(assertNotInReactiveContext, "assertNotInReactiveContext");
var _ViewContext = class _ViewContext {
  view;
  node;
  constructor(view, node) {
    this.view = view;
    this.node = node;
  }
};
__name(_ViewContext, "ViewContext");
/**
 * @internal
 * @nocollapse
 */
__publicField(_ViewContext, "__NG_ELEMENT_ID__", injectViewContext);
var ViewContext = _ViewContext;
function injectViewContext() {
  return new ViewContext(getLView(), getCurrentTNode());
}
__name(injectViewContext, "injectViewContext");
var _PendingTasksInternal = class _PendingTasksInternal {
  taskId = 0;
  pendingTasks = /* @__PURE__ */ new Set();
  destroyed = false;
  pendingTask = new BehaviorSubject(false);
  get hasPendingTasks() {
    return this.destroyed ? false : this.pendingTask.value;
  }
  /**
   * In case the service is about to be destroyed, return a self-completing observable.
   * Otherwise, return the observable that emits the current state of pending tasks.
   */
  get hasPendingTasksObservable() {
    if (this.destroyed) {
      return new Observable((subscriber) => {
        subscriber.next(false);
        subscriber.complete();
      });
    }
    return this.pendingTask;
  }
  add() {
    if (!this.hasPendingTasks && !this.destroyed) {
      this.pendingTask.next(true);
    }
    const taskId = this.taskId++;
    this.pendingTasks.add(taskId);
    return taskId;
  }
  has(taskId) {
    return this.pendingTasks.has(taskId);
  }
  remove(taskId) {
    this.pendingTasks.delete(taskId);
    if (this.pendingTasks.size === 0 && this.hasPendingTasks) {
      this.pendingTask.next(false);
    }
  }
  ngOnDestroy() {
    this.pendingTasks.clear();
    if (this.hasPendingTasks) {
      this.pendingTask.next(false);
    }
    this.destroyed = true;
    this.pendingTask.unsubscribe();
  }
};
__name(_PendingTasksInternal, "PendingTasksInternal");
/** @nocollapse */
__publicField(
  _PendingTasksInternal,
  "ɵprov",
  /** @pureOrBreakMyCode */
  ɵɵdefineInjectable({
    token: _PendingTasksInternal,
    providedIn: "root",
    factory: /* @__PURE__ */ __name(() => new _PendingTasksInternal(), "factory")
  })
);
var PendingTasksInternal = _PendingTasksInternal;
var _PendingTasks = class _PendingTasks {
  internalPendingTasks = inject2(PendingTasksInternal);
  scheduler = inject2(ChangeDetectionScheduler);
  errorHandler = inject2(INTERNAL_APPLICATION_ERROR_HANDLER);
  /**
   * Adds a new task that should block application's stability.
   * @returns A cleanup function that removes a task when called.
   */
  add() {
    const taskId = this.internalPendingTasks.add();
    return () => {
      if (!this.internalPendingTasks.has(taskId)) {
        return;
      }
      this.scheduler.notify(
        11
        /* NotificationSource.PendingTaskRemoved */
      );
      this.internalPendingTasks.remove(taskId);
    };
  }
  /**
   * Runs an asynchronous function and blocks the application's stability until the function completes.
   *
   * ```ts
   * pendingTasks.run(async () => {
   *   const userData = await fetch('/api/user');
   *   this.userData.set(userData);
   * });
   * ```
   *
   * @param fn The asynchronous function to execute
   * @developerPreview 19.0
   */
  run(fn) {
    const removeTask = this.add();
    fn().catch(this.errorHandler).finally(removeTask);
  }
};
__name(_PendingTasks, "PendingTasks");
/** @nocollapse */
__publicField(
  _PendingTasks,
  "ɵprov",
  /** @pureOrBreakMyCode */
  ɵɵdefineInjectable({
    token: _PendingTasks,
    providedIn: "root",
    factory: /* @__PURE__ */ __name(() => new _PendingTasks(), "factory")
  })
);
var PendingTasks = _PendingTasks;
function noop(...args) {
}
__name(noop, "noop");
var _EffectScheduler = class _EffectScheduler {
};
__name(_EffectScheduler, "EffectScheduler");
/** @nocollapse */
__publicField(
  _EffectScheduler,
  "ɵprov",
  /** @pureOrBreakMyCode */
  ɵɵdefineInjectable({
    token: _EffectScheduler,
    providedIn: "root",
    factory: /* @__PURE__ */ __name(() => new ZoneAwareEffectScheduler(), "factory")
  })
);
var EffectScheduler = _EffectScheduler;
var _ZoneAwareEffectScheduler = class _ZoneAwareEffectScheduler {
  dirtyEffectCount = 0;
  queues = /* @__PURE__ */ new Map();
  add(handle) {
    this.enqueue(handle);
    this.schedule(handle);
  }
  schedule(handle) {
    if (!handle.dirty) {
      return;
    }
    this.dirtyEffectCount++;
  }
  remove(handle) {
    const zone = handle.zone;
    const queue = this.queues.get(zone);
    if (!queue.has(handle)) {
      return;
    }
    queue.delete(handle);
    if (handle.dirty) {
      this.dirtyEffectCount--;
    }
  }
  enqueue(handle) {
    const zone = handle.zone;
    if (!this.queues.has(zone)) {
      this.queues.set(zone, /* @__PURE__ */ new Set());
    }
    const queue = this.queues.get(zone);
    if (queue.has(handle)) {
      return;
    }
    queue.add(handle);
  }
  /**
   * Run all scheduled effects.
   *
   * Execution order of effects within the same zone is guaranteed to be FIFO, but there is no
   * ordering guarantee between effects scheduled in different zones.
   */
  flush() {
    while (this.dirtyEffectCount > 0) {
      let ranOneEffect = false;
      for (const [zone, queue] of this.queues) {
        if (zone === null) {
          ranOneEffect ||= this.flushQueue(queue);
        } else {
          ranOneEffect ||= zone.run(() => this.flushQueue(queue));
        }
      }
      if (!ranOneEffect) {
        this.dirtyEffectCount = 0;
      }
    }
  }
  flushQueue(queue) {
    let ranOneEffect = false;
    for (const handle of queue) {
      if (!handle.dirty) {
        continue;
      }
      this.dirtyEffectCount--;
      ranOneEffect = true;
      handle.run();
    }
    return ranOneEffect;
  }
};
__name(_ZoneAwareEffectScheduler, "ZoneAwareEffectScheduler");
var ZoneAwareEffectScheduler = _ZoneAwareEffectScheduler;

// node_modules/@angular/core/fesm2022/resource.mjs
var _OutputEmitterRef = class _OutputEmitterRef {
  destroyed = false;
  listeners = null;
  errorHandler = inject2(ErrorHandler, { optional: true });
  /** @internal */
  destroyRef = inject2(DestroyRef);
  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.listeners = null;
    });
  }
  subscribe(callback) {
    if (this.destroyed) {
      throw new RuntimeError(953, ngDevMode && "Unexpected subscription to destroyed `OutputRef`. The owning directive/component is destroyed.");
    }
    (this.listeners ??= []).push(callback);
    return {
      unsubscribe: /* @__PURE__ */ __name(() => {
        const idx = this.listeners?.indexOf(callback);
        if (idx !== void 0 && idx !== -1) {
          this.listeners?.splice(idx, 1);
        }
      }, "unsubscribe")
    };
  }
  /** Emits a new value to the output. */
  emit(value) {
    if (this.destroyed) {
      console.warn(formatRuntimeError(953, ngDevMode && "Unexpected emit for destroyed `OutputRef`. The owning directive/component is destroyed."));
      return;
    }
    if (this.listeners === null) {
      return;
    }
    const previousConsumer = setActiveConsumer(null);
    try {
      for (const listenerFn of this.listeners) {
        try {
          listenerFn(value);
        } catch (err) {
          this.errorHandler?.handleError(err);
        }
      }
    } finally {
      setActiveConsumer(previousConsumer);
    }
  }
};
__name(_OutputEmitterRef, "OutputEmitterRef");
var OutputEmitterRef = _OutputEmitterRef;
function getOutputDestroyRef(ref) {
  return ref.destroyRef;
}
__name(getOutputDestroyRef, "getOutputDestroyRef");
function untracked2(nonReactiveReadsFn) {
  return untracked(nonReactiveReadsFn);
}
__name(untracked2, "untracked");
function computed(computation, options) {
  const getter = createComputed(computation, options?.equal);
  if (ngDevMode) {
    getter.toString = () => `[Computed: ${getter()}]`;
    getter[SIGNAL].debugName = options?.debugName;
  }
  return getter;
}
__name(computed, "computed");
var _EffectRefImpl = class _EffectRefImpl {
  [SIGNAL];
  constructor(node) {
    this[SIGNAL] = node;
  }
  destroy() {
    this[SIGNAL].destroy();
  }
};
__name(_EffectRefImpl, "EffectRefImpl");
var EffectRefImpl = _EffectRefImpl;
function effect(effectFn, options) {
  ngDevMode && assertNotInReactiveContext(effect, "Call `effect` outside of a reactive context. For example, schedule the effect inside the component constructor.");
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(effect);
  }
  if (ngDevMode && options?.allowSignalWrites !== void 0) {
    console.warn(`The 'allowSignalWrites' flag is deprecated and no longer impacts effect() (writes are always allowed)`);
  }
  const injector = options?.injector ?? inject2(Injector);
  let destroyRef = options?.manualCleanup !== true ? injector.get(DestroyRef) : null;
  let node;
  const viewContext = injector.get(ViewContext, null, { optional: true });
  const notifier = injector.get(ChangeDetectionScheduler);
  if (viewContext !== null) {
    node = createViewEffect(viewContext.view, notifier, effectFn);
    if (destroyRef instanceof NodeInjectorDestroyRef && destroyRef._lView === viewContext.view) {
      destroyRef = null;
    }
  } else {
    node = createRootEffect(effectFn, injector.get(EffectScheduler), notifier);
  }
  node.injector = injector;
  if (destroyRef !== null) {
    node.onDestroyFn = destroyRef.onDestroy(() => node.destroy());
  }
  const effectRef = new EffectRefImpl(node);
  if (ngDevMode) {
    node.debugName = options?.debugName ?? "";
    const prevInjectorProfilerContext = setInjectorProfilerContext({ injector, token: null });
    try {
      emitEffectCreatedEvent(effectRef);
    } finally {
      setInjectorProfilerContext(prevInjectorProfilerContext);
    }
  }
  return effectRef;
}
__name(effect, "effect");
var EFFECT_NODE = (() => __spreadProps(__spreadValues({}, BASE_EFFECT_NODE), {
  cleanupFns: void 0,
  zone: null,
  onDestroyFn: noop,
  run() {
    if (ngDevMode && isInNotificationPhase()) {
      throw new Error(`Schedulers cannot synchronously execute watches while scheduling.`);
    }
    const prevRefreshingViews = setIsRefreshingViews(false);
    try {
      runEffect(this);
    } finally {
      setIsRefreshingViews(prevRefreshingViews);
    }
  },
  cleanup() {
    if (!this.cleanupFns?.length) {
      return;
    }
    const prevConsumer = setActiveConsumer(null);
    try {
      while (this.cleanupFns.length) {
        this.cleanupFns.pop()();
      }
    } finally {
      this.cleanupFns = [];
      setActiveConsumer(prevConsumer);
    }
  }
}))();
var ROOT_EFFECT_NODE = (() => __spreadProps(__spreadValues({}, EFFECT_NODE), {
  consumerMarkedDirty() {
    this.scheduler.schedule(this);
    this.notifier.notify(
      12
      /* NotificationSource.RootEffect */
    );
  },
  destroy() {
    consumerDestroy(this);
    this.onDestroyFn();
    this.cleanup();
    this.scheduler.remove(this);
  }
}))();
var VIEW_EFFECT_NODE = (() => __spreadProps(__spreadValues({}, EFFECT_NODE), {
  consumerMarkedDirty() {
    this.view[FLAGS] |= 8192;
    markAncestorsForTraversal(this.view);
    this.notifier.notify(
      13
      /* NotificationSource.ViewEffect */
    );
  },
  destroy() {
    consumerDestroy(this);
    this.onDestroyFn();
    this.cleanup();
    this.view[EFFECTS]?.delete(this);
  }
}))();
function createViewEffect(view, notifier, fn) {
  const node = Object.create(VIEW_EFFECT_NODE);
  node.view = view;
  node.zone = typeof Zone !== "undefined" ? Zone.current : null;
  node.notifier = notifier;
  node.fn = createEffectFn(node, fn);
  view[EFFECTS] ??= /* @__PURE__ */ new Set();
  view[EFFECTS].add(node);
  node.consumerMarkedDirty(node);
  return node;
}
__name(createViewEffect, "createViewEffect");
function createRootEffect(fn, scheduler, notifier) {
  const node = Object.create(ROOT_EFFECT_NODE);
  node.fn = createEffectFn(node, fn);
  node.scheduler = scheduler;
  node.notifier = notifier;
  node.zone = typeof Zone !== "undefined" ? Zone.current : null;
  node.scheduler.add(node);
  node.notifier.notify(
    12
    /* NotificationSource.RootEffect */
  );
  return node;
}
__name(createRootEffect, "createRootEffect");
function createEffectFn(node, fn) {
  return () => {
    fn((cleanupFn) => (node.cleanupFns ??= []).push(cleanupFn));
  };
}
__name(createEffectFn, "createEffectFn");
var identityFn = /* @__PURE__ */ __name((v) => v, "identityFn");
function linkedSignal(optionsOrComputation, options) {
  if (typeof optionsOrComputation === "function") {
    const getter = createLinkedSignal(optionsOrComputation, identityFn, options?.equal);
    return upgradeLinkedSignalGetter(getter);
  } else {
    const getter = createLinkedSignal(optionsOrComputation.source, optionsOrComputation.computation, optionsOrComputation.equal);
    return upgradeLinkedSignalGetter(getter);
  }
}
__name(linkedSignal, "linkedSignal");
function upgradeLinkedSignalGetter(getter) {
  if (ngDevMode) {
    getter.toString = () => `[LinkedSignal: ${getter()}]`;
  }
  const node = getter[SIGNAL];
  const upgradedGetter = getter;
  upgradedGetter.set = (newValue) => linkedSignalSetFn(node, newValue);
  upgradedGetter.update = (updateFn) => linkedSignalUpdateFn(node, updateFn);
  upgradedGetter.asReadonly = signalAsReadonlyFn.bind(getter);
  return upgradedGetter;
}
__name(upgradeLinkedSignalGetter, "upgradeLinkedSignalGetter");
var RESOURCE_VALUE_THROWS_ERRORS_DEFAULT = true;
function resource(options) {
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(resource);
  }
  const oldNameForParams = options.request;
  const params = options.params ?? oldNameForParams ?? (() => null);
  return new ResourceImpl(params, getLoader(options), options.defaultValue, options.equal ? wrapEqualityFn(options.equal) : void 0, options.injector ?? inject2(Injector), RESOURCE_VALUE_THROWS_ERRORS_DEFAULT);
}
__name(resource, "resource");
var _BaseWritableResource = class _BaseWritableResource {
  value;
  constructor(value) {
    this.value = value;
    this.value.set = this.set.bind(this);
    this.value.update = this.update.bind(this);
    this.value.asReadonly = signalAsReadonlyFn;
  }
  isError = computed(() => this.status() === "error");
  update(updateFn) {
    this.set(updateFn(untracked2(this.value)));
  }
  isLoading = computed(() => this.status() === "loading" || this.status() === "reloading");
  // Use a computed here to avoid triggering reactive consumers if the value changes while staying
  // either defined or undefined.
  isValueDefined = computed(() => {
    if (this.isError()) {
      return false;
    }
    return this.value() !== void 0;
  });
  hasValue() {
    return this.isValueDefined();
  }
  asReadonly() {
    return this;
  }
};
__name(_BaseWritableResource, "BaseWritableResource");
var BaseWritableResource = _BaseWritableResource;
var _ResourceImpl = class _ResourceImpl extends BaseWritableResource {
  loaderFn;
  equal;
  pendingTasks;
  /**
   * The current state of the resource. Status, value, and error are derived from this.
   */
  state;
  /**
   * Combines the current request with a reload counter which allows the resource to be reloaded on
   * imperative command.
   */
  extRequest;
  effectRef;
  pendingController;
  resolvePendingTask = void 0;
  destroyed = false;
  unregisterOnDestroy;
  constructor(request, loaderFn, defaultValue, equal, injector, throwErrorsFromValue = RESOURCE_VALUE_THROWS_ERRORS_DEFAULT) {
    super(
      // Feed a computed signal for the value to `BaseWritableResource`, which will upgrade it to a
      // `WritableSignal` that delegates to `ResourceImpl.set`.
      computed(() => {
        const streamValue = this.state().stream?.();
        if (!streamValue) {
          return defaultValue;
        }
        if (this.state().status === "loading" && this.error()) {
          return defaultValue;
        }
        if (!isResolved(streamValue)) {
          if (throwErrorsFromValue) {
            throw new ResourceValueError(this.error());
          } else {
            return defaultValue;
          }
        }
        return streamValue.value;
      }, { equal })
    );
    this.loaderFn = loaderFn;
    this.equal = equal;
    this.extRequest = linkedSignal({
      source: request,
      computation: /* @__PURE__ */ __name((request2) => ({ request: request2, reload: 0 }), "computation")
    });
    this.state = linkedSignal({
      // Whenever the request changes,
      source: this.extRequest,
      // Compute the state of the resource given a change in status.
      computation: /* @__PURE__ */ __name((extRequest, previous) => {
        const status = extRequest.request === void 0 ? "idle" : "loading";
        if (!previous) {
          return {
            extRequest,
            status,
            previousStatus: "idle",
            stream: void 0
          };
        } else {
          return {
            extRequest,
            status,
            previousStatus: projectStatusOfState(previous.value),
            // If the request hasn't changed, keep the previous stream.
            stream: previous.value.extRequest.request === extRequest.request ? previous.value.stream : void 0
          };
        }
      }, "computation")
    });
    this.effectRef = effect(this.loadEffect.bind(this), {
      injector,
      manualCleanup: true
    });
    this.pendingTasks = injector.get(PendingTasks);
    this.unregisterOnDestroy = injector.get(DestroyRef).onDestroy(() => this.destroy());
  }
  status = computed(() => projectStatusOfState(this.state()));
  error = computed(() => {
    const stream = this.state().stream?.();
    return stream && !isResolved(stream) ? stream.error : void 0;
  });
  /**
   * Called either directly via `WritableResource.set` or via `.value.set()`.
   */
  set(value) {
    if (this.destroyed) {
      return;
    }
    const error = untracked2(this.error);
    const state = untracked2(this.state);
    if (!error) {
      const current = untracked2(this.value);
      if (state.status === "local" && (this.equal ? this.equal(current, value) : current === value)) {
        return;
      }
    }
    this.state.set({
      extRequest: state.extRequest,
      status: "local",
      previousStatus: "local",
      stream: signal({ value })
    });
    this.abortInProgressLoad();
  }
  reload() {
    const { status } = untracked2(this.state);
    if (status === "idle" || status === "loading") {
      return false;
    }
    this.extRequest.update(({ request, reload }) => ({ request, reload: reload + 1 }));
    return true;
  }
  destroy() {
    this.destroyed = true;
    this.unregisterOnDestroy();
    this.effectRef.destroy();
    this.abortInProgressLoad();
    this.state.set({
      extRequest: { request: void 0, reload: 0 },
      status: "idle",
      previousStatus: "idle",
      stream: void 0
    });
  }
  async loadEffect() {
    const extRequest = this.extRequest();
    const { status: currentStatus, previousStatus } = untracked2(this.state);
    if (extRequest.request === void 0) {
      return;
    } else if (currentStatus !== "loading") {
      return;
    }
    this.abortInProgressLoad();
    let resolvePendingTask = this.resolvePendingTask = this.pendingTasks.add();
    const { signal: abortSignal } = this.pendingController = new AbortController();
    try {
      const stream = await untracked2(() => {
        return this.loaderFn({
          params: extRequest.request,
          // TODO(alxhub): cleanup after g3 removal of `request` alias.
          request: extRequest.request,
          abortSignal,
          previous: {
            status: previousStatus
          }
        });
      });
      if (abortSignal.aborted || untracked2(this.extRequest) !== extRequest) {
        return;
      }
      this.state.set({
        extRequest,
        status: "resolved",
        previousStatus: "resolved",
        stream
      });
    } catch (err) {
      if (abortSignal.aborted || untracked2(this.extRequest) !== extRequest) {
        return;
      }
      this.state.set({
        extRequest,
        status: "resolved",
        previousStatus: "error",
        stream: signal({ error: encapsulateResourceError(err) })
      });
    } finally {
      resolvePendingTask?.();
      resolvePendingTask = void 0;
    }
  }
  abortInProgressLoad() {
    untracked2(() => this.pendingController?.abort());
    this.pendingController = void 0;
    this.resolvePendingTask?.();
    this.resolvePendingTask = void 0;
  }
};
__name(_ResourceImpl, "ResourceImpl");
var ResourceImpl = _ResourceImpl;
function wrapEqualityFn(equal) {
  return (a, b) => a === void 0 || b === void 0 ? a === b : equal(a, b);
}
__name(wrapEqualityFn, "wrapEqualityFn");
function getLoader(options) {
  if (isStreamingResourceOptions(options)) {
    return options.stream;
  }
  return async (params) => {
    try {
      return signal({ value: await options.loader(params) });
    } catch (err) {
      return signal({ error: encapsulateResourceError(err) });
    }
  };
}
__name(getLoader, "getLoader");
function isStreamingResourceOptions(options) {
  return !!options.stream;
}
__name(isStreamingResourceOptions, "isStreamingResourceOptions");
function projectStatusOfState(state) {
  switch (state.status) {
    case "loading":
      return state.extRequest.reload === 0 ? "loading" : "reloading";
    case "resolved":
      return isResolved(state.stream()) ? "resolved" : "error";
    default:
      return state.status;
  }
}
__name(projectStatusOfState, "projectStatusOfState");
function isResolved(state) {
  return state.error === void 0;
}
__name(isResolved, "isResolved");
function encapsulateResourceError(error) {
  if (error instanceof Error) {
    return error;
  }
  return new ResourceWrappedError(error);
}
__name(encapsulateResourceError, "encapsulateResourceError");
var _ResourceValueError = class _ResourceValueError extends Error {
  constructor(error) {
    super(ngDevMode ? `Resource is currently in an error state (see Error.cause for details): ${error.message}` : error.message, { cause: error });
  }
};
__name(_ResourceValueError, "ResourceValueError");
var ResourceValueError = _ResourceValueError;
var _ResourceWrappedError = class _ResourceWrappedError extends Error {
  constructor(error) {
    super(ngDevMode ? `Resource returned an error that's not an Error instance: ${String(error)}. Check this error's .cause for the actual error.` : String(error), { cause: error });
  }
};
__name(_ResourceWrappedError, "ResourceWrappedError");
var ResourceWrappedError = _ResourceWrappedError;

export {
  setCurrentInjector,
  SIGNAL,
  setActiveConsumer,
  getActiveConsumer,
  REACTIVE_NODE,
  producerAccessed,
  consumerBeforeComputation,
  consumerAfterComputation,
  consumerPollProducersForChange,
  consumerDestroy,
  createComputed,
  setThrowInvalidWriteToSignalError,
  signalSetFn,
  SIGNAL_NODE,
  setAlternateWeakRefImpl,
  XSS_SECURITY_URL,
  RuntimeError,
  formatRuntimeError,
  _global,
  initNgDevMode,
  getClosureSafeProperty,
  fillProperties,
  stringify,
  concatStringsWithSpace,
  truncateMiddle,
  forwardRef,
  resolveForwardRef,
  isForwardRef,
  assertNumber,
  assertNumberInRange,
  assertString,
  assertFunction,
  assertEqual,
  assertNotEqual,
  assertSame,
  assertNotSame,
  assertLessThan,
  assertGreaterThan,
  assertGreaterThanOrEqual,
  assertNotDefined,
  assertDefined,
  throwError,
  assertDomNode,
  assertElement,
  assertIndexInRange,
  assertOneOf,
  assertNotReactive,
  ɵɵdefineInjectable,
  defineInjectable,
  ɵɵdefineInjector,
  getInjectableDef,
  isInjectable,
  getInjectorDef,
  NG_PROV_DEF,
  NG_INJ_DEF,
  InjectionToken,
  setInjectorProfilerContext,
  setInjectorProfiler,
  emitProviderConfiguredEvent,
  emitInjectorToCreateInstanceEvent,
  emitInstanceCreatedByInjectorEvent,
  emitInjectEvent,
  emitEffectCreatedEvent,
  runInInjectorProfilerContext,
  isEnvironmentProviders,
  NG_COMP_DEF,
  NG_DIR_DEF,
  NG_PIPE_DEF,
  NG_MOD_DEF,
  NG_FACTORY_DEF,
  NG_ELEMENT_ID,
  renderStringify,
  stringifyForError,
  cyclicDependencyError,
  cyclicDependencyErrorWithDetails,
  throwProviderNotFoundError,
  setInjectImplementation,
  injectRootLimpMode,
  assertInjectImplementationNotEqual,
  ɵɵinject,
  ɵɵinvalidFactoryDep,
  inject2 as inject,
  convertToBitFlags,
  attachInjectFlag,
  getFactoryDef,
  arrayEquals,
  flatten,
  deepForEach,
  addToArray,
  removeFromArray,
  newArray,
  arraySplice,
  arrayInsert2,
  keyValueArraySet,
  keyValueArrayGet,
  keyValueArrayIndexOf,
  EMPTY_OBJ,
  EMPTY_ARRAY,
  ENVIRONMENT_INITIALIZER,
  INJECTOR$1,
  INJECTOR_DEF_TYPES,
  NullInjector,
  getNgModuleDef,
  getNgModuleDefOrThrow,
  getComponentDef,
  getDirectiveDefOrThrow,
  getDirectiveDef,
  getPipeDef,
  isStandalone,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  importProvidersFrom,
  internalImportProvidersFrom,
  walkProviderTree,
  isTypeProvider,
  isClassProvider,
  INJECTOR_SCOPE,
  getNullInjector,
  EnvironmentInjector,
  R3Injector,
  providerToFactory,
  runInInjectionContext,
  isInInjectionContext,
  assertInInjectionContext,
  HOST,
  TVIEW,
  FLAGS,
  PARENT,
  NEXT,
  T_HOST,
  HYDRATION,
  CLEANUP,
  CONTEXT,
  INJECTOR,
  ENVIRONMENT,
  RENDERER,
  CHILD_HEAD,
  CHILD_TAIL,
  DECLARATION_VIEW,
  DECLARATION_COMPONENT_VIEW,
  DECLARATION_LCONTAINER,
  PREORDER_HOOK_FLAGS,
  QUERIES,
  ID,
  EMBEDDED_VIEW_INJECTOR,
  ON_DESTROY_HOOKS,
  EFFECTS_TO_SCHEDULE,
  EFFECTS,
  REACTIVE_TEMPLATE_CONSUMER,
  AFTER_RENDER_SEQUENCES_TO_ADD,
  HEADER_OFFSET,
  DEHYDRATED_VIEWS,
  NATIVE,
  VIEW_REFS,
  MOVED_VIEWS,
  CONTAINER_HEADER_OFFSET,
  isLView,
  isLContainer,
  isContentQueryHost,
  isComponentHost,
  isDirectiveHost,
  isComponentDef,
  isRootView,
  isProjectionTNode,
  hasI18n,
  isDestroyed,
  assertTNodeForLView,
  assertTNodeCreationIndex,
  assertTNodeForTView,
  assertTNode,
  assertTIcu,
  assertComponentType,
  assertNgModuleType,
  assertHasParent,
  assertLContainer,
  assertLView,
  assertFirstCreatePass,
  assertFirstUpdatePass,
  assertDirectiveDef,
  assertIndexInDeclRange,
  assertIndexInExpandoRange,
  assertProjectionSlots,
  assertParentView,
  assertNodeInjector,
  SVG_NAMESPACE,
  MATH_ML_NAMESPACE,
  unwrapRNode,
  unwrapLView,
  getNativeByIndex,
  getNativeByTNode,
  getNativeByTNodeOrNull,
  getTNode,
  load,
  store,
  getComponentLViewByIndex,
  isCreationMode,
  viewAttachedToChangeDetector,
  viewAttachedToContainer,
  getConstant,
  resetPreOrderHookFlags,
  markViewForRefresh,
  walkUpViews,
  requiresRefreshOrTraversal,
  updateAncestorTraversalFlagsOnAttach,
  markAncestorsForTraversal,
  storeLViewOnDestroy,
  removeLViewOnDestroy,
  getLViewParent,
  getOrCreateLViewCleanup,
  getOrCreateTViewCleanup,
  storeCleanupWithContext,
  CheckNoChangesMode,
  getElementDepthCount,
  increaseElementDepthCount,
  decreaseElementDepthCount,
  getBindingsEnabled,
  isInSkipHydrationBlock,
  isSkipHydrationRootTNode,
  ɵɵenableBindings,
  enterSkipHydrationBlock,
  ɵɵdisableBindings,
  leaveSkipHydrationBlock,
  getLView,
  getTView,
  ɵɵrestoreView,
  ɵɵresetView,
  getCurrentTNode,
  getCurrentTNodePlaceholderOk,
  getCurrentParentTNode,
  setCurrentTNode,
  isCurrentTNodeParent,
  setCurrentTNodeAsNotParent,
  getContextLView,
  isInCheckNoChangesMode,
  isExhaustiveCheckNoChanges,
  setIsInCheckNoChangesMode,
  isRefreshingViews,
  setIsRefreshingViews,
  getBindingRoot,
  getBindingIndex,
  setBindingIndex,
  nextBindingIndex,
  incrementBindingIndex,
  isInI18nBlock,
  setInI18nBlock,
  setBindingRootForHostBindings,
  getCurrentDirectiveIndex,
  setCurrentDirectiveIndex,
  getCurrentDirectiveDef,
  getCurrentQueryIndex,
  setCurrentQueryIndex,
  enterDI,
  enterView,
  leaveDI,
  leaveView,
  nextContextImpl,
  getSelectedIndex,
  setSelectedIndex,
  getSelectedTNode,
  ɵɵnamespaceSVG,
  ɵɵnamespaceMathML,
  ɵɵnamespaceHTML,
  getNamespace,
  wasLastNodeCreated,
  lastNodeWasCreated,
  setAnimationElementRemovalRegistry,
  getAnimationElementRemovalRegistry,
  createInjector,
  createInjectorWithoutInjectorInstances,
  Injector,
  DOCUMENT,
  DestroyRef,
  ErrorHandler,
  INTERNAL_APPLICATION_ERROR_HANDLER,
  errorHandlerEnvironmentInitializer,
  provideBrowserGlobalErrorListeners,
  isSignal,
  ɵunwrapWritableSignal,
  signal,
  signalAsReadonlyFn,
  isWritableSignal,
  ChangeDetectionScheduler,
  ZONELESS_ENABLED,
  PROVIDED_ZONELESS,
  ZONELESS_SCHEDULER_DISABLED,
  SCHEDULE_IN_ROOT_ZONE,
  assertNotInReactiveContext,
  ViewContext,
  PendingTasksInternal,
  PendingTasks,
  noop,
  EffectScheduler,
  OutputEmitterRef,
  getOutputDestroyRef,
  untracked2 as untracked,
  computed,
  effect,
  linkedSignal,
  resource,
  ResourceImpl,
  encapsulateResourceError
};
/*! Bundled license information:

@angular/core/fesm2022/not_found.mjs:
@angular/core/fesm2022/signal.mjs:
@angular/core/fesm2022/effect.mjs:
@angular/core/fesm2022/weak_ref.mjs:
@angular/core/fesm2022/primitives/signals.mjs:
@angular/core/fesm2022/primitives/di.mjs:
@angular/core/fesm2022/root_effect_scheduler.mjs:
@angular/core/fesm2022/resource.mjs:
  (**
   * @license Angular v20.3.0
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)
*/
//# sourceMappingURL=chunk-PO3V5S7F.js.map
