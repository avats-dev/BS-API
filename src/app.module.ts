import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactsModule } from './contacts/contacts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'

@Module({
    imports: [
        ConfigModule.forRoot(),
        ContactsModule,
        TypeOrmModule.forRoot({
            type: process.env.DB_TYPE as any,
            host: process.env.PG_HOST,
            port: parseInt(process.env.PG_PORT),
            username: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DB,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            ssl: true,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}
