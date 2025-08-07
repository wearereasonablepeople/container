/**
 * Dependency injection container.
 */
export class Container {
    /**
     * Get an instance of a service.
     *
     * @param service
     * @private
     */
    static serve(service) {
        if (this.supports(service)) {
            return new service();
        }
        return service();
    }
    /**
     * Register a service.
     *
     * @param service
     * @param factory
     * @see Container.serve
     */
    static register(service, factory) {
        this.instances.set(service, this.serve(factory !== null && factory !== void 0 ? factory : service));
    }
    /**
     * Resolve a service or factory.
     *
     * When the service is not found, it will be registered into the container and returned.
     *
     * @param service
     * @see Container.register
     */
    static resolve(service) {
        if (!this.instances.has(service)) {
            this.register(service);
        }
        return this.instances.get(service);
    }
    /**
     * Memoize a function.
     *
     * The function will be called only once for each set of arguments.
     *
     * @param fn
     */
    static memo(fn) {
        let cache = this.memos.get(fn);
        if (!cache) {
            cache = new Map();
            this.memos.set(fn, cache);
        }
        /**
         * Memoized function.
         *
         * @param args
         */
        return ((...args) => {
            const key = JSON.stringify(args);
            if (!cache.has(key)) {
                cache.set(key, fn(...args));
            }
            return cache.get(key);
        });
    }
    /**
     * Unregister a service.
     *
     * @param service
     */
    static unregister(service) {
        this.instances.delete(service);
    }
    /**
     * Refresh a memoized function.
     *
     * @param fn
     */
    static refresh(fn) {
        this.memos.delete(fn);
    }
    /**
     * Check whether a class or service is supported to be registered into the container.
     *
     * @param service
     * @private
     */
    static supports(service) {
        return Boolean(service instanceof Function && service.prototype);
    }
}
/**
 * Registered instances.
 *
 * @private
 */
Container.instances = new WeakMap();
/**
 * Memoized function caches.
 *
 * @private
 */
Container.memos = new WeakMap();
/**
 * Get an instance of a service.
 *
 * This function will register the service into the container if it is not already registered.
 *
 * @param service
 * @see Container.resolve
 */
export function app(service) {
    return Container.resolve(service);
}
