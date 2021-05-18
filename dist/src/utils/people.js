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
exports.createProfile = void 0;
const config_1 = require("./config");
const tribes_1 = require("./tribes");
const node_fetch_1 = require("node-fetch");
const config = config_1.loadConfig();
function createProfile({ host, owner_alias, owner_pubkey, owner_route_hint, description, img, tags, price_to_meet, }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = yield tribes_1.genSignedTimestamp(owner_pubkey);
            let protocol = "https";
            if (config.tribes_insecure)
                protocol = "http";
            yield node_fetch_1.default(protocol + "://" + host + "/person?token=" + token, {
                method: "POST",
                body: JSON.stringify({
                    owner_alias,
                    owner_pubkey,
                    owner_route_hint,
                    description,
                    img,
                    tags: tags || [],
                    price_to_meet: price_to_meet || 0,
                }),
                headers: { "Content-Type": "application/json" },
            });
            // const j = await r.json()
        }
        catch (e) {
            console.log("[tribes] unauthorized to declare profile");
            throw e;
        }
    });
}
exports.createProfile = createProfile;
//# sourceMappingURL=people.js.map