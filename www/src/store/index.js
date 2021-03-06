import axios from 'axios'
import vue from 'vue'
import vuex from 'vuex'
import router from '../router'
import $ from 'jquery'

let api = axios.create({
  baseURL: '/api/',
  timeout: 2000,
  withCredentials: true
})

let auth = axios.create({
  baseURL: '/',
  timeout: 2000,
  withCredentials: true
})
vue.use(vuex)

var store = new vuex.Store({
  state: {
    boards: [],
    activeBoard: {},
    error: {},
    user: {},
    lists: [],
    tasks: {},
    activeTask: {},
    comments: {}
  },
  mutations: {
    setBoards(state, data) {
      debugger
      state.boards = data
    },
    setActiveBoard(state, board) {
      state.activeBoard = {}
      state.activeBoard = board
    },
    setLists(state, lists) {
      state.lists = []
      state.lists = lists
    },
    handleError(state, err) {
      state.error = err
    },
    setUser(state, user) {
      state.user = user
    },
    setTasks(state, payload) {
      if(payload.tasks.length == 0){
        vue.set(state.tasks, payload.listId, [])
      }
      payload.tasks.forEach(task => {
        vue.set(state.tasks, payload.listId, [])
      })
      payload.tasks.forEach(task => {
        state.tasks[payload.listId].push(task)
      })
      
    },
    setComments(state, payload) {
      if(payload.comments.length == 0){
        vue.set(state.comments, payload.taskId, [])
      }
      payload.comments.forEach(comment => {
        vue.set(state.comments, payload.taskId, [])
      })
      payload.comments.forEach(comment => {
        state.comments[payload.taskId].push(comment)
      })
    },
    setActiveTask(state, task) {
      state.activeTask = {}
      state.activeTask = task
    }

  },
  actions: {
    //when writing your auth routes (login, logout, register) be sure to use auth instead of api for the posts
    //Board Actions
    getBoards({ commit, dispatch }) {
     debugger
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

      api.post('boards/', payload)
        .then(res => {
          dispatch('getBoards')
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    removeBoard({ commit, dispatch }, board) {
      debugger
      api.delete('boards/' + board._id)
        .then(res => {
          dispatch('getBoards')
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    //List Actions
    addNewList({ commit, dispatch }, payload) {
      // console.log(payload)
      api.post('lists', payload)
        .then(res => {
          // console.log(res)
          dispatch('getListsByBoardId', res.data.data.boardId)
        })
        .catch(err => {
          commit('handleError', err)
        })

    },
    getListsByBoardId({ commit, dispatch }, boardId) {
      api('boards/' + boardId + '/lists')
        // console.log(boardId)
        .then(res => {
          commit('setLists', res.data.data)
        })
        .catch(err => { commit('handleError', err) })
    },
    deleteList({ commit, dispatch }, list) {
      // console.log(list)
      api.delete('lists/' + list._id)
        .then(res => {
          dispatch('getListsByBoardId', res.data.data.boardId)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    addNewTask({ commit, dispatch }, payload) {
      // console.log(payload)
      api.post('tasks', payload)
        .then(res => {
          dispatch('getTasksByListId', { _id: res.data.data.listId, boardId: res.data.data.boardId })
        })
        .catch(err => {
          commit('handleError', err)
        })

    },
    getTasksByListId({ commit, dispatch }, list) {
      api('boards/' + list.boardId + '/lists/' + list._id + '/tasks')
        .then(res => {
          commit('setTasks', { listId: list._id, tasks: res.data.data })
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    getTaskbyTaskId({ commit, dispatch }, task) {
      api('tasks/' + task._id)
        .then(res => {
          commit('setActiveTask', res.data.data)
          dispatch('getCommentsByTaskId', task)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    //Comments on Tasks
    addComment({ commit, dispatch }, payload) {
      
      // console.log(payload)
      api.post('comments', payload)
        .then(res => {
          console.log(res)
          dispatch('getCommentsByTaskId', { _id: payload.taskId, listId: payload.listId, boardId: payload.boardId })
        })
    },
    getCommentsByTaskId({ commit, dispatch }, task) {
      // console.log(task)
      
      api('boards/' + task.boardId + '/lists/' + task.listId + '/tasks/' + task._id + '/comments')
        .then(res => {
          console.log(res)
          commit('setComments', { taskId: task._id, comments: res.data.data })
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    updateTask({ commit, dispatch }, task) {
      debugger
      api.put('/tasks/' + task._id, task)
        .then(res => {
          dispatch('getTasksByListId', { boardId: task.boardId, _id: task.listId })
          console.log('you got here')
          dispatch('getTasksByListId', { boardId: task.boardId, _id: task.oldId })
          
          dispatch('getCommentsByTaskId', task)
          task.oldId = ""
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    deleteComment({commit, dispatch}, payload){
      api.delete('/comments/' + payload.comment._id)
        .then(()=>{
          dispatch('getCommentsByTaskId', payload.task)
        })
    },
    deleteTask({commit, dispatch}, task){
      
      api.delete('/tasks/' + task._id)
        .then(() =>{
          dispatch('getTasksByListId', {boardId: task.boardId, _id: task.listId})
        })
    },

    //LOGIN AND REGISTER

    login({ commit, dispatch }, payload) {
      debugger
      auth.post('login', payload)
        .then(res => {
          commit('setUser', res.data.data)
          router.push({ name: 'Boards' })
        })
        .catch(err => { commit('handleError', err)
          router.push({ name: 'login' })
      })
    },
    register({ commit, dispatch }, payload) {
      auth.post('register', payload)
        .then(res => {
          commit('setUser', res.data.data)
          router.push({ name: 'Boards' })
        })
        .catch((err) => {
          { commit('handleError', err) }
        })
    },
    authenticate({ commit, dispatch }) {
      auth('authenticate')
        .then(res => {
          commit('setUser', res.data.data)
          router.push({ name: 'Boards' })
        })
        .catch(() => {
          router.push({ name: 'Home' })
        })
    },
    logout({ commit, dispatch }) {
      auth.delete('logout')
        .then((user) => {
          user = {}
          commit('setUser', user)
          router.push({ name: 'Home' })
        })
    },






    handleError({ commit, dispatch }, err) {
      commit('handleError', err)
    }
  }

})


export default store
