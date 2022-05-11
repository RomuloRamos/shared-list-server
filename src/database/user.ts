/* This file has the purpose to concentrate all User table querys */
import { PrismaClient,User} from "@prisma/client";
import { PrismaClientValidationError } from "@prisma/client/runtime";
import {LogRegister} from '@src/util/logRegister';
import bcrypt from 'bcrypt';

export type iUser = Omit<User, "id">&{
    id?: number|null
}

export class UserTable{
    
    private pvLog!:LogRegister;

    constructor(protected prisma = new PrismaClient()){
        this.pvLog = new LogRegister();
        this.pvLog.log("returning a new instance...");
    }

    public async create(UserData: iUser): Promise<any>{
        try {        
            UserData.id = undefined;
            const salt = await bcrypt.genSalt();
            const userPass = await bcrypt.hash(UserData.password, salt);
            const result =  await this.prisma.user.create({
               data: {...UserData, id:undefined, password: userPass}
            })
            return result;
        } catch (error:any) {
            this.pvLog.log("ERROR: /n"+ error.message);
            const arrayMessage = error.message?.split("\n\n")
            if(arrayMessage.length >= 3)
                throw new Error(arrayMessage[2]);
            else throw new Error("Invalid insert");    
        }
    }

    public async getOneById(userId: number): Promise<iUser>{
        try {
            const result = await this.prisma.user.findUnique({
                where: {
                    id: userId
                },
            })
            return result as iUser;
        } catch (error:any) {
            this.pvLog.log("ERROR: /n"+ error.message);
            const arrayMessage = error.message?.split("\n\n")
            if(arrayMessage.length >= 3)
                throw new Error(arrayMessage[2]);
            else throw new Error("Invalid search");
        }
    }

    public async getOneByLogin(login: string): Promise<iUser|null>{
        try {
            const result = await this.prisma.user.findUnique({
                where: {
                    login: login
                },
            })
            return result;
        } catch (error:any) {
            const Error = error as PrismaClientValidationError;  
            this.pvLog.log("ERROR: /n"+ Error.message);
            throw Error;
        }
    }

    public async getOneByEmail(email: string): Promise<iUser|null>{
        try {
            const result = await this.prisma.user.findUnique({
                where: {
                    email: email
                },
            })
            return result;
        } catch (error:any) {
            const Error = error as PrismaClientValidationError;  
            this.pvLog.log("ERROR: /n"+ Error.message);
            throw Error;
        }
    }
    
    public async update(UserData: iUser, findBy=0): Promise<any>{
        try {
            let objRule = {};
            this.pvLog.log("findBy: "+findBy);
            if(UserData.password){
                const salt = await bcrypt.genSalt();
                const userPass = await bcrypt.hash(UserData.password, salt);
                UserData.password = userPass;
            }
            if((findBy === 0) && (UserData.id))
            {
                this.pvLog.log("UserData.id: "+UserData.id);
                objRule = {
                    id: UserData.id
                };
            }
            else if((findBy === 1) && (UserData.email))
            {
                this.pvLog.log("UserData.email: "+UserData.email);
                objRule = {
                    email: UserData.email
                };
            }
            else
            {
                throw new Error("Invalid query parameter");
            }
            const result = await this.prisma.user.update({
                where: objRule,
                data: {...UserData, id:undefined},
            })
            .then(result =>{
                this.pvLog.log("Success!");
                return result;
            })
            return result;
        } catch (error:any ) {
            this.pvLog.log(error);
            throw error;
        }
    }

    public async delete(UserData:iUser, findBy=0): Promise<any>{
        let objRule = {};
        if((findBy === 0) && (UserData.id)){
            objRule = {
                id: UserData.id
            };
        }
        else if((findBy === 2) && (UserData.email)){
            objRule = {
                email: UserData.email
            };
        }
        else{
            throw new Error("User.delete->ERROR: Invalid parameter");
        }
        const result = await this.prisma.user.delete({
            where: objRule,
        })
        .then(result =>{
            return result;
        })
        .catch(error =>{
            this.pvLog.log("ERROR: /n"+error.message);
            return error
        });

        return result;
    }

}