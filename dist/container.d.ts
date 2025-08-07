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
    new (...args: any[]): T;
}
/**
 * Classes and factories that can be injected into the container.
 */
export type Injectable<T> = Factory<T> | ClassConstructor<T>;
/**
 * Dependency injection container.
 */
export declare abstract class Container {
    /**
     * Registered instances.
     *
     * @private
     */
    private static readonly instances;
    /**
     * Memoized function caches.
     *
     * @private
     */
    private static readonly memos;
    /**
     * Get an instance of a service.
     *
     * @param service
     * @private
     */
    private static serve;
    /**
     * Register a service.
     *
     * @param service
     * @param factory
     * @see Container.serve
     */
    static register<T>(service: Injectable<T>, factory?: Injectable<T>): void;
    /**
     * Resolve a service or factory.
     *
     * When the service is not found, it will be registered into the container and returned.
     *
     * @param service
     * @see Container.register
     */
    static resolve<T>(service: Injectable<T>): T;
    /**
     * Memoize a function.
     *
     * The function will be called only once for each set of arguments.
     *
     * @param fn
     */
    static memo<T extends (...args: any[]) => any>(fn: T): T;
    /**
     * Unregister a service.
     *
     * @param service
     */
    static unregister<T>(service: Injectable<T>): void;
    /**
     * Refresh a memoized function.
     *
     * @param fn
     */
    static refresh<T extends (...args: any[]) => any>(fn: T): void;
    /**
     * Check whether a class or service is supported to be registered into the container.
     *
     * @param service
     * @private
     */
    private static supports;
}
/**
 * Get an instance of a service.
 *
 * This function will register the service into the container if it is not already registered.
 *
 * @param service
 * @see Container.resolve
 */
export declare function app<T>(service: Injectable<T>): T;
