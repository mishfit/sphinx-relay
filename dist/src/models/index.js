"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringCall = exports.TribeBadge = exports.Badge = exports.ContentFeedStatus = exports.CallRecording = exports.ActionHistory = exports.RequestsTransportTokens = exports.BotMember = exports.Lsat = exports.MediaKey = exports.Accounting = exports.Bot = exports.Timer = exports.ChatBot = exports.Subscription = exports.Invite = exports.ChatMember = exports.Message = exports.Chat = exports.Contact = exports.models = exports.sequelize = void 0;
// parse BIGINTs to number
const pg = require("pg");
pg.defaults.parseInt8 = true;
const sequelize_typescript_1 = require("sequelize-typescript");
const path = require("path");
const chat_1 = require("./sql/chat");
exports.Chat = chat_1.default;
const contact_1 = require("./sql/contact");
exports.Contact = contact_1.default;
const invite_1 = require("./sql/invite");
exports.Invite = invite_1.default;
const message_1 = require("./sql/message");
exports.Message = message_1.default;
const subscription_1 = require("./sql/subscription");
exports.Subscription = subscription_1.default;
const mediaKey_1 = require("./sql/mediaKey");
exports.MediaKey = mediaKey_1.default;
const chatMember_1 = require("./sql/chatMember");
exports.ChatMember = chatMember_1.default;
const timer_1 = require("./sql/timer");
exports.Timer = timer_1.default;
const bot_1 = require("./sql/bot");
exports.Bot = bot_1.default;
const chatBot_1 = require("./sql/chatBot");
exports.ChatBot = chatBot_1.default;
const botMember_1 = require("./sql/botMember");
exports.BotMember = botMember_1.default;
const accounting_1 = require("./sql/accounting");
exports.Accounting = accounting_1.default;
const lsat_1 = require("./sql/lsat");
exports.Lsat = lsat_1.default;
const requestsTransportTokens_1 = require("./sql/requestsTransportTokens");
exports.RequestsTransportTokens = requestsTransportTokens_1.default;
const minimist = require("minimist");
const config_1 = require("../utils/config");
const proxy_1 = require("../utils/proxy");
const fs_1 = require("fs");
const actionHistory_1 = require("./sql/actionHistory");
exports.ActionHistory = actionHistory_1.default;
const callRecording_1 = require("./sql/callRecording");
exports.CallRecording = callRecording_1.default;
const contentFeedStatus_1 = require("./sql/contentFeedStatus");
exports.ContentFeedStatus = contentFeedStatus_1.default;
const badge_1 = require("./sql/badge");
exports.Badge = badge_1.default;
const tribeBadge_1 = require("./sql/tribeBadge");
exports.TribeBadge = tribeBadge_1.default;
const recurringCall_1 = require("./sql/recurringCall");
exports.RecurringCall = recurringCall_1.default;
const argv = minimist(process.argv.slice(2));
const configFile = argv.db
    ? path.resolve(process.cwd(), argv.db)
    : path.join(__dirname, '../../config/config.json');
const env = process.env.NODE_ENV || 'development';
let config;
const dialect = process.env.DB_DIALECT;
const storage = process.env.DB_STORAGE;
if (dialect && storage) {
    config = {
        dialect,
        storage,
    };
}
else {
    config = JSON.parse((0, fs_1.readFileSync)(configFile).toString())[env];
}
const appConfig = (0, config_1.loadConfig)();
const opts = Object.assign(Object.assign({}, config), { logging: appConfig.sql_log === 'true' ? console.log : false, models: [
        chat_1.default,
        contact_1.default,
        invite_1.default,
        message_1.default,
        subscription_1.default,
        mediaKey_1.default,
        chatMember_1.default,
        timer_1.default,
        bot_1.default,
        chatBot_1.default,
        botMember_1.default,
        accounting_1.default,
        lsat_1.default,
        requestsTransportTokens_1.default,
        actionHistory_1.default,
        callRecording_1.default,
        contentFeedStatus_1.default,
        badge_1.default,
        tribeBadge_1.default,
        recurringCall_1.default,
    ] });
if ((0, proxy_1.isProxy)()) {
    opts.pool = {
        max: 7,
        min: 2,
        acquire: 30000,
        idle: 10000,
    };
}
const sequelize = new sequelize_typescript_1.Sequelize(opts);
exports.sequelize = sequelize;
const models = sequelize.models;
exports.models = models;
//# sourceMappingURL=index.js.map