/* This file has the purpose to concentrate all Itens table queries*/
import { PrismaClient,Items } from "@prisma/client";
import {LogRegister} from '@src/util/logRegister';

/**
 * Model Itens
 */

 
export type iItens = Omit<Items, 'id'> & { 
    id?: number, 
};

export class ItensTable{ 
    
    private pvLog!:LogRegister;

    constructor(protected prisma = new PrismaClient()){
        this.pvLog = new LogRegister();
        this.pvLog.log("returning a new instance...");
    }


    public async create(itensInformation: iItens): Promise<iItens>{
        
        try {
            if(itensInformation.id)
                itensInformation.id = undefined;
            if(!itensInformation.listId && !itensInformation.parentId) throw new Error("An Item should to belong to a List or an Item Parent")
            const setupData = itensInformation.listId?
            {
                ...itensInformation,
                id: undefined,
                listId: undefined,
                ownerId:undefined,
                // parentId:undefined,
                owner: {connect:{id:itensInformation.ownerId}},
                list: {connect:{id:itensInformation.listId}},
            }
            :
            {
                ...itensInformation,
                id: undefined, 
                ownerId: undefined,
                listId: undefined,
                owner: {connect:{id:itensInformation.ownerId}}
            }
            if(setupData.parentId){
                const result =  await this.prisma.items.findUnique({
                    where:{id:setupData.parentId}
                })
                .then(result =>{
                    if(!result){
                        throw new Error("Item parent not exist")
                    }
                })                
            }
            const result =  await this.prisma.items.create({
                data: setupData
            })
            .then(result =>{
                return result;
            })
            return result;
            
        } catch (error) {
            this.pvLog.log("ERROR: /n"+ error);
            throw error;
        }
    }

    public async getOneById(itemId: number): Promise<iItens|null>{
        try {
            const result = await this.prisma.items.findUnique({
                where: {
                    id: itemId
                },
            })
            .then(result =>{
                return result;
            })
            return result;
        } catch (error:any) {
            this.pvLog.log("ERROR: /n"+ error.message);
            throw error
        };
    }

    public async getByList(listId: number): Promise<iItens[]>{
        try {
            const result = await this.prisma.items.findMany({
                where: {
                    listId:listId    
                },
            })
            .then(result =>{
                return result;
            })
            return result;
        } catch (error:any) {
            this.pvLog.log("ERROR: /n"+ error.message);
            throw error
        };
    }

    public async getByOwner(ownerId: number): Promise<iItens[]>{
        
        try {
            const result = await this.prisma.items.findMany({
                where: {
                    ownerId:ownerId    
                },
            })
            .then(result =>{
                return result;
            })
            return result;
        } catch (error:any) {
            this.pvLog.log("ERROR: /n"+ error.message);
            throw error
        };
    }

    public async update(itemInformation: iItens): Promise<Items>{
        try {        
            if (itemInformation.id)
            {
                const objRule = {
                    id: itemInformation.id 
                };
                delete itemInformation.id;
                const result = await this.prisma.items.update({
                    where: objRule,
                    data: {...itemInformation}
                })
                .then(result =>{
                    return result;
                })
                return result;
            }
            else{
                throw new Error("Invalid parameter");
            }
        } catch (error:any) {
            this.pvLog.log("ERROR: /n"+ error.message);
            throw error
        };
    }

    public async delete(itemId: number): Promise<any>{
        try {
            const objRule = {
                id: itemId 
            };
            const result = await this.prisma.items.delete({
                where: objRule
            })
            .then(result =>{
                return result;
            })
            return result;
        } catch (error:any) {
            this.pvLog.log("ERROR: /n"+ error.message);
            throw error
        };
    }
}
