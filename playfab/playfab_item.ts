export class PlayfabItem {

    friendlyId: string;
    title: string;
    type: string;
    imageUrl: string;
    diceRollRequirement: number = 0;
    
    constructor(id: string, name: string, type: string, imageUrl: string, diceRollRequirement: number = 0) {
        this.friendlyId = id;
        this.title = name;
        this.type = type;
        this.imageUrl = imageUrl;
        this.diceRollRequirement = diceRollRequirement;
    }
}