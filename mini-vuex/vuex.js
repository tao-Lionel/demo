import { reactive, inject } from "vue";

const storeKey = "store";

export class Store {
    constructor(options) {
        const store = this;
        const { state, getters, mutations, actions } = options;
        store._state = reactive({ data: typeof state === "function" ? state() : state });

        store.getters = {};
        store._mutations = Object.create(null); // 没有原型链的对象
        store._actions = Object.create(null);

        forEachValue(getters, (fn, key) => {
            Object.defineProperty(store.getters, key, {
                get: () => fn(store.state),
            });
        });

        forEachValue(mutations, (fn, key) => {
            store._mutations[key] = payload => {
                fn.call(store, store.state, payload);
            };
        });

        forEachValue(actions, (fn, key) => {
            store._actions[key] = payload => {
                fn.call(store, store, payload);
            };
        });
    }

    get state() {
        return this._state.data;
    }

    // 使用箭头函数，因为解构使用commit this指向会改变，所以使用箭头函数，保证this 永远指向Store
    commit = (type, payload) => {
        this._mutations[type](payload);
    };

    dispatch = (type, payload) => {
        this._actions[type](payload);
    };

    install(app, injectKey = storeKey) {
        app.provide(injectKey, this);
    }
}

function forEachValue(obj, fn) {
    Object.keys(obj).forEach(key => fn(obj[key], key));
}

export function createStore(options) {
    return new Store(options);
}

export function useStore(key) {
    return inject(key !== null ? key : storeKey);
}
