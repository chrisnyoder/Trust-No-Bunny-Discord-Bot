export class PlayfabItem {

    friendlyId: string;
    title: string;
    type: string;
    imageUrl: string;
    baseProbabilityOfDrop: number = 0.0;
    
    constructor(id: string, name: string, type: string, imageUrl: string, baseProbabilityOfDrop: number = 0.0) {
        this.friendlyId = id;
        this.title = name;
        this.type = type;
        this.imageUrl = imageUrl;
        this.baseProbabilityOfDrop = baseProbabilityOfDrop;
    }
}