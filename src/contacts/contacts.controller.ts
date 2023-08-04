import { Controller, Body, Post, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
import { ContactService } from './contacts.service';
import { IdentifyRequestDto, IdentifyResponseDto, ContactResponseDto } from './contacts.dto';
import { Contact } from './contact.entity';
import { HttpExceptionFilter } from './exception.filter';

@Controller('contacts')
@UseFilters(new HttpExceptionFilter)
export class ContactsController {
    constructor (
        private readonly contactService: ContactService,
    ) {}

    @Post('identify')
    async getContacts(@Body() identifyRequestDto: IdentifyRequestDto): Promise<IdentifyResponseDto> {
        try {
            const primaryContact: Contact = await this.contactService.getPrimaryContact(
                identifyRequestDto.phoneNumber,
                identifyRequestDto.email,
            )

            const secondaryContacts: Contact[] = await this.contactService.getAllSecondaryContacts(primaryContact);

            const emails: string[] = secondaryContacts.map((Contact) => Contact.email)
            const phoneNumbers: string[] = secondaryContacts.map((Contact) => Contact.phoneNumber)
            const ids: number[] = secondaryContacts.map((Contact) => Contact.id)

            const contactResponse: ContactResponseDto = {
                primaryContactId: primaryContact.id,
                emails: [primaryContact.email, ...emails],
                phoneNumbers: [primaryContact.phoneNumber, ...phoneNumbers],
                secondaryContactIds: ids,
            };
        
            const response: IdentifyResponseDto = {
                contact: contactResponse,
            };
        
            return response;
        } catch (error) {
            throw new HttpException(
                `Server failed to process the request due to following error: ${error}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
