import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EnvService } from '@infra/env';
import { configSchemas } from '@infra/persistence/mongoose/schemas/schemas.config';

/**
 * Global module for MongoDB integration using Mongoose.
 * Configures the MongoDB connection and schema registration for use across the entire application.
 */
@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (envService: EnvService) => ({
        uri: envService.get('MONGO_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [EnvService],
    }),
    MongooseModule.forFeature(configSchemas),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
