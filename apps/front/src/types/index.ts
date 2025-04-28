export type Recordable<T> = Record<string, T>

export interface BasicUserInfo {
  /**
   * 头像
   */
  avatar: string
  /**
   * 用户昵称
   */
  realName: string
  /**
   * 用户角色
   */
  roles?: string[]
  /**
   * 用户id
   */
  userId: string
  /**
   * 用户名
   */
  username: string
}
interface UserInfo extends BasicUserInfo {
  /**
   * 用户描述
   */
  desc: string
  /**
   * 首页地址
   */
  homePath: string

  /**
   * accessToken
   */
  token: string
}

export type { UserInfo }

interface MenuRecordBadgeRaw {
  /**
   * 徽标
   */
  badge?: string
  /**
   * 徽标类型
   */
  badgeType?: 'dot' | 'normal'
  /**
   * 徽标颜色
   */
  badgeVariants?: 'destructive' | 'primary' | string
}

export interface MenuRecordRaw extends MenuRecordBadgeRaw {
  /**
   * 激活时的图标名
   */
  activeIcon?: string
  /**
   * 子菜单
   */
  children?: MenuRecordRaw[]
  /**
   * 是否禁用菜单
   * @default false
   */
  disabled?: boolean
  /**
   * 图标名
   */
  icon?: Component | string
  /**
   * 菜单名
   */
  name: string
  /**
   * 排序号
   */
  order?: number
  /**
   * 父级路径
   */
  parent?: string
  /**
   * 所有父级路径
   */
  parents?: string[]
  /**
   * 菜单路径，唯一，可当作key
   */
  path: string
  /**
   * 是否显示菜单
   * @default true
   */
  show?: boolean
}
