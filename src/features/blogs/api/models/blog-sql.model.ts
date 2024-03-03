export class BlogDtoSqlModel {
  constructor(
    public title: string,
    public description: string,
    public website_url: string,
    public userId: string,
    public isMembership: boolean = true,
  ) {}
}

export class BlogDtoSASqlModel extends BlogDtoSqlModel {
  public userId: string;
  // public userLogin: string,
}
