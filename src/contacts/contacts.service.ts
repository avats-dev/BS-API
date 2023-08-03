import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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
    async findPrimaryContact(phoneNumber: string, email: string): Promise<Contact> {
        try {
            const contactByPhoneNumber = await this.contactRepository.findOne({ 
                where: {phoneNumber, linkedTo: IsNull()} 
            })
            const contactByEmail = await this.contactRepository.findOne({ 
                where: {email, linkedTo: IsNull()} 
            })

            if (contactByPhoneNumber==null && contactByEmail==null) {
                return this.createPrimaryContact(phoneNumber, email);
            }
            else if (contactByEmail==null) {
                this.createSecondaryContact(phoneNumber, email, contactByPhoneNumber);
                return contactByPhoneNumber;
            }
            else if (contactByPhoneNumber==null) {
                this.createSecondaryContact(phoneNumber, email, contactByEmail);
                return contactByEmail;
            }
            else if (contactByEmail.id != contactByPhoneNumber.id) {
                return this.convertPrimaryToSecondaryContact(contactByEmail, contactByPhoneNumber);
            }
            else {
                return contactByEmail;
            }
        } catch (err) {
            throw err;
        }  
    }

    async createPrimaryContact(phoneNumber: string, email: string): Promise<Contact> {
        try {
            const newContact = new Contact();
            newContact.phoneNumber = phoneNumber;
            newContact.email = email;
            newContact.linkPrecedence = Precedence.PRIMARY;
            return await this.contactRepository.save(newContact);
        } catch (err) {
            throw err;
        }
    }

    async createSecondaryContact(phoneNumber: string, email: string, primaryContact: Contact): Promise<void> {
        try {
            const newContact = new Contact();
            newContact.phoneNumber = phoneNumber;
            newContact.email = email;
            newContact.linkedTo = primaryContact;
            newContact.linkPrecedence = Precedence.SECONDARY;
            await this.contactRepository.save(newContact);
        } catch (err) {
            throw err;
        }
    }

    async convertPrimaryToSecondaryContact(contactOne: Contact, contactTwo: Contact): Promise<Contact> {
        try {
            if (contactOne.createdAt < contactTwo.createdAt) {
                contactTwo.linkedTo = contactOne;
                contactTwo.linkPrecedence = Precedence.SECONDARY;
                await this.contactRepository.save(contactTwo);
                return contactOne;
            }
            else {
                contactOne.linkedTo = contactTwo;
                contactOne.linkPrecedence = Precedence.SECONDARY;
                await this.contactRepository.save(contactOne);
                return contactTwo;
            }
        } catch (err) {
            throw err;
        }
    }

    async 
}