/**
 * @zh_CN 登录页面 url 地址
 */
export const LOGIN_PATH = '/login'

/**
 * @zh_CN 默认首页地址
 */
export const DEFAULT_HOME_PATH = '/home'

export interface LanguageOption {
  label: string
  value: 'en-US' | 'zh-CN'
}

/**
 * Supported languages
 */
export const SUPPORT_LANGUAGES: LanguageOption[] = [
  {
    label: '简体中文',
    value: 'zh-CN',
  },
  {
    label: 'English',
    value: 'en-US',
  },
]

/**
 * 默认租户ID
 */
export const DEFAULT_TENANT_ID = '000000'

export interface Options {
  id?: number
  label: string
  value: string
}
/**
 * 目录
 * @type {string}
 */
export const MENU_DIR: string = '1002001'
/**
 * 菜单
 * @type {string}
 */
export const MENU_PAGE: string = '1002002'
/**
 * 按钮
 * @type {string}
 */
export const MENU_BTN: string = '1002003'

export const CHANNEL_DEFAULT: string = 'DEFAULTS'

export const CHANNEL_KICK_OFF: string = 'KICK_OFF'

export const UPGRADE_CHANNEL: string = 'UPGRADE_CHANNEL'

/**
 * 是否选项
 * @type {[Options,Options]}
 */
export const yesNoOptions: Options[] = [
  {
    label: '是',
    value: 'T',
  },
  {
    label: '否',
    value: 'F',
  },
]

export const dictBusinessType: Options[] = [
  {
    label: '业务字典',
    value: 'business',
  },
  {
    label: '系统字典',
    value: 'system',
  },
]

export const dictBusinessTypeLabel = (value: string): string => {
  const item = dictBusinessType.find((item) => item.value === value)

  return item?.label || ''
}

/**
 * 是否选项label显示
 * @param value
 * @returns {string}
 */
export const yesNoOptionsLabel = (value: string): string => {
  const item = yesNoOptions.find((item) => item.value === value)

  return item?.label || ''
}

/**
 * 标签类型
 * @type {[Options,Options]}
 */
export const tagsTypeOptions: Options[] = [
  {
    id: 1,
    label: 'Default',
    value: 'primary',
  },
  {
    id: 2,
    label: 'Success',
    value: 'success',
  },
  {
    id: 3,
    label: 'Info',
    value: 'info',
  },
  {
    id: 4,
    label: 'Warning',
    value: 'warning',
  },
  {
    id: 5,
    label: 'Danger',
    value: 'danger',
  },
]

/**
 * 标签类型 显示文本
 * @param value
 * @returns {string|string}
 */
export const tagsTypeOptionsLabel = (value: string): string => {
  const item = tagsTypeOptions.find((item) => item.value === value)

  return item?.label || ''
}
