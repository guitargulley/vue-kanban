import axios from 'axios'
import vue from 'vue'
import vuex from 'vuex'
import router from '../router'
import $ from 'jquery'

let api = axios.create({
  baseURL: 'http://localhost:3000/api/',
  timeout: 2000,
  withCredentials: true
})

let auth = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: 2000,
  withCredentials: true
})
vue.use(vuex)

var store = new vuex.Store({
  state: {
    boards: [],
    activeBoard: {},
    error: {},
    user: {}
  },
  mutations: {
    setBoards(state, data) {
      state.boards = data
    },
    handleError(state, err) {
      state.error = err
    },
    setUser(state, user) {
      state.user = user
    }

  },
  actions: {
    //when writing your auth routes (login, logout, register) be sure to use auth instead of api for the posts

    getBoards({ commit, dispatch }) {
      console.log("GET")
      api('userboards')
        .then(res => {
          commit('setBoards', res.data.data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    getBoard({ commit, dispatch }, id) {
      api('boards/' + id)
        .then(res => {
          commit('setActiveBoard', res.data.data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    createBoard({ commit, dispatch }, payload) {
      debugger
      api.post('boards/', payload)
        .then(res => {
          dispatch('getBoards')
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    removeBoard({ commit, dispatch }, board) {
      api.delete('boards/' + board._id)
        .then(res => {
          this.getBoards()
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    //LOGIN AND REGISTER

    login({ commit, dispatch }, payload) {
      auth.post('login', payload)
        .then(res => {
          commit('setUser', res.data.data)
          router.push({ name: 'Boards' })
        })
        .catch(err => { commit('handleError', err) })
    },
    register({ commit, dispatch}, payload){
      auth.post('register', payload)
        .then(res => {
          commit('setUser', res.data.data)
          router.push({name: 'Boards'})
        })
        .catch((err)=>{
          { commit('handleError', err)}
        })
    },
    authenticate({commit, dispatch}){
      auth('authenticate')
        .then(res =>{
          commit('setUser', res.data.data)
          router.push({name: 'Boards'})
        })
        .catch(()=>{
          router.push({name: 'Home'})
        })
    },
    logout({commit, dispatch}){
      auth.delete('logout')
        .then((user)=>{
          user={}
          commit('setUser', user)
          router.push({name: 'Home'})
        })
    },






    handleError({ commit, dispatch }, err) {
      commit('handleError', err)
    }
  }

})


export default store
