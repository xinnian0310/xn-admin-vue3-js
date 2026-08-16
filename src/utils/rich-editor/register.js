import { Boot } from '@wangeditor/editor'
import ctrlEnterModule from '@wangeditor/plugin-ctrl-enter'
import formulaModule from '@wangeditor/plugin-formula'
import linkCardModule from '@wangeditor/plugin-link-card'
import markdownModule from '@wangeditor/plugin-md'
import mentionModule from '@wangeditor/plugin-mention'
import attachmentModule from '@wangeditor/plugin-upload-attachment'

let registered = false

function asModule(mod) {
  if (mod?.menus || mod?.editorPlugin) return mod
  return mod?.default ?? mod
}

/** wangEditor 插件只能注册一次，且必须在创建编辑器之前 */
export function registerRichEditorPlugins() {
  if (registered) return
  registered = true
  Boot.registerModule(asModule(markdownModule))
  Boot.registerModule(asModule(formulaModule))
  Boot.registerModule(asModule(mentionModule))
  Boot.registerModule(asModule(attachmentModule))
  Boot.registerModule(asModule(linkCardModule))
  Boot.registerModule(asModule(ctrlEnterModule))
}

registerRichEditorPlugins()
