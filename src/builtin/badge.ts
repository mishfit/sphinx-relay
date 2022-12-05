import * as Sphinx from 'sphinx-bot'
import { sphinxLogger, logging } from '../utils/logger'
import { finalAction } from '../controllers/botapi'
import {
  ChatBotRecord,
  ChatMemberRecord,
  ChatRecord,
  ContactRecord,
  MessageRecord,
  models,
} from '../models'
import constants from '../constants'
import fetch from 'node-fetch'
import { transferBadge, createBadge } from '../utils/people'
import { Badge } from '../types'

interface BadgeRewards {
  badgeId: number
  rewardType: number
  amount: number
  name: string
}

const msg_types = Sphinx.MSG_TYPE

let initted = false

// check who the message came from
// check their Member table to see if it cross the amount
// reward the badge (by calling "/transfer" on element server)
// create a text message that says "X badge was awarded to ALIAS for spending!"
// auto-create BadgeBot in a tribe on any message (if it doesn't exist)
// reward data can go in "meta" column of ChatBot
// reward types: earned, spent, posted
// json array like [{badgeId: 1, rewardType: 1, amount: 100000, name: Badge name}]

export function init() {
  if (initted) return
  initted = true

  const client = new Sphinx.Client()
  client.login('_', finalAction)

  client.on(msg_types.MESSAGE, async (message: Sphinx.Message) => {
    const arr = (message.content && message.content.split(' ')) || []
    const cmd = arr[1]
    const tribe = (await models.Chat.findOne({
      where: { uuid: message.channel.id },
    })) as ChatRecord
    if (arr[0] === '/badge') {
      const isAdmin = message.member.roles.find((role) => role.name === 'Admin')
      if (!isAdmin) return
      // typeof name !== 'string' ||
      // typeof icon !== 'string' ||
      // typeof amount !== 'number' ||
      // typeof chat_id !== 'number' ||
      // typeof claim_amount !== 'number' ||
      // typeof reward_type !== 'number'
      switch (cmd) {
        case 'create':
          if (arr.length === 7) {
            const name = arr[2]
            const amount = Number(arr[3])
            const claim_amount = Number(arr[4])
            const reward_type = Number(arr[5])
            const icon = arr[6]
            const response = await createBadge({
              host: 'liquid.sphinx.chat',
              icon,
              amount: amount,
              name,
              owner_pubkey: tribe.ownerPubkey,
            })

            await createOrEditBadgeBot(
              tribe.id,
              tribe.tenant,
              response,
              claim_amount,
              reward_type
            )
          } else {
            return
          }
      }
    } else {
      const chatMembers: ChatMemberRecord[] = []

      try {
        const bot = (await models.ChatBot.findOne({
          where: {
            botPrefix: '/badge',
            chatId: tribe.id,
            tenant: tribe.tenant,
          },
        })) as ChatBotRecord
        const chatMember = (await models.ChatMember.findOne({
          where: {
            contactId: parseInt(message.member.id!),
            tenant: tribe.tenant,
            chatId: tribe.id,
          },
        })) as ChatMemberRecord

        chatMembers.push(chatMember)

        if (message.type === constants.message_types.boost) {
          const ogMsg = (await models.Message.findOne({
            where: { uuid: message.reply_id! },
          })) as MessageRecord
          const tribeMember = (await models.ChatMember.findOne({
            where: {
              contactId: ogMsg.sender,
              tenant: tribe.tenant,
              chatId: tribe.id,
            },
          })) as ChatMemberRecord
          chatMembers.push(tribeMember)
        }

        if (message.type === constants.message_types.direct_payment) {
          const ogMsg = (await models.Message.findOne({
            where: { uuid: message.id! },
          })) as MessageRecord
          const tribeMember = (await models.ChatMember.findOne({
            where: {
              lastAlias: ogMsg.recipientAlias,
              tenant: ogMsg.tenant,
              chatId: ogMsg.chatId,
            },
          })) as ChatMemberRecord
          chatMembers.push(tribeMember)
        }

        if (bot && typeof bot.meta === 'string') {
          for (let j = 0; j < chatMembers.length; j++) {
            const chatMember: ChatMemberRecord = chatMembers[j]
            const rewards: BadgeRewards[] = JSON.parse(bot.meta)
            for (let i = 0; i < rewards.length; i++) {
              const reward = rewards[i]
              let doReward = false
              if (reward.rewardType === constants.reward_types.earned) {
                if (
                  chatMember.totalEarned === reward.amount ||
                  chatMember.totalEarned > reward.amount
                ) {
                  doReward = true
                }
              } else if (reward.rewardType === constants.reward_types.spent) {
                if (
                  chatMember.totalSpent === reward.amount ||
                  chatMember.totalSpent > reward.amount
                ) {
                  doReward = true
                }
              }
              if (doReward) {
                const hasReward = await checkReward(
                  chatMember.contactId,
                  reward.badgeId,
                  tribe.tenant
                )
                if (!hasReward.status) {
                  const badge = await transferBadge({
                    to: hasReward.pubkey,
                    asset: reward.badgeId,
                    amount: 1,
                    memo: '',
                    owner_pubkey: tribe.ownerPubkey,
                    host: 'liquid.sphinx.chat',
                  })
                  if (badge.tx) {
                    const resEmbed = new Sphinx.MessageEmbed()
                      .setAuthor('BagdeBot')
                      .setDescription(
                        `${chatMember.lastAlias} just earned the ${reward.name} badge`
                      )
                    message.channel.send({ embed: resEmbed })
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        sphinxLogger.error(`BADGE BOT ERROR ${error}`, logging.Bots)
      }
    }
  })
}

async function getReward(pubkey: string) {
  const res = await fetch(
    `https://liquid.sphinx.chat/balances?pubkey=${pubkey}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  )
  const results = await res.json()
  return results.balances
}

async function checkReward(
  contactId: number,
  rewardId: number,
  tenant: number
): Promise<{ pubkey?: string; status: boolean }> {
  const contact = (await models.Contact.findOne({
    where: { tenant, id: contactId },
  })) as ContactRecord
  const rewards = await getReward(contact.publicKey)
  for (let i = 0; i < rewards.length; i++) {
    const reward = rewards[i]
    if (reward.asset_id === rewardId) {
      return { status: true }
    }
  }
  return { pubkey: contact.publicKey, status: false }
}

export async function createOrEditBadgeBot(
  chatId: number,
  tenant: number,
  badge: Badge,
  amount: number,
  rewardType: number
): Promise<boolean> {
  try {
    const botExist = (await models.ChatBot.findOne({
      where: { botPrefix: '/badge', chatId },
    })) as ChatBotRecord

    if (botExist) {
      let meta: string = ''
      if (typeof botExist.meta === 'string') {
        let temMeta: BadgeRewards[] = JSON.parse(botExist.meta)
        if (Array.isArray(temMeta)) {
          temMeta.push({
            name: badge.name,
            amount,
            badgeId: badge.id,
            rewardType: rewardType,
          })
          meta = JSON.stringify(temMeta)
        }
      } else {
        let temMeta: BadgeRewards[] = []
        temMeta.push({
          name: badge.name,
          amount,
          badgeId: badge.id,
          rewardType: rewardType,
        })
        meta = JSON.stringify(temMeta)
      }
      await botExist.update({ meta })
      return true
    } else {
      let temMeta: BadgeRewards[] = []
      temMeta.push({
        name: badge.name,
        amount,
        badgeId: badge.id,
        rewardType: rewardType,
      })

      const chatBot: { [k: string]: any } = {
        chatId,
        botPrefix: '/badge',
        botType: constants.bot_types.builtin,
        msgTypes: JSON.stringify([
          constants.message_types.message,
          constants.message_types.boost,
          constants.message_types.direct_payment,
        ]),
        pricePerUse: 0,
        tenant,
        meta: JSON.stringify(temMeta),
      }
      await models.ChatBot.create(chatBot)
      return true
    }
  } catch (error) {
    sphinxLogger.error(`BADGE BOT ERROR ${error}`, logging.Bots)
    return false
  }
}
