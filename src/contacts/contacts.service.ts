import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, Precedence } from './contact.entity';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>,
    ) {}

    /*
    Find primary contact based on email and phoneNumber.

    If we find both to be null, then we create a new primary contact with the attributes and return the response.

    If either of them is null, we create this new secondary contact and attach it to another one which would be primary
    in this scenario.

    If both aren't null and doesn't have same id, then we need to make later created contact secondary and attach it to 
    other one as there can't be two primary contacts with similar attributes.

    If both aren't null and have same id, then we just create the response and return it treating it to primary contact.
    */
    async getPrimaryContact(phoneNumber?: string, email?: string): Promise<Contact> {
        if (!email && !phoneNumber) {
            const badRequestErrorMessage = "Invalid request! Please provide either a valid PhoneNumber or Email."
            throw new HttpException(badRequestErrorMessage, HttpStatus.BAD_REQUEST);
        }
        else if (!email) {
            const primaryContact: Contact = await this.getPrimaryContactByPhone(phoneNumber)
            if (!primaryContact) {
                throw new HttpException(
                    "No contacts exist with this PhoneNumber.",
                    HttpStatus.NOT_FOUND,
                )
            }
            else {
                return primaryContact;
            }
        }
        else if (!phoneNumber) {
            const primaryContact: Contact = await this.getPrimaryContactByEmail(email)
            if (!primaryContact) {
                throw new HttpException(
                    "No contacts exist with this Email.",
                    HttpStatus.NOT_FOUND,
                )
            }
            else {
                return primaryContact;
            }
        }
        else {
            const contactByPhoneNumber = await this.getPrimaryContactByPhone(phoneNumber);
            const contactByEmail = await this.getPrimaryContactByEmail(email);

            if (!contactByPhoneNumber && !contactByEmail) {
                return await this.createPrimaryContact(phoneNumber, email);
            }
            else if (!contactByEmail) {
                await this.createSecondaryContact(phoneNumber, email, contactByPhoneNumber);
                return contactByPhoneNumber;
            }
            else if (!contactByPhoneNumber) {
                await this.createSecondaryContact(phoneNumber, email, contactByEmail);
                return contactByEmail;
            }
            else if (contactByEmail.id != contactByPhoneNumber.id) {
                return await this.convertPrimaryToSecondaryContact(contactByEmail, contactByPhoneNumber);
            }
            else {
                return contactByEmail;
            }
        }
    }

    /*
    Following methods are used if either of phoneNumber or email is null in request

    Then, we are just returing a response without any update in db as it is not a valid combination for updation 
    and assuming that user is just trying to fetch values
    */
    async getPrimaryContactByPhone(phoneNumber: string): Promise<Contact> {
        try {
            const contactByPhoneNumber = await this.contactRepository.findOne({ 
                where: { phoneNumber, linkPrecedence: Precedence.PRIMARY }
            })
            if (!contactByPhoneNumber) {
                const secondaryContact = await this.contactRepository.findOne({
                    where: { phoneNumber }
                })
                if (!secondaryContact) {
                    return secondaryContact;
                }
                else {
                    return await this.contactRepository.findOneById(secondaryContact.linkedId);
                }
            }
            else {
                return contactByPhoneNumber;
            }
        } catch (err) {
            throw new HttpException(
                `Served failed to respond due to ${err}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getPrimaryContactByEmail(email: string): Promise<Contact> {
        try {
            const contactByEmail = await this.contactRepository.findOne({ 
                where: { email, linkPrecedence: Precedence.PRIMARY } 
            })
            if (!contactByEmail) {
                const secondaryContact = await this.contactRepository.findOne({
                    where: { email }
                })
                if (!secondaryContact) {
                    return secondaryContact;
                }
                else {
                    return await this.contactRepository.findOneById(secondaryContact.linkedId);
                }
            }
            else {
                return contactByEmail;
            }
        } catch (err) {
            throw new HttpException(
                `Served failed to respond due to ${err}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /*
    Other methods for iteracting with postgres
    */
    async createPrimaryContact(phoneNumber: string, email: string): Promise<Contact> {
        try {
            const newContact = new Contact();
            newContact.phoneNumber = phoneNumber;
            newContact.email = email;
            newContact.linkPrecedence = Precedence.PRIMARY;
            return await this.contactRepository.save(newContact);
        } catch (err) {
            throw new HttpException(
                `Served failed to respond due to ${err}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async createSecondaryContact(phoneNumber: string, email: string, primaryContact: Contact): Promise<void> {
        try {
            const newContact = new Contact();
            newContact.phoneNumber = phoneNumber;
            newContact.email = email;
            newContact.linkedId = primaryContact.id;
            newContact.linkPrecedence = Precedence.SECONDARY;
            await this.contactRepository.save(newContact);
        } catch (err) {
            throw new HttpException(
                `Served failed to respond due to ${err}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async convertPrimaryToSecondaryContact(contactOne: Contact, contactTwo: Contact): Promise<Contact> {
        try {
            if (contactOne.createdAt < contactTwo.createdAt) {
                contactTwo.linkedId = contactOne.id;
                contactTwo.linkPrecedence = Precedence.SECONDARY;
                await this.contactRepository.save(contactTwo);
                await this.changeLinkedIdMapping(contactTwo, contactOne);
                return contactOne;
            }
            else {
                contactOne.linkedId = contactTwo.id;
                contactOne.linkPrecedence = Precedence.SECONDARY;
                await this.contactRepository.save(contactOne);
                await this.changeLinkedIdMapping(contactOne, contactTwo);
                return contactTwo;
            }
        } catch (err) {
            throw new HttpException(
                `Served failed to respond due to ${err}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async changeLinkedIdMapping(previousPrimaryContact: Contact, newPrimaryContact: Contact): Promise<void> {
        // change mapping of other contacts which previously pointed to old primary contact
        const secContacts: Contact[] = await this.getAllSecondaryContacts(previousPrimaryContact);
        for(const contact of secContacts) {
            contact.linkedId = newPrimaryContact.id;
            await this.contactRepository.save(contact);
        }
    }

    async getAllSecondaryContacts(primaryContact: Contact): Promise<Contact[]> {
        try {
            const primaryContactId = primaryContact.id;
            return await this.contactRepository
                .createQueryBuilder('contact')
                .where('contact.linkedId = :primaryContactId', { primaryContactId })
                .getMany();
        } catch (err) {
            throw new HttpException(
                `Served failed to respond due to ${err}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}