export type DeferredPromise = {
  promise?: Promise<void>;
  resolve?: () => void;
  isResolved: boolean;
};
export function createDeferredPromise(): DeferredPromise {
  const deferred: DeferredPromise = { isResolved: false };
  deferred.promise = new Promise((resolve) => {
    deferred.resolve = resolve;
  });
  deferred.promise.then(() => (deferred.isResolved = true));
  return deferred;
}
