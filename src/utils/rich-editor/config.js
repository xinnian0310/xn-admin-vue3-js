import { DEFAULT_MAX_FILE_SIZE } from '@/utils/upload'
import './register'
import { filePublicUrl, uploadEditorFile } from './upload'

export function createRichToolbarConfig() {
  return {
    insertKeys: {
      index: 19,
      keys: ['insertFormula', 'uploadAttachment'],
    },
  }
}

export function createRichEditorConfig(options) {
  return {
    placeholder: options.placeholder,
    readOnly: options.readOnly,
    hoverbarKeys: {
      formula: { menuKeys: ['editFormula'] },
      attachment: { menuKeys: ['downloadAttachment'] },
      link: {
        menuKeys: ['editLink', 'unLink', 'viewLink', 'convertToLinkCard'],
      },
    },
    MENU_CONF: {
      uploadImage: {
        maxFileSize: DEFAULT_MAX_FILE_SIZE,
        async customUpload(file, insertFn) {
          const info = await uploadEditorFile(file)
          const url = filePublicUrl(info)
          insertFn(url, info.name, url)
        },
      },
      uploadVideo: {
        maxFileSize: DEFAULT_MAX_FILE_SIZE,
        async customUpload(file, insertFn) {
          const info = await uploadEditorFile(file)
          insertFn(filePublicUrl(info), '')
        },
      },
      uploadAttachment: {
        maxFileSize: DEFAULT_MAX_FILE_SIZE,
        async customUpload(file, insertFn) {
          const info = await uploadEditorFile(file)
          insertFn(info.name, filePublicUrl(info))
        },
      },
      convertToLinkCard: {
        async getLinkCardInfo(linkText, linkUrl) {
          let title = (linkText || '').trim()
          if (!title) {
            try {
              title = new URL(linkUrl).hostname
            } catch {
              title = linkUrl
            }
          }
          return { title, iconImgSrc: '' }
        },
      },
    },
    EXTEND_CONF: {
      mentionConfig: {
        showModal: options.mention.showModal,
        hideModal: options.mention.hideModal,
      },
    },
  }
}
