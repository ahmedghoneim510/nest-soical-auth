import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding started...');

    // Add your seed logic here. Example:
    // const usersCollection = this.connection.collection('users');
    // await usersCollection.insertMany([
    //   { name: 'Admin', email: 'admin@example.com', role: 'admin' },
    //   { name: 'User', email: 'user@example.com', role: 'user' },
    // ]);

    this.logger.log('Seeding completed.');
  }
}
