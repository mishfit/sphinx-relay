"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeBotTest = void 0;
const ava_1 = require("ava");
const nodes_1 = require("../nodes");
const del_1 = require("../utils/del");
const save_1 = require("../utils/save");
const get_1 = require("../utils/get");
const msg_1 = require("../utils/msg");
const bots_1 = require("../utils/bots");
const helpers_1 = require("../utils/helpers");
const msg_2 = require("../utils/msg");
/*
npx ava src/tests/controllers/badgeBot.test.ts --verbose --serial --timeout=2m
*/
(0, ava_1.default)('test badge bot: create tribe, join tribe, send messages, boost messages, leave tribe, delete tribe', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield badgeBotTest(t, 0, 1, 2);
}));
function badgeBotTest(t, index1, index2, index3) {
    return __awaiter(this, void 0, void 0, function* () {
        let node1 = nodes_1.default[index1];
        let node2 = nodes_1.default[index2];
        let node3 = nodes_1.default[index3];
        console.log(`${node1.alias} and ${node2.alias} and ${node3.alias}`);
        //NODE1 CREATES A TRIBE
        let tribe = yield (0, save_1.createTribe)(t, node1);
        t.truthy(tribe, 'tribe should have been created by node1');
        //NODE2 JOINS TRIBE CREATED BY NODE1
        if (node1.routeHint)
            tribe.owner_route_hint = node1.routeHint;
        let join = yield (0, save_1.joinTribe)(t, node2, tribe);
        t.true(join, 'node2 should join tribe');
        //NODE1 SENDS A BOT HELP MESSAGE IN TRIBE
        const text = '/bot help';
        yield (0, msg_1.sendTribeMessage)(t, node1, tribe, text);
        //NODE1 AWAIT REPLY FROM BOT
        let botAlias = 'MotherBot';
        const botReply = yield (0, get_1.getCheckBotMsg)(t, node1, botAlias);
        t.truthy(botReply, 'MotherBot should reply');
        //NODE1 SENDS A BOT INSTALL MESSAGE IN TRIBE
        const text2 = '/bot install badge';
        yield (0, msg_1.sendTribeMessage)(t, node1, tribe, text2);
        //NODE1 AWAIT REPLY FROM BOT
        botAlias = 'MotherBot';
        const botReply2 = yield (0, get_1.getCheckBotMsg)(t, node1, botAlias);
        t.truthy(botReply2, 'MotherBot should reply');
        // NODE1 CREATES A BADGE THROUGH THE ENPOINT
        const earnBadge = yield (0, bots_1.createBadge)(t, node1, tribe, 1, 10, 'Earn');
        t.truthy(earnBadge, 'Badge should be created by Node1');
        // NODE1 CREATES A BADGE DDIRECTLY FROM MESSAGE
        const createSpendBadge = '/badge create Spending 10 20 2 spend-badge';
        yield (0, msg_1.sendTribeMessage)(t, node1, tribe, createSpendBadge);
        // const spendBadge = await createBadge(t, node1, tribe, 2, 20, 'Spend')
        // t.truthy(spendBadge, 'Badge should be created by Node1')
        //NODE3 JOINS TRIBE CREATED BY NODE1
        if (node1.routeHint)
            tribe.owner_route_hint = node1.routeHint;
        let join2 = yield (0, save_1.joinTribe)(t, node3, tribe);
        t.true(join2, 'node3 should join tribe');
        // await sleep(1000)
        //NODE2 SENDS A MESSAGE IN THE TRIBE AND NODE3 CHECKS TO SEE IF THEY RECEIVED THE MESSAGE
        const text3 = (0, helpers_1.randomText)();
        let tribeMessage1 = yield (0, msg_2.sendTribeMessageAndCheckDecryption)(t, node2, node3, text3, tribe);
        t.truthy(tribeMessage1, 'node2 should send message to tribe');
        //NODE3 SENDS A BOOST ON NODE2'S MESSAGE
        const boost3 = yield (0, msg_2.sendBoost)(t, node3, node2, tribeMessage1, 15, tribe);
        t.true(boost3.success);
        const payment = yield (0, msg_2.sendTribeDirectPayment)(t, node3, node2, tribeMessage1, 15, tribe);
        t.true(payment.success, 'DIrect Payment in tribe should be successful');
        yield (0, helpers_1.sleep)(5000);
        // CHECK IF NODE2 ACTUALLY RECIEVED THE BAGDE ON THE ELEMENT SERVER
        const confirm = yield (0, bots_1.confirmBadge)(node2, earnBadge.response.id);
        t.true(confirm, 'Node 2 should recieve the earner badge');
        yield (0, helpers_1.sleep)(1000);
        // CHECK IF NODE3 ACTUALLY RECIEVED THE BAGDE ON THE ELEMENT SERVER
        // const confirm1 = await confirmBadgeCreatedThroughMessage(node3, tribe.id)
        // console.log(confirm1)
        // const confirm1 = await confirmBadge(node3, spendBadge.response.id)
        // t.true(confirm1, 'Node 3 should recieve the spender badge')
        //NODE2 LEAVES TRIBE
        let left2 = yield (0, del_1.leaveTribe)(t, node2, tribe);
        t.true(left2, 'node2 should leave tribe');
        //NODE3 LEAVES TRIBE
        let left3 = yield (0, del_1.leaveTribe)(t, node3, tribe);
        t.true(left3, 'node3 should leave tribe');
        //NODE1 DELETES TRIBE
        let delTribe2 = yield (0, del_1.deleteTribe)(t, node1, tribe);
        t.true(delTribe2, 'node1 should delete tribe');
    });
}
exports.badgeBotTest = badgeBotTest;
//# sourceMappingURL=badgeBot.test.js.map