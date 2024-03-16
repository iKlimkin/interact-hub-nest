export class BlogDtoSqlModel {
  constructor(
    public title: string,
    public description: string,
    public website_url: string,
    public isMembership: boolean = false,
  ) {}
}

export class BlogDtoSASqlModel extends BlogDtoSqlModel {
  public userId: string;
  // public userLogin: string,
}
