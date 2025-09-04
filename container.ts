/**
 * Factory.
 */
export interface Factory<T> {
    (): T;
}

/**
 * Class constructor.
 */
export interface ClassConstructor<T> {
    new(...args: any[]): T;
}

/**
 * Classes and factories that can be injected into the container.
 */
export type Injectable<T> = Factory<T> | ClassConstructor<T>;

/**
 * Dependency injection container.
 */
export abstract class Container {
    /**
     * Registered instances.
     *
     * @private
     */
    private static readonly instances = new WeakMap<Injectable<unknown>, unknown>();

    /**
     * Registered instances.
     *
     * @private
     */
    private static readonly providers = new WeakMap<Injectable<unknown>, () => unknown>();

    /**
     * Memoized function caches.
     *
     * @private
     */
    private static readonly memos = new WeakMap<(...args: any[]) => any, Map<string, unknown>>();

    /**
     * Get an instance of a service.
     *
     * @param service
     * @private
     */
    private static serve<T>(service: Injectable<T>) {
        if (this.supports(service)) {
            return new (service as ClassConstructor<T>)();
        }

        return (service as Factory<T>)();
    }

    /**
     * Register a service.
     *
     * @param service
     * @param factory
     * @see Container.serve
     */
    static register<T>(
        service: Injectable<T>,
        factory?: Injectable<T>,
    ) {
        this.instances.set(service, this.serve(factory ?? service));
        this.providers.set(service, () => this.serve(factory ?? service));
    }

    /**
     * Resolve a service or factory.
     *
     * When the service is not found, it will be registered into the container and returned.
     *
     * @param service
     * @param fresh
     * @see Container.registerx
     */
    static resolve<T>(service: Injectable<T>, fresh: boolean = false) {
        if (!this.providers.has(service)) {
            this.register(service);
        }

        if (fresh) {
            return this.providers.get(service)!() as T;
        }

        if (!this.instances.has(service)) {
            this.instances.set(service, this.providers.get(service)!());
        }

        return this.instances.get(service) as T;
    }

    /**
     * Memoize a function.
     *
     * The function will be called only once for each set of arguments.
     *
     * @param fn
     */
    static memo<T extends (...args: any[]) => any>(fn: T) {
        let cache = this.memos.get(fn);

        if (!cache) {
            cache = new Map<string, ReturnType<T>>();

            this.memos.set(fn, cache);
        }

        /**
         * Memoized function.
         *
         * @param args
         */
        return ((...args: Parameters<T>) => {
            const key = JSON.stringify(args);

            if (!cache.has(key)) {
                cache.set(key, fn(...args));
            }

            return cache.get(key)!;
        }) as T;
    }

    /**
     * Unregister a service.
     *
     * @param service
     */
    static unregister<T>(service: Injectable<T>) {
        this.instances.delete(service);
        this.providers.delete(service);
    }

    /**
     * Refresh a memoized function.
     *
     * @param fn
     */
    static refresh<T extends (...args: any[]) => any>(fn: T) {
        this.memos.delete(fn);
    }

    /**
     * Check whether a class or service is supported to be registered into the container.
     *
     * @param service
     * @private
     */
    private static supports<T>(service: Injectable<T>) {
        return Boolean(service instanceof Function && (service as ClassConstructor<T>).prototype);
    }
}

/**
 * Get an instance of a service.
 *
 * This function will register the service into the container if it is not already registered.
 *
 * @param service
 * @param fresh
 * @see Container.resolve
 */
export function app<T>(service: Injectable<T>, fresh: boolean = false) {
    return Container.resolve(service, fresh);
}