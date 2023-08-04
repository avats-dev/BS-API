import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsController } from './contacts.controller';
import { ContactService } from './contacts.service';
import { Contact } from './contact.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Contact])],
    controllers: [ContactsController],
    providers: [ContactService],
})
export class ContactsModule {}
