export class PlayfabItem {

    friendlyId: string;
    title: string;
    type: string;
    imageUrl: string;
    
    constructor(id: string, name: string, type: string, imageUrl: string) {
        this.friendlyId = id;
        this.title = name;
        this.type = type;
        this.imageUrl = imageUrl;
    }
}