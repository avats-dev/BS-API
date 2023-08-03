import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    DeleteDateColumn, 
    ManyToOne, 
    JoinColumn,
} from 'typeorm';

/*
id                   Int                   
phoneNumber          String?
email                String?
linkedId             Int? // the ID of another Contact linked to this one
linkPrecedence       "secondary"|"primary" // "primary" if it's the first Contact in the link
createdAt            DateTime
updatedAt            DateTime  
deletedAt            DateTime?
*/

export enum Precedence {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
}

@Entity()
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    phoneNumber: string;

    @Column()
    email: string;

    @ManyToOne(() => Contact, contact => contact.id, { nullable: true })
    @JoinColumn({name: 'linkedToId' })
    linkedTo: Contact;

    @Column({
        type: 'enum',
        enum: Precedence,
        default: Precedence.PRIMARY
    })
    linkPrecedence: Precedence;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}