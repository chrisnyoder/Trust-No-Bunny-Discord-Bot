"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayfabItem = void 0;
class PlayfabItem {
    constructor(id, name, type, imageUrl) {
        this.friendlyId = id;
        this.title = name;
        this.type = type;
        this.imageUrl = imageUrl;
    }
}
exports.PlayfabItem = PlayfabItem;
