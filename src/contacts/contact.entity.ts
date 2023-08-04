import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    DeleteDateColumn, 
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

    @Column({ nullable: true })
    linkedId: number;

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