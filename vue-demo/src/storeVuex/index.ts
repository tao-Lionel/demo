import { InjectionKey } from "vue";
import { createStore, Store, useStore as myUseStore } from "../vuex/index.js";
// import { createStore, Store, useStore as myUseStore } from "vuex";

export const key: InjectionKey<Store<State>> = Symbol();

export interface State {
  testVuex: number;
}

const store = createStore<State>({
  state() {
    return {
      testVuex: 0,
      testVuex2: 99,
    };
  },
  getters: {
    getTestVuex(state) {
      return state.testVuex;
    },
    getTestVuex2(state) {
      return state.testVuex2;
    },
  },
  mutations: {
    setTestVuex(state, count = 10) {
      state.testVuex = count;
    },
  },

  actions: {
    testActions({ commit }, id) {
      commit("setTestVuex", id);
    },
  },
});

export function useStore() {
  return myUseStore(key);
}

export default store;
