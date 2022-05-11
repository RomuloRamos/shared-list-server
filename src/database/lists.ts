import { PrismaClient,ListsModel } from "@prisma/client";
import {LogRegister} from '@src/util/logRegister';
import { iUser } from "./user";

/* This file has the purpose to concentrate all User table querys */

/**
 * Model Addresses
 */

export type iLists = Omit<ListsModel,'id'>&{
    id?: number|null;
}

export class ListsTable{ //extends PrismaClient {
    
    private pvLog!:LogRegister;

    constructor(protected prisma = new PrismaClient()){
        this.pvLog = new LogRegister();
        this.pvLog.log("returning a new instance...");
    }


    public async create(newList: iLists): Promise<unknown>{
        
        try {
            if(newList.id)
                newList.id = undefined;
            let setupData:any;
            if(newList.authorId){
                setupData = {
                    ...newList, 
                    author:{connect:{id:newList.authorId}}
                }
                setupData.authorId = undefined
            }
            else{
                throw new Error("ERROR: Invalid parameter to author id");
            }
            const result =  await this.prisma.listsModel.create({
                data: setupData
            })
            .then(result =>{
                return result;
            })
            return result;         
        } catch (error:any) {
            this.pvLog.log("ERROR: /n"+ error.message);
            const arrayMessage = error.message?.split("\n\n")
            if(arrayMessage.length >= 3)
                throw new Error(arrayMessage[2]);
            else throw new Error("Invalid insertion");
        }
    }

    public async getOneById(listId: number): Promise<iLists>{
        try {
            const result = await this.prisma.listsModel.findUnique({
                where: {
                    id: listId
                },
                include:{
                    author:{ select:{id: true,name:true,email:true}},
                }
            })
            return result as iLists;
        } catch (error:any) {
            this.pvLog.log("ERROR: /n"+ error.message);
            const arrayMessage = error.message?.split("\n\n")
            if(arrayMessage.length >= 3)
                throw new Error(arrayMessage[2]);
            else throw new Error("Invalid search");
        }
    }

    public async getListsByUser(userId: number): Promise<iLists[]>{
        
        const result = await this.prisma.listsModel.findMany({
        where:{ authorId: userId}
        })
        .then(result =>{
            return result;
        })
        .catch(error =>{
            this.pvLog.log("ERROR: /n"+ error.message);
            return error
        });
        return result as iLists[];
    }


    public async update(newList: iLists): Promise<any>{
        this.pvLog.log(newList);
        try {
            const updateResult = await this.prisma.listsModel.update({
                where: { id: newList.id as number},
                data: {
                    title: newList.title,
                }
            }).then((result) =>{
                this.pvLog.log("Update proccess success!");
                return result;
            })
            .catch((error) =>{
                this.pvLog.log("Database updating process error");
                const updateError = {
                    errorCode: error.code,
                    ...error.meta
                }
                this.pvLog.log(updateError);
                return updateError;
            });
            this.pvLog.log(updateResult);
            return updateResult;
        } catch (error:any) {
            this.pvLog.log("process error");
            this.pvLog.log(error);
            throw error;
        }

    }

    public async delete(listId: number): Promise<any>{
        try {
            const objRule = {
                id: listId 
            };

            const result = await this.prisma.listsModel.delete({
                where: objRule
            })
            .then(result =>{
                return result;
            })
            .catch(error =>{
                this.pvLog.log("ERROR: /n"+ error.message);
                throw error;
            });
            return result;
        } catch (error:any) {
            this.pvLog.log("ERROR: /n"+ error.message);
            const arrayMessage = error.message?.split("\n\n")
            if(arrayMessage.length >= 3)
                throw new Error(arrayMessage[2]);
            else throw new Error("Invalid delete");
        }
    }
}