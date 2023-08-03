/*
Response format
{
    "contact":{
        "primaryContatctId": number,
        "emails": string[], // first element being email of primary contact 
        "phoneNumbers": string[], // first element being phoneNumber of primary contact
        "secondaryContactIds": number[] // Array of all Contact IDs that are "secondary" to the primary contact
    }
}
*/

export class ContactResponseDto {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
}

export class IdentifyResponseDto {
  contacts: ContactResponseDto;
}