import { Controller, Body, Post } from '@nestjs/common';
import { ContactService } from './contacts.service';
import { IdentifyRequestDto, IdentifyResponseDto, ContactResponseDto } from './contacts.dto';
import { Contact } from './contact.entity';

@Controller('contacts')
export class ContactsController {
    constructor (
        private readonly contactService: ContactService,
    ) {}

    @Post('identify')
    async getContacts(@Body() identifyRequestDto: IdentifyRequestDto): Promise<IdentifyResponseDto> {
        const primaryContact: Contact = await this.contactService.getPrimaryContact(
            identifyRequestDto.phoneNumber,
            identifyRequestDto.email,
        )

        const secondaryContacts: Contact[] = await this.contactService.getAllSecondaryContacts(primaryContact);
        
        const emailSet: Set<string> = new Set();
        emailSet.add(primaryContact.email);
        const phoneNumberSet: Set<string> = new Set();
        phoneNumberSet.add(primaryContact.phoneNumber);
        const secIds: number[] = [];
        for(const contact of secondaryContacts) {
            emailSet.add(contact.email);
            phoneNumberSet.add(contact.phoneNumber);
            secIds.push(contact.id);
        }

        const contactResponse: ContactResponseDto = {
            primaryContactId: primaryContact.id,
            emails: Array.from(emailSet),
            phoneNumbers: Array.from(phoneNumberSet),
            secondaryContactIds: secIds,
        };
    
        const response: IdentifyResponseDto = {
            contact: contactResponse,
        };
    
        return response;
    }
}
