import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactsModule } from './contacts/contacts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'
import { type } from 'os';

console.log(process.env.DB_TYPE)
console.log(process.env.PG_HOST)
console.log(process.env.PG_PORT)
console.log(process.env.PG_USER)
console.log(process.env.PG_PASSWORD)
console.log(process.env.PG_DB)


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
