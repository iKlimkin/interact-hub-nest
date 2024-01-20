import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PathMappings, RouterPaths } from "../utils/routing";

export class BasicAuthorization {
    constructor(protected readonly app: INestApplication) {}
    private application = this.app.getHttpServer();


    async testPostAuthorization (path: PathMappings, expectedStatus: number) {
      await request(this.application)
        .post(`${RouterPaths[path]}`)
        .expect(expectedStatus);
    }
  
    async testPutAuthorization (
      path: PathMappings,
      entityId: string,
      expectedStatus: number
    ) {
      await request(this.application)
        .put(`${RouterPaths[path]}/${entityId}`)
        .expect(expectedStatus);
    }
  
    async testDeleteAuthorization (
      path: PathMappings,
      entityId: number,
      expectedStatus: number
    ) {
      await request(this.application)
        .delete(`${RouterPaths[path]}/${entityId}`)
        .expect(expectedStatus);
    }
}
  