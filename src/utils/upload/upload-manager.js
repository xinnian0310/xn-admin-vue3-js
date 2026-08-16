import { DEFAULT_UPLOADER_OPTIONS } from './types'
import { UploadTask } from './upload-task'

/**
 * 上传队列：持有多个 {@link UploadTask}，按 `fileConcurrency` 控制同时上传的文件数。
 *
 * 与框架无关——通过 `subscribe` 把变更推给 UI 层，由 UI 把 `snapshot()` 映射成自己的响应式状态。
 */
class UploadManager {
  constructor(options) {
    this.options = { ...DEFAULT_UPLOADER_OPTIONS, ...options }
    this.tasks = []
    this.listeners = new Set()
  }

  /** 更新配置；已在传输中的任务沿用创建时的配置，避免分片边界中途变化 */
  setOptions(options) {
    this.options = { ...this.options, ...options }
  }

  getOptions() {
    return { ...this.options }
  }

  add(files, autoStart = true) {
    const created = []
    for (const file of files) {
      const task = new UploadTask(file, { ...this.options }, () => this.handleTaskChange())
      this.tasks.push(task)
      created.push(task)
    }
    this.emit()
    if (autoStart) this.pump()
    return created
  }

  start(id) {
    if (id) {
      const task = this.find(id)
      if (task) void task.start()
      return
    }
    this.pump()
  }

  pauseAll() {
    for (const task of this.tasks) {
      task.pause()
    }
    this.emit()
  }

  resumeAll() {
    for (const task of this.tasks) {
      task.resume()
    }
    this.pump()
  }

  async cancelAll() {
    await Promise.all(this.tasks.map((task) => task.cancel()))
    this.emit()
  }

  /** 从队列中移除；未结束的任务会先取消并清理服务端分片 */
  async remove(id) {
    const task = this.find(id)
    if (!task) return
    if (!task.isSettled) {
      await task.cancel()
    }
    this.tasks = this.tasks.filter((item) => item.id !== id)
    this.emit()
    this.pump()
  }

  /** 清掉已完成 / 已取消的记录 */
  clearSettled() {
    this.tasks = this.tasks.filter((task) => !task.isSettled)
    this.emit()
  }

  find(id) {
    return this.tasks.find((task) => task.id === id)
  }

  snapshot() {
    return this.tasks.map((task) => task.snapshot())
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** 组件卸载时调用：中断所有进行中的请求，避免野请求继续跑 */
  dispose() {
    for (const task of this.tasks) {
      task.pause()
    }
    this.listeners.clear()
  }

  handleTaskChange() {
    this.pump()
    this.emit()
  }

  /** 把 pending 任务补满到并发上限；paused / error 需用户显式操作，不自动重启 */
  pump() {
    const limit = Math.max(1, this.options.fileConcurrency)
    let active = this.tasks.filter((task) => task.isRunning).length
    for (const task of this.tasks) {
      if (active >= limit) return
      if (task.currentStatus === 'pending' && !task.isRunning) {
        active += 1
        void task.start()
      }
    }
  }

  emit() {
    const snapshot = this.snapshot()
    for (const listener of this.listeners) {
      listener(snapshot)
    }
  }
}

export { UploadManager }
