/**
 * Factory.
 */
export interface Factory<T> {
    (...args: []): T;
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
     * Registered instances (singletons).
     *
     * @private
     */
    private static readonly instances = new WeakMap<Injectable<unknown>, unknown>();

    /**
     * Registered providers (factory or class used to create instances).
     *
     * @private
     */
    private static readonly providers = new WeakMap<Injectable<unknown>, Injectable<unknown>>();

    /**
     * Memoized function caches.
     *
     * @private
     */
    private static readonly memos = new WeakMap<(...args: any[]) => any, Map<string, unknown>>();

    /**
     * Get an instance of a service from a provider.
     *
     * @param provider
     * @private
     */
    private static serve<T>(provider: Injectable<T>) {
        if (this.supports(provider)) {
            return new (provider as ClassConstructor<T>)();
        }

        return (provider as Factory<T>)();
    }

    /**
     * Register a service.
     *
     * @param service  The service token (used to look up in the container)
     * @param factory  Optional factory/class to construct the service. Defaults to `service`.
     * @see Container.serve
     */
    static register<T>(
        service: Injectable<T>,
        factory?: Injectable<T>,
    ) {
        const provider = (factory ?? service) as Injectable<T>;

        this.providers.set(service, provider);
        this.instances.set(service, this.serve(provider));
    }

    /**
     * Resolve a service or factory.
     *
     * When the service is not found, it will be registered into the container and returned.
     *
     * @param service The service token
     * @param fresh   If true, bypass the singleton cache and create a new instance each time.
     *                Default is false (singleton).
     * @see Container.register
     */
    static resolve<T>(service: Injectable<T>, fresh: boolean = false): T {
        if (!this.providers.has(service)) {
            this.register(service);
        }

        if (fresh) {
            const provider = (this.providers.get(service) as Injectable<T>) ?? service;

            return this.serve(provider);
        }

        if (!this.instances.has(service)) {
            const provider = (this.providers.get(service) as Injectable<T>) ?? service;

            this.instances.set(service, this.serve(provider));
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
     * Unregister a service instance (keeps the provider).
     *
     * @param service
     * @param provider
     */
    static unregister<T>(service: Injectable<T>, provider: boolean) {
        this.instances.delete(service);

        if (provider) {
            this.providers.delete(service);
        }
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
 * @param fresh If true, bypass singleton and create a new instance each call.
 * @see Container.resolve
 */
export function app<T>(service: Injectable<T>, fresh: boolean = false) {
    return Container.resolve(service, fresh);
}
