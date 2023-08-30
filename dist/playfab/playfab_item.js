"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayfabItem = void 0;
class PlayfabItem {
    constructor(id, name, type, imageUrl, diceRollRequirement = 0) {
        this.diceRollRequirement = 0;
        this.friendlyId = id;
        this.title = name;
        this.type = type;
        this.imageUrl = imageUrl;
        this.diceRollRequirement = diceRollRequirement;
    }
}
exports.PlayfabItem = PlayfabItem;
