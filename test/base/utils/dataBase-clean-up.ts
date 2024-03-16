import { INestApplication } from '@nestjs/common';
import { RouterPaths } from './routing';
import request from 'supertest';
import { Connection } from 'mongoose';

export const dropDataBase = async (app: INestApplication) => {
  await request(app.getHttpServer()).delete(`${RouterPaths.test}`)
}

export const deleteAllData = async (databaseConnection: Connection) => {
  await databaseConnection.collection('users').deleteMany();
  await databaseConnection.collection('blogs').deleteMany();
  await databaseConnection.collection('posts').deleteMany();
  await databaseConnection.collection('comments').deleteMany();
  await databaseConnection.collection('comments').deleteMany();
  await databaseConnection.collection('security').deleteMany();
  await databaseConnection.collection('auth').deleteMany();
};


