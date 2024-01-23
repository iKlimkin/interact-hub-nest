import { ReactionDataModel } from "../../../api/models/input.comment.models";

export class UpdateUserReactionCommand {
    constructor(public inputData: ReactionDataModel) {}
}