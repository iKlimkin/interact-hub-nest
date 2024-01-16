import { validateOrReject } from "class-validator";
import { InputBlogModel } from "../api/models/input.blog.models/create.blog.model";

export const validateOrRejectModel = async (
    model: InputBlogModel,
    ctor: { new (): InputBlogModel },
  ) => {
    if (model instanceof ctor === false) {
      throw new Error('Incorrect input blog data');
    }
    try {
      await validateOrReject(model);
    } catch (error) {
      throw new Error(error);
    }
  };