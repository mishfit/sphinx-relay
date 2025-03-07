import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({ tableName: 'sphinx_chats', underscored: true })
export default class Chat extends Model<Chat> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number

  @Column
  uuid: string

  @Column
  name: string

  @Column
  photoUrl: string

  @Column(DataType.BIGINT)
  type: number

  @Column(DataType.BIGINT)
  status: number

  @Column
  contactIds: string

  @Column
  isMuted: boolean

  @Column
  createdAt: Date

  @Column
  updatedAt: Date

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  deleted: boolean

  @Column(DataType.TEXT)
  groupKey: string

  @Column(DataType.TEXT)
  groupPrivateKey: string

  @Column
  host: string

  @Column
  priceToJoin: number

  @Column
  pricePerMessage: number

  @Column(DataType.BIGINT)
  escrowAmount: number

  @Column(DataType.BIGINT)
  escrowMillis: number

  @Column({
    // dont show on tribes list
    type: DataType.BOOLEAN,
    defaultValue: false,
    // allowNull: false
  })
  unlisted: boolean

  @Column
  private: boolean // joining requires approval of admin

  @Column
  ownerPubkey: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  seen: boolean

  @Column
  appUrl: string

  @Column
  feedUrl: string

  @Column
  feedType: number

  @Column
  meta: string

  @Column
  myPhotoUrl: string

  @Column
  myAlias: string

  @Column
  tenant: number

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  })
  skipBroadcastJoins: boolean

  @Column
  pin: string

  @Column(DataType.BIGINT)
  notify: number

  @Column(DataType.TEXT)
  profileFilters: string

  // This value is always 1 or 0, which means on or off
  @Column
  callRecording: number

  @Column(DataType.TEXT)
  memeServerLocation: string

  @Column(DataType.TEXT)
  jitsiServer: string

  @Column(DataType.TEXT)
  stakworkApiKey: string

  @Column(DataType.TEXT)
  stakworkWebhook: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  defaultJoin: boolean
}

export interface ChatRecord extends Chat {
  dataValues: Chat
}
